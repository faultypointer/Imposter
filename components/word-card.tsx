/**
 * Word Card - Animated card for revealing player's word
 */

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface WordCardProps {
    word: string;
    playerName: string;
    isRevealed: boolean;
    onReveal: () => void;
}

export function WordCard({ word, playerName, isRevealed, onReveal }: WordCardProps) {
    const tint = useThemeColor({}, 'tint');
    const backgroundColor = useThemeColor({}, 'background');
    const flipProgress = useSharedValue(0);

    // Reset flip animation when player changes
    useEffect(() => {
        flipProgress.value = 0;
    }, [playerName, flipProgress]);

    const handlePress = () => {
        if (!isRevealed) {
            flipProgress.value = withTiming(1, {
                duration: 600,
                easing: Easing.out(Easing.cubic)
            });
            onReveal();
        }
    };

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
        return {
            transform: [{ rotateY: `${rotateY}deg` }],
            backfaceVisibility: 'hidden',
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipProgress.value, [0, 1], [180, 360]);
        return {
            transform: [{ rotateY: `${rotateY}deg` }],
            backfaceVisibility: 'hidden',
        };
    });

    return (
        <Pressable onPress={handlePress} style={styles.container}>
            {/* Front of card (tap to reveal) */}
            <Animated.View
                style={[
                    styles.card,
                    styles.cardFront,
                    { backgroundColor: tint },
                    frontAnimatedStyle
                ]}
            >
                <ThemedText style={styles.playerLabel} lightColor="#fff" darkColor="#fff">
                    {playerName}
                </ThemedText>
                <View style={styles.tapPromptContainer}>
                    <ThemedText style={styles.tapPrompt} lightColor="#fff" darkColor="#fff">
                        👆
                    </ThemedText>
                    <ThemedText style={styles.tapText} lightColor="rgba(255,255,255,0.9)" darkColor="rgba(255,255,255,0.9)">
                        Tap to reveal your word
                    </ThemedText>
                </View>
                <ThemedText style={styles.secretHint} lightColor="rgba(255,255,255,0.6)" darkColor="rgba(255,255,255,0.6)">
                    Don&apos;t let others see!
                </ThemedText>
            </Animated.View>

            {/* Back of card (word revealed) */}
            <Animated.View
                style={[
                    styles.card,
                    styles.cardBack,
                    { backgroundColor },
                    { borderColor: tint },
                    backAnimatedStyle
                ]}
            >
                <ThemedText style={styles.yourWordLabel}>Your word is:</ThemedText>
                <ThemedText style={[styles.word, { color: tint }]}>{word}</ThemedText>
                <ThemedText style={styles.rememberText}>
                    Remember it, then pass the phone!
                </ThemedText>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        position: 'absolute',
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    cardFront: {
        zIndex: 1,
    },
    cardBack: {
        borderWidth: 3,
    },
    playerLabel: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 40,
        opacity: 0.9,
    },
    tapPromptContainer: {
        alignItems: 'center',
    },
    tapPrompt: {
        fontSize: 64,
        marginBottom: 16,
    },
    tapText: {
        fontSize: 18,
        fontWeight: '500',
    },
    secretHint: {
        position: 'absolute',
        bottom: 30,
        fontSize: 14,
    },
    yourWordLabel: {
        fontSize: 18,
        marginBottom: 16,
        opacity: 0.7,
    },
    word: {
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
    },
    rememberText: {
        fontSize: 16,
        opacity: 0.6,
        textAlign: 'center',
        position: 'absolute',
        bottom: 30,
    },
});
