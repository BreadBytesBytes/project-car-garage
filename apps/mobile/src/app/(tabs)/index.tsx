import {
  Button,
  ButtonText,
  EmptyState,
  Screen,
  tokens,
} from '@project-car-garage/ui';
import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function GarageScreen() {
  const router = useRouter();

  return (
    <Screen>
      <EmptyState
        body="Add your first vehicle to start organizing its work, parts, and history."
        title="Your garage is ready"
      />
      <Button
        accessibilityLabel="Add vehicle"
        onPress={() => router.push('/vehicles/new')}
        style={styles.button}
      >
        <ButtonText style={styles.buttonText}>Add vehicle</ButtonText>
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: tokens.colors.accent,
    borderRadius: tokens.radius,
    marginTop: tokens.spacing.md,
    minHeight: 48,
    padding: 14,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
