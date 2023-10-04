import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Text, Skeleton, Card, Chip, Button, Icon } from '@rneui/themed';
import { useLocalSearchParams } from 'expo-router';
import api from '../../utils/api';
import { formatDateTime, formatRelative } from '../../utils/dates';
import { CardTitle } from '@rneui/base/dist/Card/Card.Title';
import { ListItem } from '@rneui/base';

export default function JobPage() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<Job | null>(null);

  const fetchJob = () => {
    console.log('id', id);

    api
      .get(`/jobs/${id}`)
      .then(function (response) {
        const { data } = response;
        console.log('data', data);
        setJob(data);
      })
      .catch(function (error) {
        //todo: add error handling
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      });
  };
  useEffect(() => {
    fetchJob();
  }, [id]);

  function formatCentsToDollarsAndCents(priceInCents: number): string {
    const priceInDollars = (priceInCents / 100).toFixed(2); // Convert cents to dollars and format with two decimal places
    return `$${priceInDollars}`;
  }

  // ["id", "status", "paymentStatus", "linkCode", "arrivalTime", "completedAt", "canceledAt", "createdAt", "updatedAt", "deletedAt", "CarId", "CustomerId", "FormSubmissionId", "dispatcherId", "assignedTechnicianId", "AddressId", "Address", "JobFiles", "Car", "Payments", "Invoices", "Discounts", "Payouts", "JobComments", "dispatcher", "assignedTechnician", "Customer", "JobLineItems", "JobActions", "proxy"]

  return (
    <ScrollView contentContainerStyle={styles.containerStyles}>
      {job ? (
        <>
          {/* {console.log()} */}
          <Text style={styles.topLeft}>
            {job?.arrivalTime && formatDateTime(job.arrivalTime)}
          </Text>

          <Text h3 style={{ textAlign: 'right' }}>
            #{id}
          </Text>

          <View style={styles.statusContainer}>
            <Chip> {job.status.toUpperCase()}</Chip>
            <Chip> {job.paymentStatus.toUpperCase()}</Chip>
          </View>

          <Card>
            <Card.Title>Job Actions</Card.Title>
            <Button type="outline" size="lg" style={styles.button}>
              ON MY WAY
            </Button>
            <Button color="warning" style={styles.button}>
              QUIT JOB
            </Button>
            <Button color="error" style={styles.button}>
              CANCEL JOB
            </Button>
          </Card>

          <Card>
            <Card.Title>Job Details</Card.Title>
            <TextInput
              readOnly
              value={job.Customer?.fullName}
              style={styles.input}
            />
            <TextInput
              readOnly
              value={job.Customer?.email}
              style={styles.input}
            />
            <TextInput
              readOnly
              value={job.Address?.short}
              style={styles.input}
            />
            <TextInput
              readOnly
              value={(() => {
                const lastFour = job.proxy?.CustomerPhone?.number;
                return 'XXX-XXX-' + (lastFour ? lastFour.slice(-4) : '');
              })()}
              style={styles.input}
            />
          </Card>
          <Card>
            <Card.Title>Job Activity</Card.Title>
            {job.JobActions?.map((a) => (
              <ListItem key={a.id}>
                <Icon name="minus" type="material-community" />
                <ListItem.Content>
                  <ListItem.Title>{a.action}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            ))}
          </Card>
          <Card>
            <Card.Title>Line Items</Card.Title>
            {job.JobLineItems?.map((item) => (
              <ListItem key={item.id}>
                <Icon name="cash-plus" type="material-community" />

                <ListItem.Content>
                  <Text>{item.Service.name}</Text>
                  <Text style={{ textAlign: 'right' }}>
                    {formatCentsToDollarsAndCents(item.Service.price)}
                  </Text>
                </ListItem.Content>
              </ListItem>
            ))}
          </Card>
        </>
      ) : (
        <>
          <Skeleton height={50} animation="wave" style={styles.gap} />
          <Skeleton height={250} animation="wave" style={styles.gap} />
          <Skeleton height={50} animation="wave" style={styles.gap} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerStyles: {
    flex: 1,
    padding: 10,
  },
  topLeft: {
    padding: 10,
    position: 'absolute',
    top: 4,
    left: 0,
    fontSize: 24,
  },
  gap: {
    marginVertical: 5,
  },
  statusContainer: {
    paddingVertical: 10,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
  },
  button: {
    marginVertical: 5,
  },
  input: {
    padding: 10,
    marginVertical: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
});
