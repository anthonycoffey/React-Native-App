import React, { useState, Dispatch, SetStateAction } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Chip from '@/components/Chip';
import { formatDateTime, formatRelative } from '@/utils/dates';
import { Job } from '@/types';
import { Text, View } from '@/components/Themed';
import globalStyles from '@/styles/globalStyles';
import Card from '@/components/Card';

type JobsListProps = {
  jobs:
    | {
        data: Job[];
        meta?: {
          currentPage: number;
          lastPage: number;
          limit: number;
          total: number;
        };
      }
    | Job[]
    | [];
  fetchJobs: () => void;
  loading?: boolean;
};

const ListEmptyComponent = () => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>🎉</Text>
      </View>
      <Text type='subtitle' style={styles.emptyTitle}>
        Looks like you are all caught up!
      </Text>
      <Text style={styles.emptyText}>
        No jobs found. Swipe down to refresh, and view new job assignments!
      </Text>
    </View>
  );
};

export default function JobsList({
  jobs,
  fetchJobs,
  loading = false,
}: JobsListProps) {
  const [refreshing, setRefreshing] = useState(false);

  // Process jobs data to handle different formats
  const jobsData = React.useMemo(() => {
    if (!jobs) return [];
    if (Array.isArray(jobs)) return jobs;
    if ('data' in jobs && Array.isArray(jobs.data)) return jobs.data;
    return [];
  }, [jobs]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchJobs();
    } catch (error) {
      console.log('Error refreshing jobs:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchJobs]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#0a7ea4' />
      </View>
    );
  }

  return (
    <FlatList
      refreshing={refreshing}
      onRefresh={onRefresh}
      data={jobsData}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => {
        return (
          <Card>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/job/[id]',
                  params: {
                    id: item.id,
                  },
                });
              }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.row}>
                  <MaterialIcons
                    name='person'
                    size={18}
                    color='#687076'
                    style={styles.icon}
                  />
                  <Text type='defaultSemiBold'>{item.Customer?.fullName}</Text>
                </View>
                <Text type='defaultSemiBold'>J-{item.id}</Text>
              </View>

              <View style={{ backgroundColor: 'transparent' }}>
                <View style={styles.row}>
                  <MaterialIcons
                    name='directions-car'
                    size={18}
                    color='#687076'
                    style={styles.icon}
                  />
                  <Text>{formatRelative(item.arrivalTime)}</Text>
                </View>

                <View style={styles.row}>
                  <MaterialIcons
                    name='schedule'
                    size={18}
                    color='#687076'
                    style={styles.icon}
                  />
                  <Text>{formatDateTime(item.arrivalTime)}</Text>
                </View>

                <View style={styles.row}>
                  <MaterialIcons
                    name='location-pin'
                    size={18}
                    color='#687076'
                    style={styles.icon}
                  />
                    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                    <Text style={styles.addressText}>
                      {item.Address?.address_1}
                    </Text>
                    {item.Address?.address_2 ? (
                      <Text style={styles.addressText}>
                      {item.Address.address_2}
                      </Text>
                    ) : null}
                    <Text style={styles.addressText}>
                      {[
                      item.Address?.city,
                      item.Address?.state,
                      item.Address?.zipcode,
                      ]
                      .filter(Boolean)
                      .join(', ')}
                    </Text>
                    </View>
                </View>
              </View>

              <View style={globalStyles.chipContainer}>
                {item?.paymentStatus && <Chip>{item.paymentStatus}</Chip>}
                {item?.status && <Chip>{item.status}</Chip>}
              </View>
            </TouchableOpacity>
          </Card>
        );
      }}
      keyExtractor={(item) => item.id.toString()}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flexGrow: 1,
    minHeight: 500,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    height: 400,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: '#fff8f7',
  },
  emoji: {
    fontSize: 40,
    lineHeight: 50,
    textAlign: 'center',
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
  errorText: {
    color: '#f44336',
  },
  cardHeader: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 6,
  },
  addressText: {
    flex: 1,
  },
});
