import { EmptyState, Screen } from '@project-car-garage/ui';

export default function GarageScreen() {
  return (
    <Screen>
      <EmptyState
        body="Add your first vehicle to start organizing its work, parts, and history."
        title="Your garage is ready"
      />
    </Screen>
  );
}
