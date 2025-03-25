import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import api, { responseDebug } from '@/utils/api';
import { AxiosError } from '@/types';
import globalStyles from '@/styles/globalStyles';
import { CardTitle } from '@/components/Typography';
import { PrimaryButton, OutlinedButton } from '@/components/Buttons';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { 
  getBackgroundColor, 
  getBorderColor, 
  getTextColor 
} from '@/hooks/useThemeColor';

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

  if (!timestamp) {
    return null; // If time is not provided, don't render anything
  }

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

  const updateArrivalTime = () => {
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
      api
        .patch(`/jobs/${jobId}`, {
          arrivalTime: arrivalTime,
        })
        .then(function () {
          setUpdated(true);
          fetchJob();
        })
        .catch(function (error: AxiosError) {
          setUpdated(false);
          responseDebug(error);
        });
    }
  };

  const colorScheme = useColorScheme();

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
              themeVariant={colorScheme}
            />
            <DateTimePicker
              value={new Date(timestamp)}
              mode='time'
              onChange={onChangeTime}
              themeVariant={colorScheme}
            />
          </>
        )}

        {Platform.OS === 'android' && (
          <View style={styles.androidContainer}>
            <View style={[
              styles.displayTimeContainer,
              {
                backgroundColor: colorScheme === 'dark' ? 'rgba(50, 50, 50, 0.5)' : 'rgba(224, 224, 224, 0.3)',
                borderColor: getBorderColor(colorScheme)
              }
            ]}>
              <Text style={[
                styles.displayTime,
                { color: getTextColor(colorScheme) }
              ]}>
                {date ? localeDateString(date) : localeDateString(timestamp)}
              </Text>
              <Text style={[
                styles.displayTime,
                { color: getTextColor(colorScheme) }
              ]}>
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
    // backgroundColor is now handled by ThemedView
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
    // backgroundColor is set dynamically
    borderWidth: 1,
    // borderColor is set dynamically
  },
  displayTime: {
    fontFamily: 'monospace',
    fontSize: 16,
    // color is set dynamically
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
