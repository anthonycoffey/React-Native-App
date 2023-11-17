import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import React from "react";
import { Platform, StyleSheet } from "react-native";
import { Button, Card, View, Text, Stack } from "tamagui";
import api, { responseDebug } from "@/utils/api";
import { AxiosError } from "@/types";
import globalStyles from "@/styles/globalStyles";
import { CardTitle } from "@/components/Typography";

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
  const [date, setDate] = React.useState<string>("");
  const [time, setTime] = React.useState<string>("");
  const [updated, setUpdated] = React.useState<boolean>(false);

  if (!timestamp) {
    return null; // If time is not provided, don't render anything
  }

  const localeDateString = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const onChangeDate = (event: any, selectedDate: any) => {
    const {
      type,
      nativeEvent: { timestamp, utcOffset },
    } = event;
    if (type === "set") {
      setUpdated(false);
      setDate(selectedDate.toISOString());
    }
  };

  const onChangeTime = (event: any, selectedTime: any) => {
    const {
      type,
      nativeEvent: { timestamp, utcOffset },
    } = event;
    if (type === "set") {
      setUpdated(false);
      setTime(selectedTime.toISOString());
    }
  };

  const updateArrivalTime = () => {
    console.log({ date, time, timestamp });
    let arrivalTime = ``;
    if (date && time) {
      console.log("both date and time change");
      arrivalTime = `${date.split("T")[0]}T${time.split("T")[1]}`;
    } else if (time === "" && date) {
      console.log("only date change");
      let selectedTime = timestamp.split("T")[1];
      arrivalTime = `${date.split("T")[0]}T${selectedTime}`;
    } else if (date === "" && time) {
      console.log("only time change");
      arrivalTime = `${timestamp.split("T")[0]}T${time.split("T")[1]}`;
    }

    console.log({ arrivalTime });
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
    } else {
      // throw new Error("Invalid date or time");
    }
  };

  return (
    <Card style={globalStyles.card} elevation={4}>
      <CardTitle>Arrival Time</CardTitle>
      <View
        style={{
          paddingVertical: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {Platform.OS === "ios" && (
          <>
            <DateTimePicker
              value={new Date(timestamp)}
              mode="date"
              onChange={onChangeDate}
            />
            <DateTimePicker
              value={new Date(timestamp)}
              mode="time"
              onChange={onChangeTime}
            />
          </>
        )}

        {Platform.OS === "android" && (
          <View
            style={{
              flexDirection: "column",
              width: "100%",
            }}
          >
            <View style={styles.displayTimeContainer}>
              <Text style={styles.displayTime}>
                {date ? localeDateString(date) : localeDateString(timestamp)}
              </Text>
              <Text style={styles.displayTime}>
                {time
                  ? new Date(time).toLocaleTimeString()
                  : new Date(timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 10,
                justifyContent: "space-between",
              }}
            >
              <Button
                onPress={() => {
                  DateTimePickerAndroid.open({
                    mode: "date",
                    value: new Date(timestamp),
                    onChange: onChangeDate,
                  });
                }}
              >
                Edit Date
              </Button>

              <Button
                onPress={() => {
                  DateTimePickerAndroid.open({
                    mode: "time",
                    value: new Date(timestamp),
                    onChange: onChangeTime,
                  });
                }}
              >
                Edit Time
              </Button>
            </View>
          </View>
        )}
      </View>

      <View>
        {(date || time) && !updated && (
          <Stack space={5}>
            <Button
              size="$3"
              backgroundColor="$blue10"
              color="white"
              onPress={() => {
                updateArrivalTime();
              }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="$3"
              color="$red9"
              borderColor="$red9"
              borderWidth={1}
              onPress={() => {
                setDate("");
                setTime("");
                setUpdated(false);
              }}
            >
              Cancel
            </Button>
          </Stack>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  displayTimeContainer: {
    flexDirection: "row",
    overflow: "hidden",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(224,224,224,0.3)",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  displayTime: {
    fontFamily: "monospace",
    fontSize: 16,
    color: "#171515",
    textAlign: "center",
  },
});
