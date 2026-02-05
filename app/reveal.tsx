/**
 * Word Reveal Screen - Pass-the-phone word reveal using React Native Paper
 * Uses Reanimated for flash card flip animation
 */

import { GamePhase, useGame } from '@/contexts/game-context';
import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import {
    Avatar,
    Button,
    Card,
    ProgressBar,
    Surface,
    Text,
    useTheme,
} from 'react-native-paper';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

export default function RevealScreen() {
    const theme = useTheme();
    const {
        currentPlayerIndex,
        players,
        getPlayerWord,
        revealWord,
        nextPlayerReveal,
        startDiscussion,
        isPlayerImposter,
        imposterWordMode,
        phase,
    } = useGame();

    const rotation = useSharedValue(0);

    // Animated Styles (Moved up before early returns)
    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(
            rotation.value,
            [0, 180],
            [0, 180],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(
            rotation.value,
            [0, 180],
            [180, 360],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ rotateY: `${rotateValue}deg` }],
        };
    });

    // Determine content derived from state (safely)
    const currentPlayer = players[currentPlayerIndex];
    if (phase !== GamePhase.REVEAL) {
        return <Redirect href="/game" />;
    }
    if (!currentPlayer) {
        return <Redirect href="/(tabs)" />;
    }

    const isLastPlayer = currentPlayerIndex === players.length - 1;
    const isImposter = isPlayerImposter(currentPlayerIndex);
    const playerWord = getPlayerWord(currentPlayerIndex);
    const progress = (currentPlayerIndex + 1) / players.length;

    const handlePressIn = () => {
        rotation.value = withTiming(180, { duration: 300 });
        revealWord(currentPlayerIndex);
    };

    const handlePressOut = () => {
        rotation.value = withTiming(0, { duration: 300 });
    };

    const handleNext = () => {
        if (isLastPlayer) {
            startDiscussion();
            router.replace('/game');
        } else {
            nextPlayerReveal();
        }
    };

    const getWordDisplay = () => {
        if (isImposter && imposterWordMode === 'no_word') {
            return {
                title: 'You are the Imposter!',
                subtitle: 'Try to blend in without knowing the word',
                icon: 'incognito',
            };
        }
        return {
            title: playerWord,
            subtitle: isImposter ? 'You are the Imposter!' : 'Remember this word',
            icon: isImposter ? 'incognito' : 'eye',
        };
    };

    const wordInfo = getWordDisplay();

    return (
        <Surface style={styles.container}>
            {/* Progress Header */}
            <View style={styles.header}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Player {currentPlayerIndex + 1} of {players.length}
                </Text>
                <ProgressBar
                    progress={progress}
                    color={theme.colors.primary}
                    style={styles.progressBar}
                />
            </View>

            {/* Main Content */}
            <View style={styles.content}>
                <Text variant="headlineMedium" style={styles.playerName}>
                    {currentPlayer.name}
                </Text>
                <Text
                    variant="bodyMedium"
                    style={[styles.instruction, { color: theme.colors.onSurfaceVariant }]}
                >
                    Tap and hold the card to reveal your secret
                </Text>

                <Pressable
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={styles.cardContainer}
                >
                    {/* Front Face (Cover) */}
                    <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
                        <Card style={styles.card} mode="elevated">
                            <Card.Content style={styles.cardContent}>
                                <Avatar.Icon
                                    size={80}
                                    icon="fingerprint"
                                    style={{ backgroundColor: theme.colors.primaryContainer }}
                                />
                                <Text variant="titleLarge" style={styles.tapText}>
                                    Tap & Hold
                                </Text>
                            </Card.Content>
                        </Card>
                    </Animated.View>

                    {/* Back Face (Word) */}
                    <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
                        <Card
                            style={[
                                styles.card,
                                isImposter && { backgroundColor: theme.colors.errorContainer }
                            ]}
                            mode="elevated"
                        >
                            <Card.Content style={styles.cardContent}>
                                <Avatar.Icon
                                    size={64}
                                    icon={wordInfo.icon}
                                    style={{
                                        backgroundColor: isImposter
                                            ? theme.colors.error
                                            : theme.colors.primary
                                    }}
                                />
                                <Text
                                    variant="displaySmall"
                                    style={[
                                        styles.wordText,
                                        isImposter && imposterWordMode !== 'no_word' && { color: theme.colors.error }
                                    ]}
                                >
                                    {wordInfo.title}
                                </Text>
                                <Text
                                    variant="bodyLarge"
                                    style={{
                                        color: isImposter
                                            ? theme.colors.onErrorContainer
                                            : theme.colors.onSurfaceVariant,
                                        textAlign: 'center'
                                    }}
                                >
                                    {wordInfo.subtitle}
                                </Text>
                            </Card.Content>
                        </Card>
                    </Animated.View>
                </Pressable>
            </View>

            {/* Next Button */}
            <Surface style={styles.buttonContainer} elevation={4}>
                <Button
                    mode="contained"
                    onPress={handleNext}
                    style={styles.nextButton}
                    contentStyle={styles.buttonContent}
                    icon={isLastPlayer ? 'play' : 'cellphone-arrow-down'}
                >
                    {isLastPlayer
                        ? 'Start Discussion'
                        : `Pass to ${players[currentPlayerIndex + 1]?.name}`
                    }
                </Button>
            </Surface>
        </Surface>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
    },
    progressBar: {
        marginTop: 12,
        height: 6,
        borderRadius: 3,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
    },
    playerName: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    instruction: {
        marginBottom: 40,
    },
    cardContainer: {
        width: '100%',
        aspectRatio: 0.8,
        maxWidth: 320,
    },
    cardFace: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backfaceVisibility: 'hidden',
    },
    cardFront: {
        zIndex: 2,
    },
    cardBack: {
        zIndex: 1,
    },
    card: {
        flex: 1,
        justifyContent: 'center',
    },
    cardContent: {
        alignItems: 'center',
        padding: 24,
    },
    tapText: {
        marginTop: 24,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    wordText: {
        marginTop: 24,
        marginBottom: 8,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 34,
    },
    nextButton: {
        borderRadius: 12,
    },
    buttonContent: {
        paddingVertical: 8,
    },
});
