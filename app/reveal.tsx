/**
 * Word Reveal Screen - Each player taps to see their word
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WordCard } from '@/components/word-card';
import { useGame } from '@/contexts/game-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

export default function RevealScreen() {
    const tint = useThemeColor({}, 'tint');
    const {
        currentPlayerIndex,
        players,
        revealedPlayers,
        getPlayerWord,
        revealWord,
        nextPlayerReveal,
        startDiscussion,
    } = useGame();

    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer) return null;

    const isCurrentPlayerRevealed = revealedPlayers[currentPlayerIndex];
    const isLastPlayer = currentPlayerIndex === players.length - 1;

    const handleReveal = () => {
        revealWord(currentPlayerIndex);
    };

    const handleNext = () => {
        if (isLastPlayer) {
            startDiscussion();
            router.replace('/game');
        } else {
            nextPlayerReveal();
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Progress indicator */}
            <View style={styles.progressContainer}>
                <ThemedText style={styles.progressText}>
                    {currentPlayer.name} ({currentPlayerIndex + 1}/{players.length})
                </ThemedText>
                <View style={styles.progressBar}>
                    {players.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.progressDot,
                                {
                                    backgroundColor: i <= currentPlayerIndex ? tint : 'rgba(128,128,128,0.25)',
                                    transform: [{ scale: i === currentPlayerIndex ? 1.3 : 1 }],
                                }
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* Word Card */}
            <View style={styles.cardContainer}>
                <WordCard
                    word={getPlayerWord(currentPlayerIndex)}
                    playerName={currentPlayer.name}
                    isRevealed={isCurrentPlayerRevealed}
                    onReveal={handleReveal}
                />
            </View>

            {/* Next Button (only visible after reveal) */}
            {isCurrentPlayerRevealed && (
                <View style={styles.buttonContainer}>
                    <Pressable
                        style={[styles.nextButton, { backgroundColor: tint }]}
                        onPress={handleNext}
                    >
                        <ThemedText style={styles.nextButtonText} lightColor="#fff" darkColor="#fff">
                            {isLastPlayer ? 'Start Discussion' : `Pass to ${players[currentPlayerIndex + 1]?.name}`}
                        </ThemedText>
                    </Pressable>
                </View>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
    },
    progressContainer: {
        alignItems: 'center',
        marginBottom: 28,
    },
    progressText: {
        fontSize: 17,
        opacity: 0.8,
        marginBottom: 14,
        fontWeight: '600',
    },
    progressBar: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    cardContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 100,
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
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: '700',
    },
});

