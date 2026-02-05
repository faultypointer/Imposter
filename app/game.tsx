/**
 * Active Game Screen - Handles Discussion, Voting, and Results phases
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { GamePhase, useGame } from '@/contexts/game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function GameScreen() {
    const tint = useThemeColor({}, 'tint');
    const { phase } = useGame();

    // Redirect based on game phase
    useEffect(() => {
        if (phase === GamePhase.SETUP) {
            router.replace('/');
        } else if (phase === GamePhase.REVEAL) {
            router.replace('/reveal');
        }
    }, [phase]);

    return (
        <ThemedView style={styles.container}>
            {phase === GamePhase.DISCUSSION && <DiscussionView />}
            {phase === GamePhase.VOTING && <VotingView />}
            {phase === GamePhase.RESULTS && <ResultsView />}
        </ThemedView>
    );
}

// --- Sub-Views ---

function DiscussionView() {
    const tint = useThemeColor({}, 'tint');
    const { selectedCategories, players, startDiscussion } = useGame();
    // Use first selected category for display if multiple
    const displayCategory = selectedCategories[0];

    // Simple timer logic could go here, for now just a manual start vote
    return (
        <View style={styles.phaseContainer}>
            <View style={styles.header}>
                <ThemedText style={styles.phaseTitle}>🗣️ Discussion</ThemedText>
                <ThemedText style={styles.phaseSubtitle}>
                    Find the imposter among {players.length} players!
                </ThemedText>
            </View>

            <View style={styles.card}>
                <ThemedText style={styles.cardLabel}>Category</ThemedText>
                <ThemedText style={styles.cardValue}>
                    {displayCategory?.icon} {displayCategory?.name}
                    {selectedCategories.length > 1 && ` +${selectedCategories.length - 1}`}
                </ThemedText>
            </View>

            <ScrollView style={styles.playerList} contentContainerStyle={styles.listContent}>
                {players.map(p => (
                    <View key={p.id} style={styles.playerItem}>
                        <View style={[styles.avatar, { backgroundColor: 'rgba(128,128,128,0.1)' }]}>
                            <ThemedText style={styles.avatarText}>{p.name[0]}</ThemedText>
                        </View>
                        <ThemedText style={styles.playerName}>{p.name}</ThemedText>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    style={[styles.actionButton, { backgroundColor: tint }]}
                    onPress={startDiscussion} // Moves to VOTING
                >
                    <ThemedText style={styles.buttonText} lightColor="#fff" darkColor="#fff">
                        🗳️ Start Voting
                    </ThemedText>
                </Pressable>
            </View>
        </View>
    );
}

function VotingView() {
    const tint = useThemeColor({}, 'tint');
    const { players, votes, castVote, submitVotes } = useGame();
    const [selectedVoter, setSelectedVoter] = useState<string | null>(players[0]?.id || null);

    const handleVote = (targetId: string) => {
        if (!selectedVoter) return;
        castVote(selectedVoter, targetId);
    };

    const isAllVoted = players.every(p => votes[p.id]);

    return (
        <View style={styles.phaseContainer}>
            <View style={styles.header}>
                <ThemedText style={styles.phaseTitle}>🗳️ Time to Vote</ThemedText>
                <ThemedText style={styles.phaseSubtitle}>
                    Tap a player to vote for them as the Imposter.
                </ThemedText>
            </View>

            {/* Voter Selector (for local pass-and-play style or host-entry) */}
            <View style={styles.voterSelector}>
                <ThemedText style={styles.selectorLabel}>Who is voting?</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.voterScroll}>
                    {players.map(p => {
                        const hasVoted = !!votes[p.id];
                        const isSelected = selectedVoter === p.id;
                        return (
                            <Pressable
                                key={p.id}
                                onPress={() => setSelectedVoter(p.id)}
                                style={[
                                    styles.voterChip,
                                    isSelected && { backgroundColor: tint, borderColor: tint },
                                    hasVoted && !isSelected && styles.voterChipDone
                                ]}
                            >
                                <ThemedText
                                    style={[
                                        styles.voterName,
                                        isSelected && { color: '#fff' },
                                        hasVoted && !isSelected && { opacity: 0.5 }
                                    ]}
                                >
                                    {p.name} {hasVoted ? '✓' : ''}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            <ThemedText style={styles.votePrompt}>
                {selectedVoter
                    ? `${players.find(p => p.id === selectedVoter)?.name} votes for:`
                    : 'Select a voter first'}
            </ThemedText>

            <ScrollView style={styles.list} contentContainerStyle={styles.voteGrid}>
                {players.filter(p => p.id !== selectedVoter).map(p => (
                    <Pressable
                        key={p.id}
                        onPress={() => selectedVoter && handleVote(p.id)}
                        style={[
                            styles.voteTarget,
                            votes[selectedVoter!] === p.id && { borderColor: tint, backgroundColor: 'rgba(128,128,128,0.1)' }
                        ]}
                    >
                        <View style={styles.avatarLarge}>
                            <ThemedText style={styles.avatarTextLarge}>{p.name[0]}</ThemedText>
                        </View>
                        <ThemedText style={styles.voteTargetName}>{p.name}</ThemedText>
                    </Pressable>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <Pressable
                    style={[
                        styles.actionButton,
                        { backgroundColor: isAllVoted ? '#e74c3c' : 'gray' }
                    ]}
                    onPress={submitVotes}
                    disabled={!isAllVoted}
                >
                    <ThemedText style={styles.buttonText} lightColor="#fff" darkColor="#fff">
                        {isAllVoted ? '🎭 Reveal Results' : `${Object.keys(votes).length}/${players.length} Votes Cast`}
                    </ThemedText>
                </Pressable>
            </View>
        </View>
    );
}

function ResultsView() {
    const tint = useThemeColor({}, 'tint');
    const {
        players,
        imposterIndex,
        realWord,
        imposterWord,
        nextRound,
        endGame
    } = useGame();

    const imposter = players[imposterIndex];
    if (!imposter) return null;

    // Sort players by score
    const leaderboard = [...players].sort((a, b) => b.score - a.score);

    return (
        <View style={styles.phaseContainer}>
            <View style={styles.header}>
                <ThemedText style={styles.phaseTitle}>📊 Results</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.resultsContent}>
                {/* Reveal Card */}
                <View style={styles.resultCard}>
                    <ThemedText style={styles.resultLabel}>The Imposter was...</ThemedText>
                    <ThemedText style={styles.imposterName}>{imposter.name}</ThemedText>

                    <View style={styles.divider} />

                    <View style={styles.wordRevealRow}>
                        <View style={styles.wordColumn}>
                            <ThemedText style={styles.wordLabel}>Real Word</ThemedText>
                            <ThemedText style={styles.wordValue}>{realWord}</ThemedText>
                        </View>
                        <View style={styles.wordColumn}>
                            <ThemedText style={[styles.wordLabel, { color: '#e74c3c' }]}>Imposter Word</ThemedText>
                            <ThemedText style={[styles.wordValue, { color: '#e74c3c' }]}>{imposterWord}</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Leaderboard */}
                <ThemedText style={styles.leaderboardTitle}>🏆 Leaderboard</ThemedText>
                <View style={styles.leaderboard}>
                    {leaderboard.map((p, i) => (
                        <View key={p.id} style={styles.leaderboardRow}>
                            <ThemedText style={styles.rank}>#{i + 1}</ThemedText>
                            <View style={styles.leaderboardInfo}>
                                <ThemedText style={styles.leaderboardName}>
                                    {p.name} {p.isImposter && '🎭'}
                                </ThemedText>
                                <View style={styles.scoreBadge}>
                                    <ThemedText style={styles.scoreText}>{p.score} pts</ThemedText>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.footerRow}>
                <Pressable style={styles.secondaryButton} onPress={endGame}>
                    <ThemedText style={styles.secondaryButtonText}>End Game</ThemedText>
                </Pressable>
                <Pressable style={[styles.primaryButton, { backgroundColor: tint }]} onPress={nextRound}>
                    <ThemedText style={styles.buttonText} lightColor="#fff" darkColor="#fff">Next Round ➡️</ThemedText>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    phaseContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    phaseTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    phaseSubtitle: {
        fontSize: 16,
        opacity: 0.6,
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'rgba(128,128,128,0.1)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        opacity: 0.5,
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    playerList: {
        flex: 1,
    },
    listContent: {
        gap: 12,
    },
    playerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(128,128,128,0.05)',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    playerName: {
        fontSize: 18,
        fontWeight: '500',
    },
    footer: {
        paddingVertical: 20,
    },
    footerRow: {
        flexDirection: 'row',
        paddingVertical: 20,
        gap: 12,
    },
    actionButton: {
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
    },

    // Voting Styles
    voterSelector: {
        marginBottom: 20,
    },
    selectorLabel: {
        fontSize: 14,
        marginBottom: 8,
        opacity: 0.6,
    },
    voterScroll: {
        flexGrow: 0,
    },
    voterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(128,128,128,0.3)',
        marginRight: 8,
    },
    voterChipDone: {
        backgroundColor: 'rgba(128,128,128,0.1)',
        borderColor: 'transparent',
    },
    voterName: {
        fontWeight: '600',
    },
    votePrompt: {
        fontSize: 16,
        marginBottom: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    list: {
        flex: 1,
    },
    voteGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    voteTarget: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: 'rgba(128,128,128,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarLarge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(128,128,128,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarTextLarge: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    voteTargetName: {
        fontSize: 16,
        fontWeight: '600',
    },

    // Results Styles
    resultsContent: {
        paddingBottom: 20,
    },
    resultCard: {
        backgroundColor: 'rgba(128,128,128,0.05)',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 32,
    },
    resultLabel: {
        fontSize: 14,
        textTransform: 'uppercase',
        opacity: 0.6,
        marginBottom: 8,
    },
    imposterName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#e74c3c',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(128,128,128,0.2)',
        marginBottom: 20,
    },
    wordRevealRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
    },
    wordColumn: {
        alignItems: 'center',
    },
    wordLabel: {
        fontSize: 12,
        marginBottom: 4,
        opacity: 0.6,
    },
    wordValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    leaderboardTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    leaderboard: {
        gap: 12,
    },
    leaderboardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(128,128,128,0.08)',
        borderRadius: 12,
    },
    rank: {
        fontSize: 18,
        fontWeight: 'bold',
        opacity: 0.5,
        width: 40,
    },
    leaderboardInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leaderboardName: {
        fontSize: 16,
        fontWeight: '600',
    },
    scoreBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: 'rgba(128,128,128,0.2)',
    },
    scoreText: {
        fontSize: 14,
        fontWeight: '700',
    },
    primaryButton: {
        flex: 1,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    secondaryButton: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 16,
        backgroundColor: 'rgba(128,128,128,0.2)',
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    }
});
