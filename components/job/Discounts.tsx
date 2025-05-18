import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { centsToDollars } from '@/utils/money';
import { Discount, Job } from '@/types';
import globalStyles from '@/styles/globalStyles';
import { CardTitle, ErrorText } from '@/components/Typography';
import { View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBackgroundColor,
  getBorderColor,
  getTextColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';
import { PrimaryButton, IconButton } from '@/components/Buttons';
import { apiService } from '@/utils/ApiService';
import AddDiscountModal from './modals/AddDiscountModal'; // Import the modal

type Props = {
  job: Job;
  fetchJob: () => Promise<void>;
};

export default function Discounts({ job, fetchJob }: Props) {
  const [discountsTotal, setDiscountsTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const theme = useColorScheme() ?? 'light';

  useEffect(() => {
    const calculateTotal = () => {
      const total =
        job.Discounts?.reduce((acc, item) => acc + item.amount, 0) ?? 0;
      setDiscountsTotal(total);
    };
    calculateTotal();
  }, [job.Discounts]);

  const handleRemoveDiscount = async (discountId: number) => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this discount?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await apiService.delete(
                `/jobs/${job.id}/discounts/${discountId}`
              );
              await fetchJob(); // Refresh job data
              Alert.alert('Success', 'Discount removed successfully.');
            } catch (error) {
              console.error('Failed to remove discount:', error);
              Alert.alert(
                'Error',
                'Failed to remove discount. Please try again.'
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Discount }) => (
    <View
      style={[
        styles.discountItem,
        { borderBottomColor: getBorderColor(theme) },
      ]}
    >
      <Text style={[styles.discountReason, { color: getTextColor(theme) }]}>
        {item.reason}
      </Text>
      <Text style={[styles.discountAmount, { color: getTextColor(theme) }]}>
        {centsToDollars(item.amount)}
      </Text>
      <IconButton
        iconName='delete' // Changed to a more common icon name
        onPress={() => handleRemoveDiscount(item.id)}
        // color prop removed, will use default or inherit
        disabled={isLoading}
        // size prop removed
        style={{ marginLeft: 8 }}
      />
    </View>
  );

  return (
    <ThemedView
      style={[
        globalStyles.card,
        styles.container,
        { backgroundColor: getBackgroundColor(theme) },
      ]}
    >
      <View style={styles.headerContainer}>
        <CardTitle style={{ color: getTextColor(theme) }}>
          Discounts
        </CardTitle>
        <PrimaryButton
          title='Add Discount'
          onPress={() => setAddModalVisible(true)}
          style={styles.addButton}
          disabled={isLoading}
        />
      </View>
      <Text style={[styles.totalText, { color: getTextColor(theme) }]}>
        Total: {centsToDollars(+discountsTotal)}
      </Text>

      {isLoading && !job.Discounts?.length ? (
        <ActivityIndicator
          size='small'
          color={getTextColor(theme)}
          style={{ marginVertical: 10 }}
        />
      ) : null}

      {job.Discounts && job.Discounts.length > 0 ? (
        <FlatList
          data={job.Discounts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
          scrollEnabled={false} // If inside a ScrollView
        />
      ) : (
        <Text style={[styles.emptyText, { color: getPlaceholderTextColor(theme) }]}>
          No discounts applied
        </Text>
      )}

      <AddDiscountModal
        isVisible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        jobId={job.id}
        onSave={async (discountData) => {
          setIsLoading(true);
          try {
            await apiService.post(`/jobs/${job.id}/discounts`, discountData);
            await fetchJob(); // Refresh job data
            setAddModalVisible(false); // Close modal on success
            Alert.alert('Success', 'Discount added successfully.');
          } catch (error) {
            console.error('Failed to add discount:', error);
            Alert.alert(
              'Error',
              // @ts-ignore
              error?.body?.message || 'Failed to add discount. Please try again.'
            );
            // Keep modal open on error for user to retry or cancel
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    // Elevation and shadow are part of globalStyles.card, borderRadius might be too
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    // specific styles for button if needed, e.g. marginLeft
  },
  totalText: {
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  list: {
    marginTop: 10,
  },
  discountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  discountReason: {
    fontSize: 16,
    flex: 1, // Allow reason to take available space
  },
  discountAmount: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 8, // Add some spacing
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 10,
    fontStyle: 'italic',
  },
});
