import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDateTime, formatRelative } from '@/utils/dates';
import globalStyles from '@/styles/globalStyles';
import { Job } from '@/types';
import Chip from '@/components/Chip';
import { LabelText } from '@/components/Typography';

type Props = { job: Job; id: number };

export default function JobHeader({ job, id }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text>{job?.arrivalTime && formatDateTime(job.arrivalTime)}</Text>
        <Text style={globalStyles.label}>J-{id}</Text>
      </View>

      <View style={globalStyles.chipContainer}>
        <Chip>{job.status.toUpperCase()}</Chip>
        <Chip>{job.paymentStatus.toUpperCase()}</Chip>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons
          name='directions-car'
          size={20}
          color='#687076'
          style={styles.icon}
        />
        <LabelText>ETA</LabelText>
        <Text>{formatRelative(job.arrivalTime)}</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons
          name='schedule'
          size={20}
          color='#687076'
          style={styles.icon}
        />
        <LabelText>Arrival</LabelText>
        <Text>{formatDateTime(job.arrivalTime)}</Text>
      </View>

      <View style={[styles.infoRow, styles.marginBottom]}>
        <MaterialIcons
          name='location-pin'
          size={20}
          color='#687076'
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
