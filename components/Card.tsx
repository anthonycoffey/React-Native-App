import React from 'react';
import { StyleSheet } from 'react-native';
import { View as ThemedView, ViewProps } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useThemeColor, getBorderColor } from '@/hooks/useThemeColor';

export interface CardProps extends ViewProps {
  // Add any specific card props if needed in the future
}

const Card: React.FC<CardProps> = ({ style, children, ...otherProps }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const cardBackgroundColor = useThemeColor({}, 'background');
  const cardBorderColor = getBorderColor(colorScheme);
  const themedShadowColor = useThemeColor({}, 'shadow');

  return (
    <ThemedView
      style={[
        styles.cardBase,
        {
          backgroundColor: cardBackgroundColor,
          borderColor: cardBorderColor,
          shadowColor: themedShadowColor,
        },
        style, // Allow overriding styles
      ]}
      {...otherProps}
    >
      {children}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 15, // Standardized margin
    borderWidth: StyleSheet.hairlineWidth, // Added for distinction
    // Shadow properties
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2, // Android shadow
  },
});

export default Card;
