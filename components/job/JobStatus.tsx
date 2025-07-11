import React, { useState } from 'react';
import { TextInput, Alert, StyleSheet, Modal } from 'react-native';
import { apiService, HttpError } from '@/utils/ApiService';
import globalStyles from '@/styles/globalStyles';
import { router } from 'expo-router';
import { Job } from '@/types';
import JobHeader from '@/components/job/JobHeader';
import { ErrorText, HeaderText } from '@/components/Typography';
import { View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';

import {
  OutlinedButton,
  PrimaryButton,
  WarningButton,
} from '@/components/Buttons';

type Props = {
  job: Job;
  fetchJob: () => void;
};

export default function JobStatus({ job, fetchJob }: Props) {
  const colorScheme = useColorScheme() ?? 'light'; // Define colorScheme once
  const [cancelComment, setCancelComment] = useState<string>('');
  const [showCancelDialog, setShowCancelDialog] = useState<boolean>(false);
  const [cannotCancel, setCannotCancel] = useState<boolean>(false);
  const [isFinishDisabled, setIsFinishDisabled] = useState<boolean>(false);

  React.useEffect(() => {
    const finishDisabled =
      job.status === 'in-progress' &&
      (!job.Invoices ||
        job.Invoices.length === 0 ||
        (job.Invoices?.length > 0 && job.paymentStatus !== 'paid'));
    setIsFinishDisabled(finishDisabled);
  }, [job]);

  const updateJobStatus = async (event: string) => {
    try {
      await apiService.post(`/jobs/${job.id}/${event}`, { event });
      fetchJob();
    } catch (error) {
      console.log(`Failed to update job status for event ${event}:`);
      if (error instanceof HttpError) {
        console.log(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        Alert.alert(
          'Error',
          `Failed to update job status. Server said: ${error.body?.message || error.message}`
        );
      } else {
        console.log('  An unexpected error occurred:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred while updating job status.'
        );
      }
    }
  };

  const quitJob = async () => {
    try {
      await apiService.post(`/jobs/${job.id}/quit`);
      router.back();
    } catch (error) {
      console.log('Failed to quit job:');
      if (error instanceof HttpError) {
        console.log(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        Alert.alert(
          'Error',
          `Failed to quit job. Server said: ${error.body?.message || error.message}`
        );
      } else {
        console.log('  An unexpected error occurred:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred while quitting job.'
        );
      }
    }
  };

  const cancelJob = async () => {
    try {
      await apiService.post(`/jobs/${job.id}/cancel`, {
        comment: cancelComment,
      });
      router.back();
    } catch (error) {
      console.log('Failed to cancel job:');
      if (error instanceof HttpError) {
        console.log(
          `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
        );
        Alert.alert(
          'Error',
          `Failed to cancel job. Server said: ${error.body?.message || error.message}`
        );
      } else {
        console.log('  An unexpected error occurred:', error);
        Alert.alert(
          'Error',
          'An unexpected error occurred while canceling job.'
        );
      }
    }
  };

  const handleQuitJob = () => {
    Alert.alert(
      'Quit Job?',
      '⚠️ WARNING ⚠️\n\n If you select OK, you will no longer be assigned to this job.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        { text: 'OK', onPress: () => quitJob() },
      ]
    );
  };

  return (
    <View style={{ backgroundColor: 'transparent' }}>
      <JobHeader job={job} id={job.id} />

      {job.status === 'in-progress' &&
        (!job.Invoices || job.Invoices.length === 0) && (
          <View style={styles.marginTop}>
            <ErrorText>
              You must generate an invoice before finishing a job.
            </ErrorText>
          </View>
        )}

      {job.status === 'in-progress' &&
        (job.Invoices ?? []).length > 0 &&
        job.paymentStatus !== 'paid' && (
          <View style={styles.marginTop}>
            <ErrorText>
              You must accept payment before finishing a job.
            </ErrorText>
          </View>
        )}

      <View style={styles.buttonsContainer}>
        {job.status === 'assigned' && (
          <PrimaryButton
            title='On My Way'
            onPress={() => updateJobStatus('depart')}
            style={globalStyles.button}
          />
        )}

        {job.status === 'en-route' && (
          <PrimaryButton
            title='Start Job'
            onPress={() => updateJobStatus('start')}
            style={globalStyles.button}
          />
        )}

        {job.status === 'in-progress' && (
          <PrimaryButton
            title='Finish Job'
            onPress={() => {
              updateJobStatus('complete');
              setCannotCancel(true);
            }}
            style={globalStyles.button}
            disabled={isFinishDisabled}
          />
        )}

        {!cannotCancel && (
          <WarningButton
            title='Quit Job'
            onPress={handleQuitJob}
            style={styles.marginTop}
          />
        )}

        {!cannotCancel && (
          <OutlinedButton
            title='Cancel Job'
            variant='error'
            onPress={() => setShowCancelDialog(true)}
            style={styles.marginTop}
          />
        )}
      </View>

      <Modal
        animationType='fade'
        transparent={true}
        visible={showCancelDialog}
        onRequestClose={() => setShowCancelDialog(false)}
      >
        <View style={styles.modalBackground}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor:
                  colorScheme === 'dark' // Use defined colorScheme
                    ? Colors.dark.background
                    : Colors.light.background, // Use themed white
              },
            ]}
          >
            <HeaderText>Cancel Job?</HeaderText>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  globalStyles.themedFormInput, // Use new base style
                  {
                    color:
                      colorScheme === 'dark' // Use defined colorScheme
                        ? Colors.dark.text
                        : Colors.light.text,
                    backgroundColor:
                      colorScheme === 'dark'
                        ? '#2c2c2c'
                        : Colors.light.background, // Use themed white
                    // Add themed border color
                    borderColor:
                      colorScheme === 'dark' // Use defined colorScheme
                        ? Colors.dark.borderColor
                        : Colors.light.borderColor,
                  },
                ]}
                placeholder='Enter reason for cancellation'
                placeholderTextColor={
                  colorScheme === 'dark' ? '#9BA1A6' : '#687076' // Use defined colorScheme
                }
                value={cancelComment}
                onChangeText={setCancelComment}
                multiline
              />
            </View>

            <View style={styles.modalButtonContainer}>
              <OutlinedButton
                title='Go Back'
                onPress={() => {
                  setCancelComment('');
                  setShowCancelDialog(false);
                }}
              />
              <PrimaryButton
                title='Cancel Job'
                variant='error'
                onPress={() => {
                  setShowCancelDialog(false);
                  cancelJob();
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    marginTop: 10,
    backgroundColor: 'transparent',
  },
  marginTop: {
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});
