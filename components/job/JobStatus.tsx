import React, { useState } from 'react';
import { TextInput, Alert, StyleSheet, Modal } from 'react-native';
import api, { responseDebug } from '@/utils/api';
import globalStyles from '@/styles/globalStyles';
import { router } from 'expo-router';
import { AxiosError, Job } from '@/types';
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

  const updateJobStatus = (event: string) => {
    api
      .post(`/jobs/${job.id}/${event}`, { event })
      .then(() => {
        fetchJob();
      })
      .catch((error: AxiosError) => {
        responseDebug(error);
      });
  };

  const quitJob = () => {
    try {
      api.post(`/jobs/${job.id}/quit`).then(() => {
        router.back();
      });
    } catch (error) {
      console.log(error);
    }
  };

  const cancelJob = () => {
    try {
      api
        .post(`/jobs/${job.id}/cancel`, {
          comment: cancelComment,
        })
        .then(() => {
          router.back();
        });
    } catch (error) {
      console.log(error);
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
    <View style={[globalStyles.card, styles.container]}>
      <JobHeader job={job} id={job.id} />

      {job.status === 'in-progress' &&
        (!job.Invoices || job.Invoices.length === 0) && (
          <View style={[styles.infoAlert, styles.marginTop]}>
            <ErrorText>
              You must generate an invoice before finishing a job.
            </ErrorText>
          </View>
        )}

      {job.status === 'in-progress' &&
        (job.Invoices ?? []).length > 0 &&
        job.paymentStatus !== 'paid' && (
          <View style={[styles.infoAlert, styles.marginTop]}>
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
          <View style={[
            styles.modalContent, 
            { backgroundColor: useColorScheme() === 'dark' ? Colors.dark.background : 'white' }
          ]}>
            <HeaderText>Cancel Job?</HeaderText>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  globalStyles.input, 
                  { 
                    color: useColorScheme() === 'dark' ? Colors.dark.text : Colors.light.text,
                    backgroundColor: useColorScheme() === 'dark' ? '#2c2c2c' : 'white' 
                  }
                ]}
                placeholder='Enter reason for cancellation'
                placeholderTextColor={useColorScheme() === 'dark' ? '#9BA1A6' : '#687076'}
                value={cancelComment}
                onChangeText={setCancelComment}
                multiline
              />
            </View>

            <PrimaryButton
              title='Cancel Job'
              variant='error'
              onPress={() => {
                setShowCancelDialog(false);
                cancelJob();
              }}
              style={globalStyles.button}
            />
            <OutlinedButton
              variant='primary'
              title='Go Back'
              onPress={() => {
                setCancelComment('');
                setShowCancelDialog(false);
              }}
              style={{ width: '100%', marginTop: 10 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    borderRadius: 8,
    // backgroundColor is now handled by ThemedView
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonsContainer: {
    marginTop: 10,
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
    // backgroundColor is set dynamically based on theme
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  infoAlert: {
    borderWidth: 1,
    borderColor: 'red',
    backgroundColor: 'rgba(255, 0, 0, 0.1)', // Fixed typo and made more theme-friendly
    padding: 0,
    borderRadius: 5,
  },
});
