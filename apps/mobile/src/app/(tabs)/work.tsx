import { EmptyState, Screen } from '@project-car-garage/ui';

export default function WorkScreen() {
  return (
    <Screen>
      <EmptyState
        body="Once you add a vehicle, create a task to plan the next useful garage session."
        title="No work planned yet"
      />
    </Screen>
  );
}
