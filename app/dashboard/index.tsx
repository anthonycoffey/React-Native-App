import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { View } from '@/components/Themed';
import JobsList from '@/components/JobsList';
import { apiService, HttpError } from '@/utils/ApiService';
import { Job } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import DropDownPicker from 'react-native-dropdown-picker';
import { LabelText } from '@/components/Typography';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBorderColor,
  getInputBackgroundColor,
  getTextColor,
  getPlaceholderTextColor,
} from '@/hooks/useThemeColor';

const scopeOptions = [
  { label: 'Active Jobs', value: 'active' },
  { label: 'Open Jobs', value: 'open' },
  { label: 'Completed Jobs', value: 'complete' },
  { label: 'Cancelled Jobs', value: 'cancelled' },
  { label: 'Unpaid Jobs', value: 'unpaid' },
  { label: 'All My Jobs', value: '' },
];

const sortOptions = [
  { label: 'Arrival Time (Newest First)', value: '-arrivalTime' },
  { label: 'Arrival Time (Oldest First)', value: 'arrivalTime' },
];

export default function JobsScreen() {
  const auth = useAuth();
  const session = auth?.session;
  const [loading, setLoading] = useState<boolean>(true);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [currentScope, setCurrentScope] = useState<string>('active');
  const [currentSortBy, setCurrentSortBy] = useState<string>('-arrivalTime');

  const [scopeOpen, setScopeOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const theme = useColorScheme() ?? 'light';

  const fetchJobs = useCallback(async () => {
    if (!session) {
      setJobs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let queryString = `/jobs/mine?sortBy=${currentSortBy}`;
    if (currentScope) {
      queryString += `&scope=${currentScope}`;
    }

    try {
      const fetchedJobs = await apiService.get<Job[]>(queryString);
      setJobs(fetchedJobs || []);
    } catch (error) {
      console.error('Error fetching jobs:');
      if (error instanceof HttpError) {
        console.error(
          `Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
      } else {
        console.error('An unexpected error occurred:', error);
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [session, currentScope, currentSortBy]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const onScopeOpen = useCallback(() => {
    setSortOpen(false);
  }, []);

  const onSortOpen = useCallback(() => {
    setScopeOpen(false);
  }, []);

  const dropDownPickerStyles = {
    style: {
      backgroundColor: getInputBackgroundColor(theme),
      borderColor: getBorderColor(theme),
      marginBottom: 15,
    },
    textStyle: {
      color: getTextColor(theme),
      fontSize: 16,
    },
    placeholderStyle: {
      color: getPlaceholderTextColor(theme),
    },
    dropDownContainerStyle: {
      backgroundColor: getInputBackgroundColor(theme),
      borderColor: getBorderColor(theme),
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <View style={styles.filterItem}>
          <LabelText style={styles.filterLabel}>Filter by Status:</LabelText>
          <DropDownPicker
            open={scopeOpen}
            value={currentScope}
            items={scopeOptions}
            setOpen={setScopeOpen}
            setValue={setCurrentScope}
            onOpen={onScopeOpen}
            placeholder='Select a status'
            zIndex={2000}
            zIndexInverse={1000}
            listMode={Platform.OS === 'ios' ? 'SCROLLVIEW' : 'MODAL'}
            dropDownDirection='BOTTOM'
            multiple={false}
            theme={(theme ?? 'light') === 'dark' ? 'DARK' : 'LIGHT'}
            {...dropDownPickerStyles}
          />
        </View>
        <View style={styles.filterItem}>
          <LabelText style={styles.filterLabel}>Sort by:</LabelText>
          <DropDownPicker
            open={sortOpen}
            value={currentSortBy}
            items={sortOptions}
            setOpen={setSortOpen}
            setValue={setCurrentSortBy}
            onOpen={onSortOpen}
            placeholder='Select sort order'
            zIndex={1000}
            zIndexInverse={2000}
            listMode={Platform.OS === 'ios' ? 'SCROLLVIEW' : 'MODAL'}
            dropDownDirection='BOTTOM'
            multiple={false}
            theme={(theme ?? 'light') === 'dark' ? 'DARK' : 'LIGHT'}
            {...dropDownPickerStyles}
          />
        </View>
      </View>
      <JobsList jobs={jobs} fetchJobs={fetchJobs} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10, // Reduced padding
    paddingTop: 10,
    paddingBottom: 0,
    alignItems: 'flex-start',
    justifyContent: 'space-between', // Distribute space between items
  },
  filterItem: {
    width: '48%', // Set width to slightly less than 50% to allow for gap
    marginBottom: 5,
  },
  filterLabel: {
    marginBottom: 8,
    fontSize: 14,
  },
});
