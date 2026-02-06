/**
 * Word Reveal Screen - Pass-the-phone word reveal using React Native Paper
 * Uses Reanimated for flash card flip animation
 */

import { Layout } from '@/constants/theme';
import { GamePhase, useGame } from '@/contexts/game-context';
import * as Haptics from 'expo-haptics';
import { Redirect } from 'expo-router';
import { useRef, useState } from 'react';
import { LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import {
    Avatar,
    Button,
    Card,
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
        phase,
        imposterWordMode,
        hintWord,
        allHints,
        addHint,
        revealPass,
        revealOrder,
    } = useGame();

    const [verificationInput, setVerificationInput] = useState('');
    const [isVerificationModalVisible, setVerificationModalVisible] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [hintInput, setHintInput] = useState('');
    const [showPassPhone, setShowPassPhone] = useState(true);
    const revealTimeoutRef = useRef<any>(null);

    const rotation = useSharedValue(0);

    // Animated Styles
    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(
            rotation.value,
            [0, 180],
            [0, 180],
            Extrapolation.CLAMP
        );
        const scale = interpolate(
            rotation.value,
            [0, 90, 180],
            [1, 1.1, 1],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            rotation.value,
            [89, 90, 91],
            [1, 0, 0],
            Extrapolation.CLAMP
        );
        return {
            transform: [
                { perspective: 1200 },
                { rotateY: `${rotateValue}deg` },
                { scale }
            ],
            opacity,
            zIndex: rotation.value < 90 ? 2 : 1,
            elevation: rotation.value === 0 ? 4 : 0,
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(
            rotation.value,
            [0, 180],
            [180, 360],
            Extrapolation.CLAMP
        );
        const scale = interpolate(
            rotation.value,
            [0, 90, 180],
            [1, 1.1, 1],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            rotation.value,
            [89, 90, 91],
            [0, 0, 1],
            Extrapolation.CLAMP
        );
        return {
            transform: [
                { perspective: 1200 },
                { rotateY: `${rotateValue}deg` },
                { scale }
            ],
            opacity,
            zIndex: rotation.value >= 90 ? 2 : 1,
            elevation: rotation.value === 180 ? 4 : 0,
        };
    });

    if (phase !== GamePhase.REVEAL) {
        return <Redirect href="/game" />;
    }

    // Determine current player safely
    const actualPlayerIndex = revealOrder && revealOrder.length > 0
        ? revealOrder[currentPlayerIndex]
        : currentPlayerIndex;

    const currentPlayer = players[actualPlayerIndex];

    if (!currentPlayer) {
        return <Redirect href="/(tabs)" />;
    }

    const isLastPlayer = currentPlayerIndex === players.length - 1;
    const isImposter = isPlayerImposter(actualPlayerIndex);
    const playerWord = getPlayerWord(actualPlayerIndex);
    const progress = (currentPlayerIndex + 1) / players.length;

    const availableHints = allHints.filter(h => h.trim().length > 0);
    const randomHint = availableHints.length > 0
        ? availableHints[Math.floor(Math.random() * availableHints.length)]
        : null;

    const handlePressIn = () => {
        // Start a 500ms timer for reveal
        revealTimeoutRef.current = setTimeout(() => {
            rotation.value = withTiming(180, { duration: 400 });
            revealWord(actualPlayerIndex);

            // Trigger haptic feedback
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            revealTimeoutRef.current = null;
        }, 500);
    };

    const handlePressOut = () => {
        // Clear timeout if released before 500ms
        if (revealTimeoutRef.current) {
            clearTimeout(revealTimeoutRef.current);
            revealTimeoutRef.current = null;
        }

        rotation.value = withTiming(0, { duration: 400 });

        // Auto-verify in Pass 1, Modal in Pass 2
        if (revealPass === 1) {
            setIsVerified(true);
        } else {
            // Pass 2: Everyone must provide a hint
            if (!isVerified) {
                setTimeout(() => setVerificationModalVisible(true), 300);
            }
        }
    };

    const handlePassPhone = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowPassPhone(false);
    };

    const handleNext = () => {
        // If in pass 2 and not verified, open modal (safety check)
        if (revealPass === 2 && !isVerified) {
            setVerificationModalVisible(true);
            return;
        }

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        // Reset local state for next player
        setVerificationInput('');
        setHintInput('');
        setIsVerified(false);
        setVerificationModalVisible(false);

        nextPlayerReveal();
        setShowPassPhone(true);
    };

    const getWordDisplay = () => {
        if (revealPass === 1) {
            if (isImposter && (imposterWordMode === 'no_word' || imposterWordMode === 'hint_mode')) {
                return {
                    title: 'Imposter',
                    subtitle: 'Role: Imposter',
                    icon: 'incognito',
                };
            }

            return {
                title: playerWord,
                subtitle: isImposter ? 'Role: Imposter' : 'Secret Word',
                icon: isImposter ? 'incognito' : 'eye',
            };
        }

        // Pass 2: Hint Injection
        if (isImposter) {
            return {
                title: 'Hint Phase',
                subtitle: randomHint
                    ? `Hint: ${randomHint}`
                    : 'Provide a hint for the Imposter', // Disguise if first/unlucky
                icon: 'lightbulb-on',
            };
        }

        return {
            title: 'Hint Phase',
            subtitle: 'Provide a hint for the Imposter',
            icon: 'lightbulb',
        };
    };

    if (showPassPhone) {
        return (
            <View style={styles.container}>
                <View style={styles.passPhoneContainer}>
                    <Surface style={styles.passPhoneCard} elevation={2}>
                        <Avatar.Icon
                            size={80}
                            icon="cellphone-arrow-down"
                            style={{ backgroundColor: theme.colors.primaryContainer }}
                        />
                        <Text variant="headlineMedium" style={[styles.phaseTitle, { marginTop: 24 }]}>
                            Pass the Phone
                        </Text>

                        <Text variant="titleMedium" style={{ color: theme.colors.primary, marginTop: 8 }}>
                            To: {currentPlayer.name}
                        </Text>

                        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 16 }}>
                            Please hand the device to the next player securely.
                        </Text>

                        <Button
                            mode="contained"
                            onPress={handlePassPhone}
                            style={{
                                marginTop: 32,
                                width: '100%',
                                height: Layout.floatingBar.height,
                                borderRadius: Layout.floatingBar.borderRadius,
                            }}
                            contentStyle={styles.buttonContent}
                            labelStyle={styles.buttonLabel}
                            icon="account-arrow-right"
                        >
                            I am {currentPlayer.name}
                        </Button>
                    </Surface>
                </View>
            </View>
        );
    }

    const wordInfo = getWordDisplay();
    const isHintPhase = revealPass === 2;

    return (
        <View style={styles.container}>
            {/* Progress Header */}
            <View style={styles.header}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
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
                    style={[styles.instruction, { color: theme.colors.onSurfaceVariant, textAlign: 'center', width: '100%' }]}
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
                        <Card
                            style={[styles.card, { backgroundColor: theme.colors.elevation.level2, borderColor: theme.colors.outlineVariant, borderWidth: 1 }]}
                            mode="outlined"
                        >
                            <Card.Content style={styles.cardContent}>
                                <Avatar.Icon
                                    size={64}
                                    icon="fingerprint"
                                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                                    color={theme.colors.primary}
                                />
                                <Text
                                    variant="titleLarge"
                                    style={[styles.tapText, { color: theme.colors.primary, opacity: 0.9, textAlign: 'center', width: '100%' }]}
                                >
                                    SECRET CARD
                                </Text>
                                <Text
                                    variant="bodyMedium"
                                    style={{ color: theme.colors.onSurfaceVariant, opacity: 0.7, marginTop: 4, textAlign: 'center', width: '100%' }}
                                >
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
                                isImposter
                                    ? { backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error }
                                    : { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
                                { borderWidth: 1 }
                            ]}
                            mode="outlined"
                        >
                            <Card.Content style={styles.cardContent}>
                                <Avatar.Icon
                                    size={72}
                                    icon={wordInfo.icon}
                                    style={{
                                        backgroundColor: isImposter
                                            ? theme.colors.error
                                            : theme.colors.primaryContainer
                                    }}
                                    color={isImposter ? "white" : theme.colors.primary}
                                />
                                <Text
                                    variant="headlineMedium"
                                    style={[
                                        styles.wordText,
                                        isImposter ? { color: theme.colors.error } : { color: theme.colors.onSurface }
                                    ]}
                                >
                                    {wordInfo.title}
                                </Text>
                                <Text
                                    variant="bodyLarge"
                                    style={{
                                        color: theme.colors.onSurfaceVariant,
                                        textAlign: 'center',
                                        fontWeight: '500'
                                    }}
                                >
                                    {wordInfo.subtitle}
                                </Text>
                            </Card.Content>
                        </Card>
                    </Animated.View>
                </Pressable>

                {/* Verification / Hint Modal */}
                <Portal>
                    <Modal
                        visible={isVerificationModalVisible}
                        dismissable={false}
                        contentContainerStyle={styles.modalContent}
                    >
                        <Card>
                            <Card.Title
                                title={isHintPhase ? "Hint Contribution" : "Quick Verification"}
                                subtitle={isHintPhase ? "Enter a hint for the Imposter" : "Prove you paid attention"}
                                left={(props) => <Avatar.Icon {...props} icon={isHintPhase ? "lightbulb" : "lock"} />}
                            />
                            <Card.Content>
                                <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                                    {isHintPhase
                                        ? isImposter
                                            ? !randomHint
                                                ? "You are unlucky this time! You are the first person pretending to type the hint. Pretend to be typing a hint to blend in, you are the Imposter."
                                                : "Pretend to be typing a hint, you are the Imposter. Type anything to blend in."
                                            : "Enter a one-word hint that relates to the secret word."
                                        : "Type the secret word you just saw to confirm you remember it."
                                    }
                                </Text>

                                <TextInput
                                    mode="outlined"
                                    label={isHintPhase ? "Hint Word" : "Secret Word"}
                                    value={isHintPhase ? hintInput : verificationInput}
                                    onChangeText={isHintPhase ? setHintInput : setVerificationInput}
                                    autoFocus
                                    style={{ marginBottom: 16 }}
                                />

                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        if (isHintPhase) {
                                            if (hintInput.trim().length > 0) {
                                                if (!isImposter) {
                                                    addHint(hintInput.trim());
                                                }
                                                setIsVerified(true);
                                                setVerificationModalVisible(false);
                                            }
                                        } else {
                                            if (verificationInput.trim().length > 0) {
                                                setIsVerified(true);
                                                setVerificationModalVisible(false);
                                            }
                                        }
                                    }}
                                    disabled={(isHintPhase ? hintInput : verificationInput).trim().length === 0}
                                >
                                    Confirm
                                </Button>
                            </Card.Content>
                        </Card>
                    </Modal>
                </Portal>
            </View>

            {/* Next Button */}
            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={handleNext}
                    disabled={!isVerified}
                    style={styles.nextButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    icon={isLastPlayer ? 'play' : 'cellphone-arrow-down'}
                >
                    {isLastPlayer
                        ? isHintPhase
                            ? 'Reveal Results'
                            : imposterWordMode === 'hint_mode'
                                ? 'Go to Hint Round'
                                : 'Start Discussion'
                        : `Pass to ${players[revealOrder[currentPlayerIndex + 1]]?.name || 'Next'}`
                    }
                </Button>
            </View>
        </View>
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
        textAlign: 'center',
    },
    instruction: {
        marginBottom: 60,
        textAlign: 'center',
    },
    cardContainer: {
        width: '100%',
        aspectRatio: 0.8,
        maxWidth: 320,
        marginVertical: 20,
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
        borderRadius: 32,
    },
    cardContent: {
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
    nextButton: {
        flex: 1,
        borderRadius: Layout.floatingBar.borderRadius,
        height: '100%',
        justifyContent: 'center',
    },
    buttonContent: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row-reverse', // Icon on the right
    },
    buttonLabel: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.25,
        textAlign: 'center',
    },
    modalContent: {
        padding: 20,
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
    phaseTitle: {
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
});
