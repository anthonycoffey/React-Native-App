import React from 'react';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDateTime, formatRelative } from '@/utils/dates';
import globalStyles from '@/styles/globalStyles';
import { Job } from '@/types';
import Chip from '@/components/Chip';
import { LabelText } from '@/components/Typography';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getIconColor } from '@/hooks/useThemeColor';

type Props = { job: Job; id: number };

export default function JobHeader({ job, id }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const iconColor = getIconColor(colorScheme);

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={[styles.headerRow, { backgroundColor: 'transparent' }]}>
        <Text style={globalStyles.subtitle}>
          Created on {formatDateTime(job.createdAt)}
        </Text>
      </View>

      <View
        style={[
          globalStyles.chipContainer,
          styles.chipContainerStyle,
          { backgroundColor: 'transparent' },
        ]}
      >
        <Chip>{job.status.toUpperCase()}</Chip>
        <Chip>{job.paymentStatus.toUpperCase()}</Chip>
      </View>

      <View style={[styles.infoRow, { backgroundColor: 'transparent' }]}>
        <MaterialIcons
          name='directions-car'
          size={20}
          color={iconColor}
          style={styles.icon}
        />
        <LabelText>ETA</LabelText>
        <Text>{formatRelative(job.arrivalTime)}</Text>
      </View>

      <View style={[styles.infoRow, { backgroundColor: 'transparent' }]}>
        <MaterialIcons
          name='schedule'
          size={20}
          color={iconColor}
          style={styles.icon}
        />
        <LabelText>Arrival</LabelText>
        <Text>{formatDateTime(job.arrivalTime)}</Text>
      </View>

      <View style={[styles.infoRow, { backgroundColor: 'transparent' }]}>
        <MaterialIcons
          name='location-pin'
          size={20}
          color={iconColor}
          style={styles.icon}
        />
        <LabelText>Address</LabelText>
        <Text numberOfLines={2} style={styles.addressText}>
          {job.Address?.short}
        </Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 0,
  },
  chipContainerStyle: {
    marginTop: 4,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  icon: {
    marginRight: 4,
  },
  marginBottom: {
    marginBottom: 20,
  },
  addressText: {
    flex: 1,
  },
});
