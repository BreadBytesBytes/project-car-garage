import { EmptyState, Screen } from '@project-car-garage/ui';

export default function EventsScreen() {
  return (
    <Screen>
      <EmptyState
        body="Add an autocross, track day, or other event to organize preparation in one place."
        title="No upcoming events"
      />
    </Screen>
  );
}
