import { EmptyState, Screen } from '@project-car-garage/ui';

export default function PartsScreen() {
  return (
    <Screen>
      <EmptyState
        body="Track the first part you want, ordered, own, or plan to install."
        title="No parts tracked"
      />
    </Screen>
  );
}
