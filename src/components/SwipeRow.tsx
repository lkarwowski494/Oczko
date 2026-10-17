import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../core/theme';
import { t } from '../core/i18n';
import { confirm } from '../../lib/confirm';

export const SWIPE = {
  button: 80,
};

export type SwipeDecision = 'close' | 'open' | 'ask';

export function swipeDecision(dx: number, vx: number): SwipeDecision {
  const w = SWIPE.button;
  if (dx < -w * 1.8 || (dx < -w && vx < -1.5)) {
    return 'ask';
  }
  if (dx <= -w * 0.5 || vx < -0.5) {
    return 'open';
  }
  return 'close';
}

interface SwipeRowProps {
  label: string;
  title: string;
  message?: string;
  onDelete: () => void;
  disabled?: boolean;
  children: (a11yProps: any) => React.ReactNode;
}

export const SwipeRow: React.FC<SwipeRowProps> = ({
  label,
  title,
  message,
  onDelete,
  disabled = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    confirm({
      title,
      message,
      action: t('Usuń'),
      destructive: true,
      onConfirm: onDelete,
      onCancel: () => setIsOpen(false),
    });
  };

  const handleAccessibilityAction = (event: any) => {
    const actionName = event.nativeEvent?.actionName;
    if (actionName === 'delete') {
      handleDelete();
    }
  };

  const a11yProps = disabled
    ? {}
    : {
        accessibilityActions: [{ name: 'delete', label }],
        onAccessibilityAction: handleAccessibilityAction,
      };

  return (
    <View style={styles.container}>
      {!disabled && (
        <View style={styles.actionsContainer} pointerEvents={isOpen ? 'auto' : 'none'}>
          <Pressable
            style={[styles.deleteButton, !isOpen && styles.hiddenButton]}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel={label}
            aria-hidden={!isOpen}
          >
            <Text style={styles.deleteText}>{t('Usuń')}</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.content}>{children(a11yProps)}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  actionsContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: SWIPE.button,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.danger,
    zIndex: 1,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenButton: {
    opacity: 0,
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    backgroundColor: theme.colors.bgCard,
    zIndex: 2,
  },
});
