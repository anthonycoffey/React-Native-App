import React from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Discount } from '@/types';
import { centsToDollars } from '@/utils/money';
import { useColorScheme } from '@/components/useColorScheme';
import { getBorderColor, getTextColor, getPlaceholderTextColor } from '@/hooks/useThemeColor';
import { IconButton } from '@/components/Buttons';
// import { CardSubTitle } from '@/components/Typography'; // Assuming CardSubTitle or similar for item text - Removed as it's not exported

interface DiscountListProps {
  discounts: Discount[];
  onRemoveDiscount: (discountId: number) => Promise<void>;
  isLoading: boolean;
  jobId: number; // Added jobId as per Vue example, though removeDiscount directly uses discountId
}

const DiscountList: React.FC<DiscountListProps> = ({
  discounts,
  onRemoveDiscount,
  isLoading,
  // jobId, // Not directly used in this component's logic if onRemoveDiscount handles API call
}) => {
  const theme = useColorScheme() ?? 'light';

  const handleRemovePress = (discount: Discount) => {
    Alert.alert(
      'Remove Discount',
      `Are you sure you want to remove the discount "${discount.reason || 'Discount'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemoveDiscount(discount.id),
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Discount }) => (
    <View
      style={[
        styles.discountItemContainer,
        { borderBottomColor: getBorderColor(theme) },
      ]}
    >
      <View style={styles.discountInfo}>
        <Text style={[styles.discountReason, { color: getTextColor(theme) }]}>
          {item.reason || 'Discount'}
        </Text>
      </View>
      <View style={styles.amountAndActionContainer}>
        <Text style={[styles.discountAmount, { color: getTextColor(theme) }]}>
          -{centsToDollars(item.amount)}
        </Text>
        <IconButton
          iconName="delete"
          onPress={() => handleRemovePress(item)}
          disabled={isLoading}
          style={styles.removeButton}
          // Use theme color for icon if IconButton doesn't handle it
        />
      </View>
    </View>
  );

  if (!discounts || discounts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: getPlaceholderTextColor(theme) }]}>
          No discounts applied.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={discounts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      style={styles.list}
      scrollEnabled={false} // Assuming this list might be part of a larger scrollable view
    />
  );
};

const styles = StyleSheet.create({
  list: {
    marginTop: 8,
  },
  discountItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  discountInfo: {
    flex: 1,
    marginRight: 8,
  },
  discountReason: {
    fontSize: 16,
    // Using CardSubTitle might provide consistent styling
  },
  amountAndActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountAmount: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 70, // Ensure space for amount
    textAlign: 'right',
  },
  removeButton: {
    marginLeft: 8,
    padding: 6, // Make icon easier to tap
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});

export default DiscountList;
