/**
 * Active Game Screen - Handles Discussion, Voting, and Results phases
 * Uses React Native Paper with pass-the-phone voting
 */

import { PhaseTransition } from '@/components/animated/PhaseTransition';
import { ScalableButton } from '@/components/animated/ScalableButton';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { Layout } from '@/constants/theme';
import { GamePhase, useGame } from '@/contexts/game-context';
import * as Haptics from 'expo-haptics';
import { router, useRootNavigationState } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import {
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    List,
    Modal,
    Portal,
    ProgressBar,
    Surface,
    Text,
    TextInput,
    useTheme
} from 'react-native-paper';
import Animated, {
    Extrapolation,
    FadeInDown,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

export default function GameScreen() {
    const { phase } = useGame();
    const rootNavigationState = useRootNavigationState();

    // Redirect if game not active
    useEffect(() => {
        if (!rootNavigationState?.key) return;

        if (phase === GamePhase.SETUP || phase === GamePhase.PLAYER_SETUP) {
            router.replace('/(tabs)');
        }
    }, [phase, rootNavigationState?.key]);

    return (
        <View style={styles.container}>
            {phase === GamePhase.REVEAL && <RevealView key="reveal" />}
            {phase === GamePhase.DISCUSSION && <DiscussionView key="discussion" />}
            {phase === GamePhase.VOTING && <VotingView key="voting" />}
            {phase === GamePhase.RESULTS && <ResultsView key="results" />}
        </View>
    );
}


// --- Reveal View ---
function RevealView() {
    const theme = useTheme();
    const {
        currentPlayerIndex,
        players,
        getPlayerWord,
        revealWord,
        nextPlayerReveal,
        isPlayerImposter,
        imposterWordMode,
        allHints,
        addHint,
        revealOrder,
        hintWord,
    } = useGame();

    const [isVerificationModalVisible, setVerificationModalVisible] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [hintInput, setHintInput] = useState('');
    const [showPassPhone, setShowPassPhone] = useState(true);
    const revealTimeoutRef = useRef<any>(null);

    const rotation = useSharedValue(0);

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotation.value, [0, 180], [0, 180], Extrapolation.CLAMP);
        const scale = interpolate(rotation.value, [0, 90, 180], [1, 1.1, 1], Extrapolation.CLAMP);
        const opacity = interpolate(rotation.value, [89, 90, 91], [1, 0, 0], Extrapolation.CLAMP);
        return {
            transform: [{ perspective: 1200 }, { rotateY: `${rotateValue}deg` }, { scale }],
            opacity,
            zIndex: rotation.value < 90 ? 2 : 1,
            elevation: rotation.value === 0 ? 4 : 0,
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotation.value, [0, 180], [180, 360], Extrapolation.CLAMP);
        const scale = interpolate(rotation.value, [0, 90, 180], [1, 1.1, 1], Extrapolation.CLAMP);
        const opacity = interpolate(rotation.value, [89, 90, 91], [0, 0, 1], Extrapolation.CLAMP);
        return {
            transform: [{ perspective: 1200 }, { rotateY: `${rotateValue}deg` }, { scale }],
            opacity,
            zIndex: rotation.value >= 90 ? 2 : 1,
            elevation: rotation.value === 180 ? 4 : 0,
        };
    });

    const actualPlayerIndex = revealOrder && revealOrder.length > 0
        ? revealOrder[currentPlayerIndex]
        : currentPlayerIndex;

    const currentPlayer = players[actualPlayerIndex];

    if (!currentPlayer) return null;

    const isLastPlayer = currentPlayerIndex === players.length - 1;
    const isImposter = isPlayerImposter(actualPlayerIndex);
    const playerWord = getPlayerWord(actualPlayerIndex);

    const handlePressIn = () => {
        revealTimeoutRef.current = setTimeout(() => {
            rotation.value = withTiming(180, { duration: 400 });
            revealWord(actualPlayerIndex);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            revealTimeoutRef.current = null;
        }, 500);
    };

    const handlePressOut = () => {
        if (revealTimeoutRef.current) {
            clearTimeout(revealTimeoutRef.current);
            revealTimeoutRef.current = null;
        }
        rotation.value = withTiming(0, { duration: 400 });
        if (!isVerified) {
            if (imposterWordMode === 'user_hint') {
                setTimeout(() => setVerificationModalVisible(true), 300);
            } else {
                setIsVerified(true);
            }
        }
    };

    const handleNext = () => {
        if (!isVerified) {
            setVerificationModalVisible(true);
            return;
        }
        setHintInput('');
        setIsVerified(false);
        setVerificationModalVisible(false);
        nextPlayerReveal();
        setShowPassPhone(true);
    };

    const getWordDisplay = () => {
        if (isImposter) {
            if (imposterWordMode === 'hidden') return { title: playerWord, subtitle: 'Secret Word', icon: 'eye' };
            if (imposterWordMode === 'no_hint') return { title: 'Imposter', subtitle: 'Role: Imposter (No Hint)', icon: 'incognito' };
            if (imposterWordMode === 'category_hint') return { title: 'Imposter', subtitle: `Hint: ${hintWord || '??'}`, icon: 'incognito' };
            if (imposterWordMode === 'user_hint') {
                const availableHints = allHints.filter(h => h.trim().length > 0);
                const randomHint = availableHints.length > 0 ? availableHints[Math.floor(Math.random() * availableHints.length)] : null;
                return { title: 'Imposter', subtitle: randomHint ? `Hint: ${randomHint}` : 'No hint since you are starting the game.', icon: 'incognito' };
            }
        }
        return { title: playerWord, subtitle: 'Secret Word', icon: 'eye' };
    };

    const wordInfo = getWordDisplay();

    if (showPassPhone) {
        return (
            <PhaseTransition key="pass-phone-reveal" type="slide" style={styles.phaseContainer}>
                <View style={styles.passPhoneContainer}>
                    <Surface style={styles.passPhoneCard} elevation={2}>
                        <PlayerAvatar name={currentPlayer.name} size={90} />
                        <Text variant="displaySmall" style={[styles.phaseTitle, { marginTop: 28, color: theme.colors.primary }]}>Pass the Phone</Text>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 12 }}>To: {currentPlayer.name}</Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 16 }}>Please hand the device to the next player securely.</Text>
                        <ScalableButton
                            onPress={() => setShowPassPhone(false)}
                            style={{ marginTop: 32, width: '100%' }}
                        >
                            <Button
                                mode="contained"
                                style={{
                                    width: '100%',
                                    height: Layout.floatingBar.height,
                                    borderRadius: Layout.floatingBar.borderRadius,
                                }}
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.actionButtonLabel}
                                icon="account-arrow-right"
                                pointerEvents="none"
                                buttonColor={theme.colors.primary}
                                textColor={theme.colors.onPrimary}
                            >
                                I am {currentPlayer.name}
                            </Button>
                        </ScalableButton>
                    </Surface>
                </View>
            </PhaseTransition>
        );
    }

    return (
        <PhaseTransition key="reveal-main" type="fade" style={styles.phaseContainer}>
            <View style={styles.revealHeader}>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    {players.map((_, i) => (
                        <View key={i} style={{ width: i === currentPlayerIndex ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === currentPlayerIndex ? theme.colors.primary : theme.colors.surfaceVariant, opacity: i === currentPlayerIndex ? 1 : 0.6 }} />
                    ))}
                </View>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>Player {currentPlayerIndex + 1} of {players.length}</Text>
            </View>

            <View style={styles.revealContent}>
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <PlayerAvatar name={currentPlayer.name} size={64} style={{ marginBottom: 16 }} />
                    <Text variant="headlineMedium" style={{ color: theme.colors.onSurface, fontWeight: 'bold' }}>{currentPlayer.name}</Text>
                </View>

                <ScalableButton onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.revealCardContainer} activeScale={1.02}>
                    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                        <Animated.View style={[styles.revealCardFace, styles.revealCardFront, frontAnimatedStyle]}>
                            <Card style={[styles.revealCard, { backgroundColor: theme.colors.elevation.level2, borderColor: theme.colors.outlineVariant, borderWidth: 1 }]} mode="outlined">
                                <Card.Content style={styles.revealCardContent}>
                                    <Avatar.Icon size={64} icon="fingerprint" style={{ backgroundColor: theme.colors.surfaceVariant }} color={theme.colors.primary} />
                                    <Text variant="titleLarge" style={[styles.tapText, { color: theme.colors.primary }]}>SECRET CARD</Text>
                                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, opacity: 0.7, marginTop: 4 }}>Tap & Hold</Text>
                                </Card.Content>
                            </Card>
                        </Animated.View>

                        <Animated.View style={[styles.revealCardFace, styles.revealCardBack, backAnimatedStyle]}>
                            <Card style={[styles.revealCard, (isImposter && imposterWordMode !== 'hidden') ? { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error } : { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }, { borderWidth: 1.5, borderRadius: 28 }]} mode="outlined">
                                <Card.Content style={styles.revealCardContent}>
                                    <Avatar.Icon size={72} icon={wordInfo.icon} style={{ backgroundColor: (isImposter && imposterWordMode !== 'hidden') ? theme.colors.error : theme.colors.primaryContainer }} color={(isImposter && imposterWordMode !== 'hidden') ? "white" : theme.colors.primary} />
                                    <Text variant="headlineMedium" style={[styles.wordText, (isImposter && imposterWordMode !== 'hidden') ? { color: theme.colors.error } : { color: theme.colors.onSurface }]}>{wordInfo.title}</Text>
                                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', fontWeight: '500' }}>{wordInfo.subtitle}</Text>
                                </Card.Content>
                            </Card>
                        </Animated.View>
                    </View>
                </ScalableButton>

                <Portal>
                    <Modal visible={isVerificationModalVisible} dismissable={false} contentContainerStyle={styles.modalContent}>
                        <Card>
                            <Card.Title title="Hint Contribution" subtitle="Enter a hint for the word" left={(props) => <Avatar.Icon {...props} icon="lightbulb" />} />
                            <Card.Content>
                                <Text variant="bodyMedium" style={{ marginBottom: 16 }}>{imposterWordMode === 'hidden' ? "Enter a one-word hint that relates to the secret word." : isImposter ? "Pretend to be typing a hint to blend in. You are the Imposter." : "Enter a one-word hint that relates to the secret word."}</Text>
                                <TextInput mode="outlined" label="Hint Word" value={hintInput} onChangeText={setHintInput} autoFocus style={{ marginBottom: 16 }} />
                                <ScalableButton onPress={() => { if (hintInput.trim().length > 0) { Keyboard.dismiss(); if (!isImposter || imposterWordMode === 'hidden') addHint(hintInput.trim()); setIsVerified(true); setVerificationModalVisible(false); } }} disabled={hintInput.trim().length === 0}>
                                    <Button mode="contained" disabled={hintInput.trim().length === 0} pointerEvents="none">Confirm Hint</Button>
                                </ScalableButton>
                            </Card.Content>
                        </Card>
                    </Modal>
                </Portal>
            </View>

            <View style={styles.buttonContainer}>
                <ScalableButton onPress={handleNext} disabled={!isVerified} style={styles.actionButton}>
                    <Button mode="contained" disabled={!isVerified} style={styles.fullWidth} contentStyle={styles.buttonContent} labelStyle={styles.actionButtonLabel} icon={isLastPlayer ? 'play' : 'cellphone-arrow-down'} pointerEvents="none" buttonColor={isVerified ? theme.colors.primary : theme.colors.surfaceVariant}>
                        {isLastPlayer ? 'Start Discussion' : `Pass to ${players[revealOrder[currentPlayerIndex + 1]]?.name || 'Next'}`}
                    </Button>
                </ScalableButton>
            </View>
        </PhaseTransition>
    );
}

// --- Discussion View ---
function DiscussionView() {
    const theme = useTheme();
    const { players, startDiscussion, startingPlayerIndex, isVotingEnabled } = useGame();
    const startingPlayer = startingPlayerIndex !== null ? players[startingPlayerIndex] : null;

    return (
        <PhaseTransition type="fade" style={styles.phaseContainer}>
            <View style={styles.header}>
                <Avatar.Icon
                    size={72}
                    icon="forum-outline"
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                    color={theme.colors.onPrimaryContainer}
                />
                <Text variant="displaySmall" style={[styles.phaseTitle, { color: theme.colors.primary }]}>
                    Discussion
                </Text>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', opacity: 0.8 }}>
                    Find the imposter among {players.length} players!
                </Text>
            </View>

            {startingPlayer && (
                <Card style={[styles.card, { borderRadius: 20 }]} mode="contained">
                    <Card.Content style={styles.startingPlayerCard}>
                        <Avatar.Icon
                            size={44}
                            icon="account-voice"
                            style={{ backgroundColor: theme.colors.secondaryContainer }}
                        />
                        <View style={{ marginLeft: 16 }}>
                            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, letterSpacing: 0.5 }}>
                                STARTING PLAYER
                            </Text>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>{startingPlayer.name}</Text>
                        </View>
                    </Card.Content>
                </Card>
            )}

            <ScrollView style={styles.playerList} showsVerticalScrollIndicator={false}>
                <Card mode="elevated" style={[styles.card, { borderRadius: 28, overflow: 'hidden' }]}>
                    {players.map((p, index) => (
                        <List.Item
                            key={p.id}
                            title={p.name}
                            titleStyle={{ fontWeight: '600' }}
                            description={`${p.score} points`}
                            left={props => (
                                <View style={{ paddingLeft: 16, justifyContent: 'center' }}>
                                    <PlayerAvatar
                                        name={p.name}
                                        size={48}
                                    />
                                </View>
                            )}
                            right={props =>
                                startingPlayerIndex === index ? (
                                    <View style={{ justifyContent: 'center' }}>
                                        <Chip
                                            {...props}
                                            compact
                                            icon="microphone"
                                            style={{
                                                backgroundColor: theme.colors.tertiaryContainer,
                                            }}
                                            textStyle={{
                                                color: theme.colors.onTertiaryContainer,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            First
                                        </Chip>
                                    </View>
                                ) : null
                            }
                        />
                    ))}
                </Card>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <ScalableButton onPress={startDiscussion} style={styles.actionButton}>
                    <Button
                        mode="contained"
                        style={styles.fullWidth}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.actionButtonLabel}
                        icon={isVotingEnabled ? "vote" : "eye-check"}
                        pointerEvents="none"
                    >
                        {isVotingEnabled ? "Start Voting" : "Reveal Imposter"}
                    </Button>
                </ScalableButton>
            </View>
        </PhaseTransition>
    );
}

// --- Voting View (Pass-the-Phone) ---
function VotingView() {
    const theme = useTheme();
    const {
        players,
        currentVoterIndex,
        castVote,
        nextVoter,
        submitVotes,
        getCurrentVoter,
    } = useGame();

    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [showPassPhone, setShowPassPhone] = useState(true);

    const currentVoter = getCurrentVoter();
    const progress = (currentVoterIndex + 1) / players.length;
    const isLastVoter = currentVoterIndex === players.length - 1;

    // Determine next voter name for button label
    const nextVoterIndex = currentVoterIndex + 1;
    const nextVoterName = nextVoterIndex < players.length ? players[nextVoterIndex].name : 'Results';

    const handleVote = () => {
        if (!currentVoter || !selectedTarget) return;
        castVote(currentVoter.id, selectedTarget);
        setSelectedTarget(null);

        if (isLastVoter) {
            submitVotes();
        } else {
            nextVoter();
            setShowPassPhone(true);
        }
    };

    const handlePassPhone = () => {
        setShowPassPhone(false);
    };

    if (!currentVoter) {
        return null;
    }

    if (showPassPhone) {
        return (
            <PhaseTransition key="pass-phone" type="slide" style={styles.phaseContainer}>
                <View style={styles.passPhoneContainer}>
                    <Surface style={styles.passPhoneCard} elevation={2}>
                        <PlayerAvatar name={currentVoter.name} size={100} />
                        <Text variant="displaySmall" style={[styles.phaseTitle, { marginTop: 28, color: theme.colors.primary }]}>
                            Voting Phase
                        </Text>
                        <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>
                            To: {currentVoter.name}
                        </Text>
                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 16, opacity: 0.8 }}>
                            Pass the phone to {currentVoter.name} to cast their secret vote.
                        </Text>

                        <ScalableButton
                            onPress={handlePassPhone}
                            style={{
                                marginTop: 32,
                                width: '100%',
                            }}
                        >
                            <Button
                                mode="contained"
                                style={{
                                    width: '100%',
                                    height: Layout.floatingBar.height,
                                    borderRadius: Layout.floatingBar.borderRadius,
                                }}
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.actionButtonLabel}
                                icon="account-arrow-right"
                                pointerEvents="none"
                                buttonColor={theme.colors.primary}
                                textColor={theme.colors.onPrimary}
                            >
                                I am {currentVoter.name}
                            </Button>
                        </ScalableButton>
                    </Surface>
                </View>
            </PhaseTransition>
        );
    }

    return (
        <PhaseTransition type="fade" style={styles.phaseContainer}>
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
            <Card style={[styles.voterCard, { borderRadius: 24 }]} mode="elevated">
                <Card.Content style={styles.voterContent}>
                    <PlayerAvatar
                        size={64}
                        name={currentVoter.name}
                    />
                    <View style={{ marginLeft: 20, flex: 1 }}>
                        <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: 'bold', letterSpacing: 1 }}>
                            CURRENT VOTER
                        </Text>
                        <Text variant="headlineMedium" style={{ fontWeight: 'bold' }}>{currentVoter.name}</Text>
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
                        .map((p, index) => {
                            const isSelected = selectedTarget === p.id;
                            return (
                                <Animated.View
                                    key={p.id}
                                    entering={FadeInDown.delay(index * 50).duration(400)}
                                    style={styles.voteTargetCard}
                                >
                                    <ScalableButton
                                        onPress={() => {
                                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                            setSelectedTarget(p.id);
                                        }}
                                    >
                                        <Card
                                            style={[
                                                styles.fullWidth,
                                                { borderRadius: 24 },
                                                isSelected && { borderColor: theme.colors.primary, borderWidth: 3 }
                                            ]}
                                            mode={isSelected ? 'elevated' : 'contained'}
                                        >
                                            <Card.Content style={styles.voteTargetContent}>
                                                <PlayerAvatar
                                                    name={p.name}
                                                    size={56}
                                                />
                                                <Text
                                                    variant="titleMedium"
                                                    style={[
                                                        styles.voteTargetName,
                                                        isSelected && { color: theme.colors.primary, fontWeight: 'bold' }
                                                    ]}
                                                >
                                                    {p.name}
                                                </Text>
                                            </Card.Content>
                                        </Card>
                                    </ScalableButton>
                                </Animated.View>
                            );
                        })}
                </View>
            </ScrollView>

            {/* Submit Vote Button */}
            <View style={styles.buttonContainer}>
                <ScalableButton
                    onPress={handleVote}
                    disabled={!selectedTarget}
                    style={styles.actionButton}
                >
                    <Button
                        mode="contained"
                        disabled={!selectedTarget}
                        style={styles.fullWidth}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.actionButtonLabel}
                        icon="check-circle"
                        pointerEvents="none"
                    >
                        {isLastVoter
                            ? 'Submit Final Vote'
                            : `Confirm & Pass to ${nextVoterName}`
                        }
                    </Button>
                </ScalableButton>
            </View>
        </PhaseTransition>
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
        isVotingEnabled,
    } = useGame();

    // Get imposters
    const imposters = imposterIndices.map(idx => players[idx]).filter(Boolean);

    // Calculate vote counts for display
    const voteCounts: Record<string, number> = {};
    Object.values(votes).forEach(targetId => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    // Check if any imposter was caught
    const caughtImposters = imposters.filter(imp => {
        const voteCount = voteCounts[imp.id] || 0;
        const maxVotes = Math.max(...Object.values(voteCounts), 0);
        return voteCount === maxVotes && voteCount > 0;
    });

    const imposterWins = caughtImposters.length === 0;

    // Sort players by score
    const leaderboard = [...players].sort((a, b) => b.score - a.score);

    return (
        <PhaseTransition type="fade" style={styles.phaseContainer}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.resultsContent}>
                {/* Result Banner */}
                {isVotingEnabled && (
                    <Card
                        style={[styles.resultBanner, {
                            backgroundColor: imposterWins ? theme.colors.errorContainer : theme.colors.primaryContainer,
                            borderRadius: 28
                        }]}
                        mode="contained"
                    >
                        <Card.Content style={styles.resultBannerContent}>
                            <Avatar.Icon
                                size={80}
                                icon={imposterWins ? 'incognito' : 'trophy'}
                                style={{
                                    backgroundColor: imposterWins ? theme.colors.error : theme.colors.primary
                                }}
                                color={imposterWins ? theme.colors.onError : theme.colors.onPrimary}
                            />
                            <Text
                                variant="displaySmall"
                                style={{
                                    marginTop: 20,
                                    fontWeight: 'bold',
                                    color: imposterWins ? theme.colors.error : theme.colors.primary
                                }}
                            >
                                {imposterWins ? 'Imposter Wins!' : 'Town Wins!'}
                            </Text>
                        </Card.Content>
                    </Card>
                )}

                {!isVotingEnabled && (
                    <Card
                        style={[styles.resultBanner, {
                            backgroundColor: theme.colors.secondaryContainer,
                            borderRadius: 28
                        }]}
                        mode="contained"
                    >
                        <Card.Content style={styles.resultBannerContent}>
                            <Avatar.Icon
                                size={80}
                                icon="eye-outline"
                                style={{
                                    backgroundColor: theme.colors.secondary
                                }}
                                color={theme.colors.onSecondary}
                            />
                            <Text
                                variant="displaySmall"
                                style={{
                                    marginTop: 20,
                                    fontWeight: 'bold',
                                    color: theme.colors.secondary
                                }}
                            >
                                Imposter Revealed!
                            </Text>
                        </Card.Content>
                    </Card>
                )}

                {/* Imposter Reveal */}
                <Card style={{ marginBottom: 24, borderRadius: 24 }} mode="elevated">
                    <Card.Content>
                        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, letterSpacing: 1 }}>
                            {imposters.length === 1 ? 'THE IMPOSTER' : 'THE IMPOSTERS'}
                        </Text>
                        <View style={styles.imposterList}>
                            {imposters.map(imp => (
                                <Chip
                                    key={imp.id}
                                    icon="incognito"
                                    style={[styles.imposterChip, { backgroundColor: theme.colors.errorContainer }]}
                                    textStyle={{ fontWeight: 'bold', color: theme.colors.onErrorContainer }}
                                >
                                    {imp.name}
                                </Chip>
                            ))}
                        </View>
                        <Divider style={{ marginVertical: 20 }} />
                        <View style={styles.wordReveal}>
                            <View style={styles.wordColumn}>
                                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 4 }}>
                                    REAL WORD
                                </Text>
                                <Text variant="headlineSmall" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    {realWord}
                                </Text>
                            </View>
                            <Divider style={{ height: 40, width: 1 }} />
                            <View style={styles.wordColumn}>
                                <Text variant="labelSmall" style={{ color: theme.colors.error, marginBottom: 4 }}>
                                    {imposterWordMode === 'no_word' ? 'IMPOSTER WORD' : 'FALSE WORD'}
                                </Text>
                                <Text variant="headlineSmall" style={{ color: theme.colors.error, fontWeight: 'bold' }}>
                                    {imposterWordMode === 'no_word' ? '???' : imposterWord}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Leaderboard */}
                {isVotingEnabled && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text variant="titleLarge" style={styles.sectionTitle}>
                                Leaderboard
                            </Text>
                            <Avatar.Icon size={32} icon="medal" style={{ backgroundColor: 'transparent' }} />
                        </View>

                        <Card mode="contained" style={styles.leaderboardCard}>
                            {leaderboard.map((p, index) => {
                                const isImposter = imposterIndices.includes(players.findIndex(player => player.id === p.id));
                                const isWinner = index === 0;
                                const rankColor = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : theme.colors.outline;

                                return (
                                    <View key={p.id}>
                                        <List.Item
                                            title={p.name}
                                            titleStyle={[isWinner && { fontWeight: 'bold', color: theme.colors.primary }]}
                                            description={isImposter ? (caughtImposters.some(c => c.id === p.id) ? 'Caught Imposter' : 'Escaped Imposter') : 'Townsperson'}
                                            left={props => (
                                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 30 }}>
                                                    <Text
                                                        variant="headlineSmall"
                                                        style={[styles.rankText, { color: rankColor, width: 32, textAlign: 'center' }]}
                                                    >
                                                        {index + 1}
                                                    </Text>
                                                    <PlayerAvatar name={p.name} size={44} style={{ marginLeft: 16 }} />
                                                </View>
                                            )}
                                            right={props => (
                                                <View style={styles.scoreContainer}>
                                                    <Text variant="titleLarge" style={styles.scoreText}>
                                                        {p.score}
                                                    </Text>
                                                    <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>PTS</Text>
                                                </View>
                                            )}
                                            style={styles.leaderboardItem}
                                        />
                                        {index < leaderboard.length - 1 && <Divider horizontalInset />}
                                    </View>
                                );
                            })}
                        </Card>
                    </>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>
            {/* Action Buttons */}
            <View style={styles.buttonRow}>
                <ScalableButton
                    onPress={endGame}
                    style={styles.halfButton}
                >
                    <Button
                        mode="outlined"
                        textColor={theme.colors.error}
                        style={[styles.fullWidth, { borderColor: theme.colors.error }]}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.halfButtonLabel}
                        icon="pause"
                    >
                        End Game
                    </Button>
                </ScalableButton>
                <ScalableButton
                    onPress={() => {
                        nextRound();
                    }}
                    style={styles.halfButton}
                >
                    <Button
                        mode="contained"
                        style={styles.fullWidth}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.halfButtonLabel}
                        icon="arrow-right"
                        pointerEvents="none"
                    >
                        Next Round
                    </Button>
                </ScalableButton>
            </View>
        </PhaseTransition>
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
        justifyContent: 'space-between',
        paddingBottom: 20,
    },
    voteTargetCard: {
        width: '48%',
        marginBottom: 12,
    },
    voteTargetContent: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    voteTargetName: {
        marginTop: 8,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    passPhoneContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    passPhoneCard: {
        width: '100%',
        padding: 32,
        alignItems: 'center',
        borderRadius: 24,
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
        justifyContent: 'center',
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
        fontWeight: 'bold',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 24,
        marginBottom: 12,
        paddingHorizontal: 4,
    },
    leaderboardCard: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    leaderboardItem: {
        paddingVertical: 8,
    },
    rankContainer: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 20,
    },
    rankText: {
        fontWeight: '900',
    },
    scoreContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        minWidth: 50,
    },
    scoreText: {
        fontWeight: 'bold',
    },
    rankBadge: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: Layout.floatingBar.bottom,
        left: 0,
        right: 0,
        marginHorizontal: Layout.floatingBar.marginHorizontal,
        height: Layout.floatingBar.height,
        borderRadius: Layout.floatingBar.borderRadius,
        backgroundColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: Layout.floatingBar.shadowOffset,
        shadowOpacity: Layout.floatingBar.shadowOpacity,
        shadowRadius: Layout.floatingBar.shadowRadius,
    },
    buttonRow: {
        position: 'absolute',
        bottom: Layout.floatingBar.bottom,
        left: 0,
        right: 0,
        marginHorizontal: Layout.floatingBar.marginHorizontal,
        height: Layout.floatingBar.height,
        flexDirection: 'row',
        gap: 12,
        backgroundColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: Layout.floatingBar.shadowOffset,
        shadowOpacity: Layout.floatingBar.shadowOpacity,
        shadowRadius: Layout.floatingBar.shadowRadius,
    },
    actionButton: {
        flex: 1,
        borderRadius: 32,
        height: '100%',
    },
    fullWidth: {
        width: '100%',
        height: '100%',
        borderRadius: 32,
        justifyContent: 'center',
    },
    halfButton: {
        flex: 1,
        borderRadius: 32,
        height: '100%',
        justifyContent: 'center',
    },
    actionButtonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textAlign: 'center',
    },
    halfButtonLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    buttonContent: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row-reverse',
    },
    // Reveal Styles
    revealHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    revealContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 80,
    },
    revealCardContainer: {
        width: '100%',
        aspectRatio: 0.8,
        maxWidth: 320,
    },
    revealCardFace: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
    },
    revealCardFront: {
        zIndex: 2,
    },
    revealCardBack: {
        zIndex: 1,
    },
    revealCard: {
        flex: 1,
        justifyContent: 'center',
        borderRadius: 28,
    },
    revealCardContent: {
        alignItems: 'center',
        padding: 24,
    },
    tapText: {
        marginTop: 16,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        textAlign: 'center',
    },
    wordText: {
        marginTop: 20,
        marginBottom: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    modalContent: {
        padding: 20,
    },
});
