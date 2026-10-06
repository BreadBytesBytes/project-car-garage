import { createButton } from '@gluestack-ui/button';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewProps,
} from 'react-native';
import { forwardRef, type PropsWithChildren } from 'react';

type GluestackStateProps = {
  states?: Record<string, boolean | undefined>;
};

const ButtonRoot = forwardRef<View, PressableProps & GluestackStateProps>(
  function ButtonRoot({ states: _states, ...props }, ref) {
    return <Pressable ref={ref} {...props} />;
  },
);
const ButtonLabel = forwardRef<Text, TextProps & GluestackStateProps>(
  function ButtonLabel({ states: _states, ...props }, ref) {
    return <Text ref={ref} {...props} />;
  },
);
const ButtonGroup = forwardRef<View, ViewProps & GluestackStateProps>(
  function ButtonGroup({ states: _states, ...props }, ref) {
    return <View ref={ref} {...props} />;
  },
);
const ButtonSpinner = forwardRef<
  React.ComponentRef<typeof ActivityIndicator>,
  React.ComponentProps<typeof ActivityIndicator> & GluestackStateProps
>(function ButtonSpinner({ states: _states, ...props }, ref) {
  return <ActivityIndicator ref={ref} {...props} />;
});
const ButtonIcon = forwardRef<View, ViewProps & GluestackStateProps>(
  function ButtonIcon({ states: _states, ...props }, ref) {
    return <View ref={ref} {...props} />;
  },
);

export const Button = createButton({
  Root: ButtonRoot,
  Text: ButtonLabel,
  Group: ButtonGroup,
  Spinner: ButtonSpinner,
  Icon: ButtonIcon,
});
export const ButtonText = Button.Text;

export const tokens = {
  colors: {
    accent: '#c2410c',
    background: '#f8fafc',
    border: '#cbd5e1',
    muted: '#475569',
    surface: '#ffffff',
    text: '#0f172a',
  },
  radius: 12,
  spacing: {
    md: 16,
    lg: 24,
  },
} as const;

export function Screen({ children }: PropsWithChildren) {
  return <View style={styles.screen}>{children}</View>;
}

export function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

export function QuickAddButton({ onPress }: Pick<PressableProps, 'onPress'>) {
  return (
    <Button
      accessibilityLabel="Quick Add"
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickAdd,
        pressed && styles.quickAddPressed,
      ]}
    >
      <ButtonText style={styles.quickAddText}>+ Quick Add</ButtonText>
    </Button>
  );
}

const styles = StyleSheet.create({
  body: {
    color: tokens.colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
    borderRadius: tokens.radius,
    borderWidth: 1,
    maxWidth: 480,
    padding: tokens.spacing.lg,
    width: '100%',
  },
  quickAdd: {
    alignItems: 'center',
    backgroundColor: tokens.colors.accent,
    borderRadius: 24,
    bottom: 76,
    elevation: 4,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 20,
    position: 'absolute',
    right: tokens.spacing.md,
    shadowColor: '#000000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickAddPressed: {
    opacity: 0.8,
  },
  quickAddText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  screen: {
    alignItems: 'center',
    backgroundColor: tokens.colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: tokens.spacing.lg,
  },
  title: {
    color: tokens.colors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});
