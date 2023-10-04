import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, ListItem, Text, Chip } from '@rneui/themed';
import { formatDateTime, formatRelative } from '../../utils/dates';
import { Job } from '../../types';
import { router } from 'expo-router';

type JobsListProps = {
  jobs: Job[] | null;
};

export default function JobsList({ jobs }: JobsListProps) {
  return (
    <ScrollView>
      <Text h3 style={styles.heading}>
        My Jobs
      </Text>
      {jobs &&
        jobs.map((job, i) => (
          <Card key={i}>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: '/job/[id]',
                  params: {
                    id: job.id,
                  },
                });
              }}
            >
              <ListItem>
                <ListItem.Content>
                  <ListItem.Title style={styles.jobTitle}>
                    {job.Customer?.fullName}
                  </ListItem.Title>
                  <ListItem.Subtitle>
                    <Text h4>
                      Arrival In: {formatRelative(job.arrivalTime)}
                    </Text>
                  </ListItem.Subtitle>
                  <View style={styles.details}>
                    <Text>Address: {job.Address.short} </Text>
                    <Text>Arrival Time: {formatDateTime(job.arrivalTime)}</Text>
                    <Text>Created At: {formatDateTime(job.createdAt)}</Text>
                  </View>
                  <View style={styles.chipContainer}>
                    {job?.paymentStatus && (
                      <Chip
                        title={job.paymentStatus.replace('-', ' ')}
                        containerStyle={styles.chip}
                      />
                    )}
                    {job?.status && (
                      <Chip title={job?.status} containerStyle={styles.chip} />
                    )}
                  </View>
                </ListItem.Content>
              </ListItem>
            </TouchableOpacity>
          </Card>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    paddingTop: 10,
    display: 'flex',
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 2,
  },
  heading: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginBottom: 20,
    marginTop: 10,
  },
  jobTitle: {
    fontWeight: 'bold',
  },
  details: {
    paddingTop: 5,
  },
});
