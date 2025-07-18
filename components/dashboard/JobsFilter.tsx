import React, { useState, useCallback, Dispatch, SetStateAction } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
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
  { label: 'Newest', value: '-arrivalTime' },
  { label: 'Oldest', value: 'arrivalTime' },
];

interface JobsFilterProps {
  currentScope: string;
  setCurrentScope: Dispatch<SetStateAction<string>>;
  currentSortBy: string;
  setCurrentSortBy: Dispatch<SetStateAction<string>>;
}

export default function JobsFilter({
  currentScope,
  setCurrentScope,
  currentSortBy,
  setCurrentSortBy,
}: JobsFilterProps) {
  const [scopeOpen, setScopeOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

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
      marginBottom: 5,
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
    <View style={styles.filtersContainer}>
      <View style={styles.filterItem}>
        <DropDownPicker
          open={scopeOpen}
          value={currentScope}
          items={scopeOptions}
          setOpen={setScopeOpen}
          setValue={setCurrentScope}
          onOpen={onScopeOpen}
          placeholder='Select a status'
          listMode={Platform.OS === 'ios' ? 'SCROLLVIEW' : 'MODAL'}
          dropDownDirection='BOTTOM'
          multiple={false}
          theme={(theme ?? 'light') === 'dark' ? 'DARK' : 'LIGHT'}
          {...dropDownPickerStyles}
        />
      </View>
      <View style={styles.filterItem}>
        <DropDownPicker
          open={sortOpen}
          value={currentSortBy}
          items={sortOptions}
          setOpen={setSortOpen}
          setValue={setCurrentSortBy}
          onOpen={onSortOpen}
          placeholder='Select sort order'
          listMode={Platform.OS === 'ios' ? 'SCROLLVIEW' : 'MODAL'}
          dropDownDirection='BOTTOM'
          multiple={false}
          theme={(theme ?? 'light') === 'dark' ? 'DARK' : 'LIGHT'}
          {...dropDownPickerStyles}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  filterItem: {
    flex: 1,
    zIndex: 1000,
  },
});
