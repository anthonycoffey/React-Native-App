import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Alert } from 'react-native';
import { apiService, HttpError } from '@/utils/ApiService';
import globalStyles from '@/styles/globalStyles';
import { CardTitle } from '@/components/Typography';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getBorderColor, getTextColor } from '@/hooks/useThemeColor';

type ArrivalTimeProps = {
  timestamp?: string;
  jobId: number;
  fetchJob: () => void;
};

export default function ArrivalTime({
  timestamp,
  jobId,
  fetchJob,
}: ArrivalTimeProps) {
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [updated, setUpdated] = useState<boolean>(false);

  const colorScheme = useColorScheme() ?? 'light';

  const localeDateString = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const onChangeDate = (event: any, selectedDate: any) => {
    const { type } = event;
    if (type === 'set') {
      setUpdated(false);
      setDate(selectedDate.toISOString());
    }
  };

  const onChangeTime = (event: any, selectedTime: any) => {
    const { type } = event;
    if (type === 'set') {
      setUpdated(false);
      setTime(selectedTime.toISOString());
    }
  };

  if (!timestamp) {
    return null;
  }

  const updateArrivalTime = async () => {
    let arrivalTime = ``;
    if (date && time) {
      arrivalTime = `${date.split('T')[0]}T${time.split('T')[1]}`;
    } else if (time === '' && date) {
      let selectedTime = timestamp.split('T')[1];
      arrivalTime = `${date.split('T')[0]}T${selectedTime}`;
    } else if (date === '' && time) {
      arrivalTime = `${timestamp.split('T')[0]}T${time.split('T')[1]}`;
    }

    if (arrivalTime) {
      try {
        await apiService.patch(`/jobs/${jobId}`, {
          arrivalTime: arrivalTime,
        });
        setUpdated(true);
        fetchJob();
      } catch (error) {
        setUpdated(false);
        console.log('Failed to update arrival time:');
        if (error instanceof HttpError) {
          console.log(
            `  Status: ${error.status}, Body: ${JSON.stringify(error.body)}`
          );
          Alert.alert(
            'Error',
            `Failed to update arrival time. Server said: ${error.body?.message || error.message}`
          );
        } else {
          console.log('  An unexpected error occurred:', error);
          Alert.alert(
            'Error',
            'An unexpected error occurred while updating arrival time.'
          );
        }
      }
    }
  };

  return (
    <View style={[globalStyles.card, styles.container]}>
      <CardTitle>Arrival Time</CardTitle>
      <View style={styles.pickerContainer}>
        {Platform.OS === 'ios' && (
          <>
            <DateTimePicker
              value={new Date(timestamp)}
              mode='date'
              onChange={onChangeDate}
              themeVariant={colorScheme ?? undefined}
            />
            <DateTimePicker
              value={new Date(timestamp)}
              mode='time'
              onChange={onChangeTime}
              themeVariant={colorScheme ?? undefined}
            />
          </>
        )}

        {Platform.OS === 'android' && (
          <View style={styles.androidContainer}>
            <View
              style={[
                styles.displayTimeContainer,
                {
                  backgroundColor:
                    (colorScheme ?? 'light') === 'dark'
                      ? 'rgba(50, 50, 50, 0.5)'
                      : 'rgba(224, 224, 224, 0.3)',
                  borderColor: getBorderColor(colorScheme ?? 'light'),
                },
              ]}
            >
              <Text
                style={[
                  styles.displayTime,
                  { color: getTextColor(colorScheme ?? 'light') },
                ]}
              >
                {date ? localeDateString(date) : localeDateString(timestamp)}
              </Text>
              <Text
                style={[
                  styles.displayTime,
                  { color: getTextColor(colorScheme ?? 'light') },
                ]}
              >
                {time
                  ? new Date(time).toLocaleTimeString()
                  : new Date(timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <View style={styles.buttonRow}>
              <PrimaryButton
                title='Edit Date'
                onPress={() => {
                  DateTimePickerAndroid.open({
                    mode: 'date',
                    value: new Date(timestamp),
                    onChange: onChangeDate,
                  });
                }}
                style={styles.button}
              />
              <PrimaryButton
                title='Edit Time'
                onPress={() => {
                  DateTimePickerAndroid.open({
                    mode: 'time',
                    value: new Date(timestamp),
                    onChange: onChangeTime,
                  });
                }}
                style={styles.button}
              />
            </View>
          </View>
        )}
      </View>

      {(date || time) && !updated && (
        <View style={styles.actionsContainer}>
          <PrimaryButton
            title='Save'
            onPress={updateArrivalTime}
            style={styles.button}
          />
          <OutlinedButton
            title='Cancel'
            onPress={() => {
              setDate('');
              setTime('');
              setUpdated(false);
            }}
            style={[styles.button, styles.marginTop]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickerContainer: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  androidContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  displayTimeContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  displayTime: {
    fontFamily: 'monospace',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  actionsContainer: {
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  marginTop: {
    marginTop: 10,
  },
});
