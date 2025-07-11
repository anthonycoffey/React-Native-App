import React from 'react';
import { StyleSheet } from 'react-native';
import { View as ThemedView, ViewProps } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { useThemeColor, getBorderColor } from '@/hooks/useThemeColor';

const Card: React.FC<ViewProps> = ({ style, children, ...otherProps }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const cardBackgroundColor = useThemeColor({}, 'card');
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
        style,
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
    marginHorizontal: 10,
    marginVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
});

export default Card;
