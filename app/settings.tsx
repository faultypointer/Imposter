/**
 * Game Settings Screen - Configure imposter modes and game options
 */

import { Layout } from '@/constants/theme';
import { ImposterWordMode, useGame } from '@/contexts/game-context';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Divider,
    IconButton,
    List,
    RadioButton,
    Switch,
    Text,
    useTheme
} from 'react-native-paper';

export default function SettingsScreen() {
    const theme = useTheme();
    const {
        imposterCount,
        imposterWordMode,
        randomizeStartingPlayer,
        players,
        setImposterCount,
        setImposterWordMode,
        setRandomizeStartingPlayer,
    } = useGame();

    const maxImposters = Math.max(1, Math.floor(players.length / 3));

    const handleWordModeChange = (value: string) => {
        setImposterWordMode(value as ImposterWordMode);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTop}>
                        <Text variant="headlineLarge" style={styles.title}>
                            Settings
                        </Text>
                    </View>
                    <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                        Configure your game experience
                    </Text>
                </View>
                {/* Imposter Word Mode Section */}
                <List.Section>
                    <List.Subheader>Imposter Word Display</List.Subheader>
                    <RadioButton.Group
                        onValueChange={handleWordModeChange}
                        value={imposterWordMode}
                    >
                        <List.Item
                            title="Show Different Word"
                            description="Imposter sees a related but different word"
                            left={props => <List.Icon {...props} icon="eye" />}
                            right={() => (
                                <RadioButton value="different_word" />
                            )}
                            onPress={() => handleWordModeChange('different_word')}
                        />
                        <Divider />
                        <List.Item
                            title="Show No Word"
                            description="Imposter only knows they are the imposter"
                            left={props => <List.Icon {...props} icon="eye-off" />}
                            right={() => (
                                <RadioButton value="no_word" />
                            )}
                            onPress={() => handleWordModeChange('no_word')}
                        />
                        <List.Item
                            title="Show with Hint"
                            description="Imposter sees title with a hint from a Townie"
                            left={props => <List.Icon {...props} icon="lightbulb" />}
                            right={() => (
                                <RadioButton value="hint_mode" />
                            )}
                            onPress={() => handleWordModeChange('hint_mode')}
                        />
                    </RadioButton.Group>


                </List.Section>

                <Divider style={styles.sectionDivider} />

                {/* Number of Imposters */}
                <List.Section>
                    <List.Subheader>Number of Imposters</List.Subheader>
                    <View style={styles.imposterCountRow}>
                        <IconButton
                            icon="minus"
                            mode="contained-tonal"
                            onPress={() => setImposterCount(imposterCount - 1)}
                            disabled={imposterCount <= 1}
                        />
                        <View style={styles.countDisplay}>
                            <Text variant="displaySmall">{imposterCount}</Text>
                            <Text
                                variant="bodySmall"
                                style={{ color: theme.colors.onSurfaceVariant }}
                            >
                                {imposterCount === 1 ? 'Imposter' : 'Imposters'}
                            </Text>
                        </View>
                        <IconButton
                            icon="plus"
                            mode="contained-tonal"
                            onPress={() => setImposterCount(imposterCount + 1)}
                            disabled={imposterCount >= maxImposters}
                        />
                    </View>
                    <Text
                        variant="bodySmall"
                        style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}
                    >
                        Maximum {maxImposters} for {players.length} players
                    </Text>
                </List.Section>

                <Divider style={styles.sectionDivider} />

                {/* Other Settings */}
                <List.Section>
                    <List.Subheader>Game Options</List.Subheader>
                    <List.Item
                        title="Randomize Starting Player"
                        description="Randomly pick who speaks first each round"
                        left={props => <List.Icon {...props} icon="shuffle" />}
                        right={() => (
                            <Switch
                                value={randomizeStartingPlayer}
                                onValueChange={setRandomizeStartingPlayer}
                            />
                        )}
                    />
                </List.Section>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Done Button */}
            <View style={styles.buttonContainer}>
                <Button
                    mode="contained"
                    onPress={() => router.back()}
                    style={styles.doneButton}
                    contentStyle={styles.doneButtonContent}
                    labelStyle={styles.doneButtonLabel}
                    icon="check"
                >
                    Done
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
    },
    header: {
        marginBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    closeButton: {
        margin: 0,
    },
    sectionDivider: {
        marginVertical: 8,
    },
    imposterCountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    countDisplay: {
        alignItems: 'center',
        marginHorizontal: 32,
    },
    helperText: {
        textAlign: 'center',
        marginTop: 8,
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
    doneButton: {
        flex: 1,
        borderRadius: Layout.floatingBar.borderRadius,
        height: '100%',
        justifyContent: 'center',
    },
    doneButtonContent: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row-reverse',
    },
    doneButtonLabel: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.25,
    },
});
