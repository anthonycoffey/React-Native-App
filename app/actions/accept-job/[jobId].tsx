import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
  View,
  Text,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService, HttpError } from '@/utils/ApiService';
import { Job } from '@/types';
import Card from '@/components/Card';
import { PrimaryButton } from '@/components/Buttons';
import { HeaderText, LabelText } from '@/components/Typography';
import { View as ThemedView } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getBackgroundColor,
  getBorderColor,
  getTextColor,
} from '@/hooks/useThemeColor';
import { centsToDollars } from '@/utils/money';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function AcceptJobScreen() {
  const { jobId: jobIdParam } = useLocalSearchParams<{ jobId: string }>();
  const jobId = jobIdParam ? parseInt(jobIdParam, 10) : null;
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';

  const [loading, setLoading] = useState<boolean>(true);
  const [job, setJob] = useState<Job | null>(null);

  const fetchJobDetails = useCallback(async () => {
    if (!jobId) {
      Alert.alert('Error', 'Job ID is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fetchedJob = await apiService.get<Job>(
        `/jobs/${jobId}/dispatch-details`
      );
      setJob(fetchedJob);
    } catch (error) {
      if (error instanceof HttpError && error.body?.message) {
        Alert.alert('Error', error.body.message);
      } else {
        Alert.alert('Error', 'Failed to load job details.');
      }
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  const handleAcceptJob = async () => {
    if (!job) return;
    setLoading(true);
    try {
      await apiService.post(`/jobs/${job.id}/accept`);
      Alert.alert('Success', 'Job accepted successfully.');
      router.replace(`/job/${job.id}`);
    } catch (error) {
      if (error instanceof HttpError && error.body?.message) {
        Alert.alert('Error', error.body.message);
        // Refresh job data in case status changed
        fetchJobDetails();
      } else {
        Alert.alert('Error', 'Failed to accept job.');
      }
      setLoading(false);
    }
  };

  const handleDeclineJob = async () => {
    if (!job) return;
    setLoading(true);
    try {
      await apiService.post(`/jobs/${job.id}/decline`);
      Alert.alert('Success', 'Job has been declined.');
      router.replace('/dashboard');
    } catch (error) {
      if (error instanceof HttpError && error.body?.message) {
        Alert.alert('Error', error.body.message);
      } else {
        Alert.alert('Error', 'Failed to decline job.');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size='large' />
      </ThemedView>
    );
  }

  if (!job) {
    return (
      <ThemedView style={styles.container}>
        <HeaderText>Job Not Found</HeaderText>
        <LabelText>
          This job could not be loaded. It may have been accepted by another
          technician or is no longer available.
        </LabelText>
      </ThemedView>
    );
  }

  if (job.status !== 'dispatching') {
    return (
      <ThemedView style={styles.container}>
        <Card>
          <HeaderText style={{ marginBottom: 10 }}>
            Job Not Available
          </HeaderText>
          <LabelText>
            {job.assignedTechnician
              ? `This job has already been accepted by ${job.assignedTechnician.fullName}.`
              : 'This job is not available to be accepted at this time.'}
          </LabelText>
        </Card>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[styles.scrollContainer, { backgroundColor: getBackgroundColor(theme) }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Card>
        <HeaderText style={styles.title}>J-{job.id}</HeaderText>

        <View style={styles.listItem}>
          <MaterialIcons
            name='location-on'
            size={24}
            color={getTextColor(theme)}
            style={styles.icon}
          />
          <View style={styles.listItemContent}>
            <Text style={[styles.listItemTitle, { color: getTextColor(theme) }]}>
              {job.Address.short}
            </Text>
            <LabelText>Address</LabelText>
          </View>
        </View>

        <View style={styles.listItem}>
          <MaterialIcons
            name='person'
            size={24}
            color={getTextColor(theme)}
            style={styles.icon}
          />
          <View style={styles.listItemContent}>
            <Text style={[styles.listItemTitle, { color: getTextColor(theme) }]}>
              {job.Customer.fullName}
            </Text>
            <LabelText>Customer</LabelText>
          </View>
        </View>

        <View
          style={[styles.divider, { borderBottomColor: getBorderColor(theme) }]}
        />

        <HeaderText style={styles.lineItemsHeader}>Services</HeaderText>
        {job.JobLineItems.map((item) => (
          <View style={styles.listItem} key={item.id}>
            <MaterialIcons
              name='build'
              size={24}
              color={getTextColor(theme)}
              style={styles.icon}
            />
            <Text
              style={[styles.lineItemText, { color: getTextColor(theme) }]}
            >
              {item.Service.name}
            </Text>
            <Text
              style={[styles.lineItemPrice, { color: getTextColor(theme) }]}
            >
              {centsToDollars(item.Service.price)}
            </Text>
          </View>
        ))}

        <View style={styles.actionsContainer}>
          <PrimaryButton
            title='Decline'
            onPress={handleDeclineJob}
            variant='error'
            disabled={loading}
            style={styles.button}
          />
          <PrimaryButton
            title='Accept'
            onPress={handleAcceptJob}
            variant='success'
            disabled={loading}
            style={styles.button}
          />
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
  },
  icon: {
    marginRight: 16,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginVertical: 16,
  },
  lineItemsHeader: {
    fontSize: 18,
    marginBottom: 16,
  },
  lineItemText: {
    flex: 1,
    fontSize: 16,
  },
  lineItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});
