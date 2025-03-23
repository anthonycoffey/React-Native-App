import React, { useEffect, useState, useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import api from '@/utils/api';
import { Job, AxiosResponse, AxiosError } from '@/types';
import JobStatus from './components/JobStatus';
import Invoice from './components/Invoice';
import JobDetailsAndMapButtons from './components/JobDetailsAndMapButtons';
import JobActivityLog from './components/JobActivityLog';
import JobLineItems from './components/JobLineItems';
import ArrivalTime from './components/ArrivalTime';
import { TakePayment } from './components/TakePayment';

function LoadingSpinner(props: { loading: boolean }) {
  return (
    <>
      {props.loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#0a7ea4' />
        </View>
      )}
    </>
  );
}

export default function JobPage() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<Job | false>(false);

  const fetchJob = useCallback(() => {
    setLoading(true);
    api
      .get(`/jobs/${id}`)
      .then(function (response: AxiosResponse) {
        const { data } = response;
        setJob(data);
      })
      .catch(function (error: AxiosError) {
        console.log(error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingSpinner loading={loading} />
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        nestedScrollEnabled={true}
      >
        {job && (
          <>
            <JobStatus job={job} fetchJob={fetchJob} />
            <JobDetailsAndMapButtons job={job} fetchJob={fetchJob} />
            <ArrivalTime
              timestamp={job.arrivalTime}
              jobId={job.id}
              fetchJob={fetchJob}
            />
            <JobLineItems job={job} fetchJob={fetchJob} />
            <Invoice job={job} fetchJob={fetchJob} />
            <TakePayment job={job} fetchJob={fetchJob} />
            <JobActivityLog job={job} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
