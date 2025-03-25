import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import globalStyles from '@/styles/globalStyles';
import { Job } from '@/types';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getInputBackgroundColor, getTextColor } from '@/hooks/useThemeColor';

type Props = {
  job: Job;
  location: {
    lat: number | undefined;
    lng: number | undefined;
    place_id?: string | undefined;
    formatted_address?: string | undefined;
    location_type: string | undefined;
  } | null;
};

export default function CustomerInfo({ job, location }: Props) {
  const maskedNumber =
    'XXX-XXX-' +
    (job.proxy?.CustomerPhone?.number
      ? job.proxy.CustomerPhone.number.slice(-4)
      : '');
      
  const colorScheme = useColorScheme();
  const inputStyles = [
    globalStyles.input, 
    { 
      backgroundColor: getInputBackgroundColor(colorScheme),
      color: getTextColor(colorScheme)
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={globalStyles.label}>Customer</Text>
      <TextInput
        editable={false}
        value={job.Customer?.fullName}
        style={inputStyles}
      />

      {job.proxy?.CustomerPhone?.number && (
        <>
          <Text style={globalStyles.label}>Phone</Text>
          <TextInput
            editable={false}
            value={maskedNumber}
            style={inputStyles}
          />
        </>
      )}

      <Text style={globalStyles.label}>Car</Text>
      <TextInput
        editable={false}
        value={job?.Car?.concat}
        style={inputStyles}
      />

      <Text style={globalStyles.label}>Address</Text>
      <TextInput
        editable={false}
        value={location?.formatted_address || job.Address?.short}
        style={inputStyles}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
});
