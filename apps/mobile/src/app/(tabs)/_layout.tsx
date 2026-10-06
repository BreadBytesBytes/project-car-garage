import { QuickAddButton, tokens } from '@project-car-garage/ui';
import { Tabs, useRouter } from 'expo-router';
import { View } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: tokens.colors.surface },
          headerTitleStyle: { color: tokens.colors.text },
          tabBarActiveTintColor: tokens.colors.accent,
          tabBarInactiveTintColor: tokens.colors.muted,
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Garage' }} />
        <Tabs.Screen name="work" options={{ title: 'Work' }} />
        <Tabs.Screen name="events" options={{ title: 'Events' }} />
        <Tabs.Screen name="parts" options={{ title: 'Parts' }} />
        <Tabs.Screen name="more" options={{ title: 'More' }} />
      </Tabs>
      <QuickAddButton onPress={() => router.push('/quick-add')} />
    </View>
  );
}
