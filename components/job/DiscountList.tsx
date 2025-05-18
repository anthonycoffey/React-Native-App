import React from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Discount } from '@/types';
import { centsToDollars } from '@/utils/money';
import { useColorScheme } from '@/components/useColorScheme';
import { getBorderColor, getTextColor, getPlaceholderTextColor } from '@/hooks/useThemeColor';
import { IconButton } from '@/components/Buttons';

interface DiscountListProps {
  discounts: Discount[];
  onRemoveDiscount: (discountId: number) => Promise<void>;
  isLoading: boolean;
  jobId: number;
}

const DiscountList: React.FC<DiscountListProps> = ({
  discounts,
  onRemoveDiscount,
  isLoading,
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
      scrollEnabled={false}
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
  },
  amountAndActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountAmount: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 70,
    textAlign: 'right',
  },
  removeButton: {
    marginLeft: 8,
    padding: 6,
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
