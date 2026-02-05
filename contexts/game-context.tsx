/**
 * Game Context - Manages game state across all screens
 */

import {
    getRandomImposterIndex,
    getRandomWordPair,
    type Category
} from '@/data/game-data';
import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

// --- Types ---

export type Player = {
    id: string;
    name: string;
    score: number;
    isImposter: boolean;
    isDead: boolean; // For future elimination logic
};

export enum GamePhase {
    SETUP,      // Lobby
    REVEAL,     // Passing phone
    DISCUSSION, // Timer running
    VOTING,     // Casting votes
    RESULTS     // Round summary
}

interface GameState {
    // Game config
    players: Player[];
    selectedCategories: Category[];
    randomizeStartingPlayer: boolean;

    // Round state
    phase: GamePhase;
    roundNumber: number;
    realWord: string;
    imposterWord: string;
    imposterIndex: number;
    currentPlayerIndex: number; // For reveal / voting turns
    startingPlayerIndex: number | null; // Index of player who starts
    revealedPlayers: boolean[]; // Track who has seen their role
    votes: Record<string, string>; // voterId -> targetId
}

interface GameContextValue extends GameState {
    // Setup actions
    addPlayer: (name: string) => void;
    removePlayer: (id: string) => void;
    updatePlayerName: (id: string, name: string) => void;
    toggleCategory: (category: Category) => void;
    setRandomizeStartingPlayer: (value: boolean) => void;

    // Game flow
    startGame: () => void;
    revealWord: (playerIndex: number) => void;
    nextPlayerReveal: () => void;
    startDiscussion: () => void;
    castVote: (voterId: string, targetId: string) => void;
    submitVotes: () => void; // Calculate results
    nextRound: () => void;
    endGame: () => void;

    // Helpers
    getPlayerWord: (playerIndex: number) => string;
}

// --- Initial State ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const createInitialPlayers = (count: number): Player[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: generateId(),
        name: `Player ${i + 1}`,
        score: 0,
        isImposter: false,
        isDead: false
    }));
};

const initialState: GameState = {
    players: createInitialPlayers(4),
    selectedCategories: [],
    randomizeStartingPlayer: true,

    phase: GamePhase.SETUP,
    roundNumber: 1,
    realWord: '',
    imposterWord: '',
    imposterIndex: -1,
    currentPlayerIndex: 0,
    startingPlayerIndex: null,
    revealedPlayers: [],
    votes: {},
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<GameState>(initialState);

    // --- Setup Actions ---

    const addPlayer = useCallback((name: string) => {
        setState(prev => ({
            ...prev,
            players: [
                ...prev.players,
                {
                    id: generateId(),
                    name: name || `Player ${prev.players.length + 1}`,
                    score: 0,
                    isImposter: false,
                    isDead: false
                }
            ]
        }));
    }, []);

    const removePlayer = useCallback((id: string) => {
        setState(prev => {
            if (prev.players.length <= 3) return prev; // Min 3 players
            return {
                ...prev,
                players: prev.players.filter(p => p.id !== id)
            };
        });
    }, []);

    const updatePlayerName = useCallback((id: string, name: string) => {
        setState(prev => ({
            ...prev,
            players: prev.players.map(p =>
                p.id === id ? { ...p, name } : p
            )
        }));
    }, []);

    const toggleCategory = useCallback((category: Category) => {
        setState(prev => {
            const isSelected = prev.selectedCategories.some(c => c.id === category.id);
            return {
                ...prev,
                selectedCategories: isSelected
                    ? prev.selectedCategories.filter(c => c.id !== category.id)
                    : [...prev.selectedCategories, category]
            };
        });
    }, []);

    const setRandomizeStartingPlayer = useCallback((value: boolean) => {
        setState(prev => ({ ...prev, randomizeStartingPlayer: value }));
    }, []);

    // --- Game Logic ---

    const startGame = useCallback(() => {
        if (state.selectedCategories.length === 0) return;

        setState(prev => {
            // 1. Pick Category & Words
            const randomCategory = prev.selectedCategories[
                Math.floor(Math.random() * prev.selectedCategories.length)
            ];
            const { realWord, imposterWord } = getRandomWordPair(randomCategory);

            // 2. Assign Roles
            const imposterIndex = getRandomImposterIndex(prev.players.length);
            const playersWithRoles = prev.players.map((p, i) => ({
                ...p,
                isImposter: i === imposterIndex,
                isDead: false
            }));

            // 3. Pick Starting Player
            const startingPlayerIndex = prev.randomizeStartingPlayer
                ? Math.floor(Math.random() * prev.players.length)
                : null;

            return {
                ...prev,
                phase: GamePhase.REVEAL,
                players: playersWithRoles,
                realWord,
                imposterWord,
                imposterIndex,
                currentPlayerIndex: 0,
                startingPlayerIndex,
                revealedPlayers: new Array(prev.players.length).fill(false),
                votes: {}
            };
        });
    }, [state.selectedCategories, state.players.length, state.randomizeStartingPlayer]);

    const revealWord = useCallback((playerIndex: number) => {
        setState(prev => {
            const newRevealed = [...prev.revealedPlayers];
            newRevealed[playerIndex] = true;
            return { ...prev, revealedPlayers: newRevealed };
        });
    }, []);

    const nextPlayerReveal = useCallback(() => {
        setState(prev => {
            const nextIndex = prev.currentPlayerIndex + 1;
            if (nextIndex >= prev.players.length) {
                // All revealed, go to discussion
                return {
                    ...prev,
                    phase: GamePhase.DISCUSSION,
                    currentPlayerIndex: 0 // Reset for other phases
                };
            }
            return {
                ...prev,
                currentPlayerIndex: nextIndex
            };
        });
    }, []);

    const startDiscussion = useCallback(() => {
        setState(prev => ({ ...prev, phase: GamePhase.VOTING }));
    }, []);

    const castVote = useCallback((voterId: string, targetId: string) => {
        setState(prev => ({
            ...prev,
            votes: {
                ...prev.votes,
                [voterId]: targetId
            }
        }));
    }, []);

    const submitVotes = useCallback(() => {
        setState(prev => {
            // Tally votes
            const voteCounts: Record<string, number> = {};
            Object.values(prev.votes).forEach(targetId => {
                voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
            });

            // Find most voted
            let maxVotes = 0;
            let mostVotedId: string | null = null;
            let isTie = false;

            Object.entries(voteCounts).forEach(([id, count]) => {
                if (count > maxVotes) {
                    maxVotes = count;
                    mostVotedId = id;
                    isTie = false;
                } else if (count === maxVotes) {
                    isTie = true;
                }
            });

            // Update Scores
            const imposterId = prev.players[prev.imposterIndex].id;
            const isImposterCaught = mostVotedId === imposterId && !isTie;

            const updatedPlayers = prev.players.map(p => {
                let points = 0;
                if (isImposterCaught) {
                    // Town wins: +1 for everyone who voted for imposter
                    if (prev.votes[p.id] === imposterId) {
                        points = 1;
                    }
                    if (p.isImposter) points = 0; // Imposter gets nothing
                } else {
                    // Imposter wins: +2 points
                    if (p.isImposter) {
                        points = 2;
                    }
                }
                return { ...p, score: p.score + points };
            });

            return {
                ...prev,
                players: updatedPlayers,
                phase: GamePhase.RESULTS
            };
        });
    }, []);

    const nextRound = useCallback(() => {
        // Just like start game but keep scores
        if (state.selectedCategories.length === 0) return;

        setState(prev => {
            const randomCategory = prev.selectedCategories[
                Math.floor(Math.random() * prev.selectedCategories.length)
            ];
            const { realWord, imposterWord } = getRandomWordPair(randomCategory);
            const imposterIndex = getRandomImposterIndex(prev.players.length);

            const playersWithNewRoles = prev.players.map((p, i) => ({
                ...p,
                isImposter: i === imposterIndex,
                isDead: false
            }));

            const startingPlayerIndex = prev.randomizeStartingPlayer
                ? Math.floor(Math.random() * prev.players.length)
                : null;

            return {
                ...prev,
                phase: GamePhase.REVEAL,
                roundNumber: prev.roundNumber + 1,
                players: playersWithNewRoles,
                realWord,
                imposterWord,
                imposterIndex,
                currentPlayerIndex: 0,
                startingPlayerIndex,
                revealedPlayers: new Array(prev.players.length).fill(false),
                votes: {}
            };
        });
    }, [state.selectedCategories]);

    const endGame = useCallback(() => {
        setState(prev => ({
            ...initialState,
            // Reset to defaults but keep players if we want? 
            // For now full reset is safer 
            players: createInitialPlayers(4),
            selectedCategories: prev.selectedCategories, // Keep selection
            randomizeStartingPlayer: prev.randomizeStartingPlayer,
        }));
    }, []);

    const getPlayerWord = useCallback((playerIndex: number) => {
        return playerIndex === state.imposterIndex ? state.imposterWord : state.realWord;
    }, [state.imposterIndex, state.imposterWord, state.realWord]);

    const value: GameContextValue = {
        ...state,
        addPlayer,
        removePlayer,
        updatePlayerName,
        toggleCategory,
        setRandomizeStartingPlayer,
        startGame,
        revealWord,
        nextPlayerReveal,
        startDiscussion,
        castVote,
        submitVotes,
        nextRound,
        endGame,
        getPlayerWord,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
