import { View, StyleSheet } from 'react-native';
import {
  ThemeProvider,
  createTheme,
  Card,
  ListItem,
  Button,
  Icon,
  Text,
  Chip,
} from '@rneui/themed';

import { formatDateTime } from '../../utils/dates';

type Customer = {
  fullName: string | null;
  concat: string | null;
  id: number | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  defaultPhoneId: number | null;
};

type Address = {
  short: string | null;
  id: number | null;
  address_1: string | null;
  address_2: string | null;
  city: string | null;
  state: string | null;
  zipcode: number | null;
  lat: number | null;
  lng: number | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type Job = {
  AddressId: number | null;
  Adddress: Address | null;
  CarId: number | null;
  Customer: Customer | null;
  CustomerId: number | null;
  FormSubmissionId: number | null;
  arrivalTime: string;
  assignedTechnician: object | null;
  assignedTechnicianId: number | null;
  canceledAt: string | null;
  completedAt: string | null;
  createdAt: string | null;
  deletedAt: string | null;
  dispatcherId: number | null;
  id: number | null;
  linkCode: string | null;
  paymentStatus: string | null;
  status: string | null;
  updatedAt: string | null;
};

type JobsListProps = {
  jobs: Job[] | null;
};

export default function JobsList({ jobs }: JobsListProps) {
  console.log(jobs);
  return (
    <View>
      <Text h3>My Jobs</Text>
      {jobs &&
        jobs.map((job, i) => (
          <ListItem
            key={i}
            bottomDivider
          >
            <ListItem.Content>
              <ListItem.Title>{job.Customer?.fullName}</ListItem.Title>
              <ListItem.Subtitle>
                <View>
                  <Text>{job.Customer?.email}</Text>
                  <Text>ARRIVAL TIME: {formatDateTime(job?.arrivalTime)}</Text>
                </View>
              </ListItem.Subtitle>
              <View style={styles.chipContainer}>
                {job?.paymentStatus && <Chip title={job?.paymentStatus} />}
                {job?.status && <Chip title={job?.status} />}
              </View>
            </ListItem.Content>
          </ListItem>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
