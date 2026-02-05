/**
 * Active Game Screen - Handles Discussion, Voting, and Results phases
 * Uses React Native Paper with pass-the-phone voting
 */

import { GamePhase, useGame } from '@/contexts/game-context';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    List,
    ProgressBar,
    Surface,
    Text,
    useTheme
} from 'react-native-paper';

export default function GameScreen() {
    const { phase } = useGame();

    // Redirect based on game phase
    useEffect(() => {
        if (phase === GamePhase.SETUP || phase === GamePhase.PLAYER_SETUP) {
            router.replace('/(tabs)');
        } else if (phase === GamePhase.REVEAL) {
            router.replace('/reveal');
        }
    }, [phase]);

    return (
        <Surface style={styles.container}>
            {phase === GamePhase.DISCUSSION && <DiscussionView />}
            {phase === GamePhase.VOTING && <VotingView />}
            {phase === GamePhase.RESULTS && <ResultsView />}
        </Surface>
    );
}

// --- Discussion View ---
function DiscussionView() {
    const theme = useTheme();
    const { players, startDiscussion, startingPlayerIndex } = useGame();
    const startingPlayer = startingPlayerIndex !== null ? players[startingPlayerIndex] : null;

    return (
        <View style={styles.phaseContainer}>
            <View style={styles.header}>
                <Avatar.Icon
                    size={64}
                    icon="forum"
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                />
                <Text variant="headlineMedium" style={styles.phaseTitle}>
                    Discussion Time
                </Text>
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                    Find the imposter among {players.length} players!
                </Text>
            </View>

            {startingPlayer && (
                <Card style={styles.card} mode="outlined">
                    <Card.Content style={styles.startingPlayerCard}>
                        <Avatar.Icon
                            size={40}
                            icon="account-arrow-right"
                            style={{ backgroundColor: theme.colors.secondaryContainer }}
                        />
                        <View style={{ marginLeft: 12 }}>
                            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                Starting Player
                            </Text>
                            <Text variant="titleMedium">{startingPlayer.name}</Text>
                        </View>
                    </Card.Content>
                </Card>
            )}

            <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
                <Card mode="elevated">
                    {players.map((p, index) => (
                        <List.Item
                            key={p.id}
                            title={p.name}
                            description={`${p.score} points`}
                            left={props => (
                                <Avatar.Text {...props} size={40} label={p.name.charAt(0).toUpperCase()} />
                            )}
                            right={props =>
                                startingPlayerIndex === index ? (
                                    <Chip {...props} compact icon="flag-checkered">First</Chip>
                                ) : null
                            }
                        />
                    ))}
                </Card>
            </ScrollView>

            <Surface style={styles.buttonContainer} elevation={4}>
                <Button
                    mode="contained"
                    onPress={startDiscussion}
                    style={styles.actionButton}
                    contentStyle={styles.buttonContent}
                    icon="vote"
                >
                    Start Voting
                </Button>
            </Surface>
        </View>
    );
}

// --- Voting View (Pass-the-Phone) ---
function VotingView() {
    const theme = useTheme();
    const {
        players,
        currentVoterIndex,
        votes,
        castVote,
        nextVoter,
        submitVotes,
        getCurrentVoter,
    } = useGame();

    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [showPassPhone, setShowPassPhone] = useState(false);

    const currentVoter = getCurrentVoter();
    const progress = (currentVoterIndex + 1) / players.length;
    const isLastVoter = currentVoterIndex === players.length - 1;
    const hasVoted = currentVoter ? !!votes[currentVoter.id] : false;

    const handleVote = () => {
        if (!currentVoter || !selectedTarget) return;
        castVote(currentVoter.id, selectedTarget);
        setSelectedTarget(null);

        if (isLastVoter) {
            // All votes cast, submit
            submitVotes();
        } else {
            setShowPassPhone(true);
        }
    };

    const handlePassPhone = () => {
        setShowPassPhone(false);
        nextVoter();
    };

    if (!currentVoter) {
        return null;
    }

    if (showPassPhone) {
        return (
            <View style={styles.phaseContainer}>
                <View style={styles.passPhoneContainer}>
                    <Avatar.Icon
                        size={80}
                        icon="cellphone-arrow-down"
                        style={{ backgroundColor: theme.colors.primaryContainer }}
                    />
                    <Text variant="headlineMedium" style={[styles.phaseTitle, { marginTop: 24 }]}>
                        Pass the Phone
                    </Text>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
                        Hand the phone to the next player
                    </Text>
                    <Button
                        mode="contained"
                        onPress={handlePassPhone}
                        style={{ marginTop: 32 }}
                        contentStyle={styles.buttonContent}
                        icon="account-arrow-right"
                    >
                        Next Voter
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.phaseContainer}>
            {/* Progress Header */}
            <View style={styles.progressHeader}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Voter {currentVoterIndex + 1} of {players.length}
                </Text>
                <ProgressBar
                    progress={progress}
                    color={theme.colors.primary}
                    style={styles.progressBar}
                />
            </View>

            {/* Current Voter */}
            <Card style={styles.voterCard} mode="elevated">
                <Card.Content style={styles.voterContent}>
                    <Avatar.Text
                        size={56}
                        label={currentVoter.name.charAt(0).toUpperCase()}
                    />
                    <View style={{ marginLeft: 16, flex: 1 }}>
                        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                            Now Voting
                        </Text>
                        <Text variant="headlineSmall">{currentVoter.name}</Text>
                    </View>
                </Card.Content>
            </Card>

            <Text variant="titleMedium" style={styles.votePrompt}>
                Who is the imposter?
            </Text>

            {/* Vote Targets */}
            <ScrollView style={styles.voteList} showsVerticalScrollIndicator={false}>
                <View style={styles.voteGrid}>
                    {players
                        .filter(p => p.id !== currentVoter.id)
                        .map(p => {
                            const isSelected = selectedTarget === p.id;
                            return (
                                <Card
                                    key={p.id}
                                    style={[
                                        styles.voteTargetCard,
                                        isSelected && { borderColor: theme.colors.primary, borderWidth: 2 }
                                    ]}
                                    mode={isSelected ? 'elevated' : 'outlined'}
                                    onPress={() => setSelectedTarget(p.id)}
                                >
                                    <Card.Content style={styles.voteTargetContent}>
                                        <Avatar.Text
                                            size={48}
                                            label={p.name.charAt(0).toUpperCase()}
                                            style={{
                                                backgroundColor: isSelected
                                                    ? theme.colors.primary
                                                    : theme.colors.surfaceVariant
                                            }}
                                        />
                                        <Text
                                            variant="labelLarge"
                                            style={[
                                                styles.voteTargetName,
                                                isSelected && { color: theme.colors.primary }
                                            ]}
                                        >
                                            {p.name}
                                        </Text>
                                    </Card.Content>
                                </Card>
                            );
                        })}
                </View>
            </ScrollView>

            {/* Submit Vote Button */}
            <Surface style={styles.buttonContainer} elevation={4}>
                <Button
                    mode="contained"
                    onPress={handleVote}
                    disabled={!selectedTarget}
                    style={styles.actionButton}
                    contentStyle={styles.buttonContent}
                    icon="check-circle"
                >
                    {isLastVoter ? 'Submit Final Vote' : 'Confirm Vote'}
                </Button>
            </Surface>
        </View>
    );
}

// --- Results View ---
function ResultsView() {
    const theme = useTheme();
    const {
        players,
        imposterIndices,
        realWord,
        imposterWord,
        imposterWordMode,
        votes,
        nextRound,
        endGame,
    } = useGame();

    // Get imposters
    const imposters = imposterIndices.map(idx => players[idx]).filter(Boolean);

    // Calculate vote counts for display
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach(targetId => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    // Check if any imposter was caught
    const imposterIds = imposters.map(i => i.id);
    const caughtImposters = imposters.filter(imp => {
        const voteCount = voteCounts[imp.id] || 0;
        const maxVotes = Math.max(...Object.values(voteCounts), 0);
        return voteCount === maxVotes && voteCount > 0;
    });

    const imposterWins = caughtImposters.length === 0;

    // Sort players by score
    const leaderboard = [...players].sort((a, b) => b.score - a.score);

    return (
        <View style={styles.phaseContainer}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsContent}>
                {/* Result Banner */}
                <Card
                    style={[styles.resultBanner, {
                        backgroundColor: imposterWins ? theme.colors.errorContainer : theme.colors.primaryContainer
                    }]}
                    mode="contained"
                >
                    <Card.Content style={styles.resultBannerContent}>
                        <Avatar.Icon
                            size={64}
                            icon={imposterWins ? 'incognito' : 'trophy'}
                            style={{
                                backgroundColor: imposterWins ? theme.colors.error : theme.colors.primary
                            }}
                        />
                        <Text
                            variant="headlineMedium"
                            style={{
                                marginTop: 16,
                                color: imposterWins ? theme.colors.onErrorContainer : theme.colors.onPrimaryContainer
                            }}
                        >
                            {imposterWins ? 'Imposter Wins!' : 'Town Wins!'}
                        </Text>
                    </Card.Content>
                </Card>

                {/* Imposter Reveal */}
                <Card style={styles.card} mode="elevated">
                    <Card.Content>
                        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                            {imposters.length === 1 ? 'The Imposter was' : 'The Imposters were'}
                        </Text>
                        <View style={styles.imposterList}>
                            {imposters.map(imp => (
                                <Chip
                                    key={imp.id}
                                    icon="incognito"
                                    style={styles.imposterChip}
                                    textStyle={{ fontWeight: 'bold' }}
                                >
                                    {imp.name}
                                </Chip>
                            ))}
                        </View>
                        <Divider style={{ marginVertical: 16 }} />
                        <View style={styles.wordReveal}>
                            <View style={styles.wordColumn}>
                                <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                                    Real Word
                                </Text>
                                <Text variant="titleLarge" style={{ color: theme.colors.primary }}>
                                    {realWord}
                                </Text>
                            </View>
                            <View style={styles.wordColumn}>
                                <Text variant="labelMedium" style={{ color: theme.colors.error }}>
                                    {imposterWordMode === 'no_word' ? 'Imposter Word' : 'False Word'}
                                </Text>
                                <Text variant="titleLarge" style={{ color: theme.colors.error }}>
                                    {imposterWordMode === 'no_word' ? '(hidden)' : imposterWord}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Leaderboard */}
                <Text variant="titleLarge" style={styles.sectionTitle}>
                    Leaderboard
                </Text>
                <Card mode="outlined">
                    {leaderboard.map((p, index) => (
                        <List.Item
                            key={p.id}
                            title={p.name}
                            description={p.isImposter ? 'Imposter' : undefined}
                            left={props => (
                                <View style={styles.rankBadge}>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                        #{index + 1}
                                    </Text>
                                </View>
                            )}
                            right={props => (
                                <Chip
                                    {...props}
                                    icon={index === 0 ? 'crown' : 'star'}
                                    mode={index === 0 ? 'flat' : 'outlined'}
                                >
                                    {p.score} pts
                                </Chip>
                            )}
                        />
                    ))}
                </Card>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Action Buttons */}
            <Surface style={styles.buttonRow} elevation={4}>
                <Button
                    mode="outlined"
                    onPress={endGame}
                    style={styles.halfButton}
                    contentStyle={styles.buttonContent}
                    icon="stop"
                >
                    End Game
                </Button>
                <Button
                    mode="contained"
                    onPress={() => {
                        nextRound();
                        router.replace('/reveal');
                    }}
                    style={styles.halfButton}
                    contentStyle={styles.buttonContent}
                    icon="arrow-right"
                >
                    Next Round
                </Button>
            </Surface>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    phaseContainer: {
        flex: 1,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    phaseTitle: {
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    progressHeader: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    progressBar: {
        marginTop: 8,
        height: 6,
        borderRadius: 3,
    },
    card: {
        marginHorizontal: 20,
        marginBottom: 16,
    },
    startingPlayerCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    playerList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    voterCard: {
        marginHorizontal: 20,
        marginBottom: 16,
    },
    voterContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    votePrompt: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    voteList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    voteGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    voteTargetCard: {
        width: '47%',
    },
    voteTargetContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    voteTargetName: {
        marginTop: 8,
    },
    passPhoneContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    resultsContent: {
        padding: 20,
    },
    resultBanner: {
        marginBottom: 16,
    },
    resultBannerContent: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    imposterList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    imposterChip: {
        backgroundColor: 'rgba(255,59,48,0.1)',
    },
    wordReveal: {
        flexDirection: 'row',
    },
    wordColumn: {
        flex: 1,
        alignItems: 'center',
    },
    sectionTitle: {
        marginTop: 16,
        marginBottom: 12,
        fontWeight: 'bold',
    },
    rankBadge: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 34,
    },
    buttonRow: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 34,
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        borderRadius: 12,
    },
    halfButton: {
        flex: 1,
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: 8,
    },
});
