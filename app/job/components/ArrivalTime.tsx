import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import React from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import { Button, Icon } from "@rneui/themed";
import api, { responseDebug } from "../../../utils/api";

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
        .then(function (response) {
          const { data } = response;
          console.log({ data });
          setUpdated(true);
          fetchJob();
        })
        .catch(function (error) {
          setUpdated(false);
          responseDebug(error);
        });
    } else {
      // throw new Error("Invalid date or time");
    }
  };

  return (
    <View
      style={{
        padding: 10,
        marginVertical: 20,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "#ccc",
        paddingHorizontal: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          textAlign: "center",
        }}
      >
        Arrival Time
      </Text>
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
                {date
                  ? new Date(date).toDateString()
                  : new Date(timestamp).toDateString()}
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
                paddingHorizontal: 12,
                justifyContent: "space-between",
              }}
            >
              <Button
                size="sm"
                radius="sm"
                onPress={() => {
                  DateTimePickerAndroid.open({
                    mode: "date",
                    value: new Date(timestamp),
                    onChange: onChangeDate,
                  });
                }}
              >
                <Icon
                  name="calendar-edit"
                  type="material-community"
                  color="white"
                />
                Edit Date
              </Button>

              <Button
                size="sm"
                radius="sm"
                onPress={() => {
                  DateTimePickerAndroid.open({
                    mode: "time",
                    value: new Date(timestamp),
                    onChange: onChangeTime,
                  });
                }}
              >
                <Icon
                  name="clock-edit"
                  type="material-community"
                  color="white"
                />
                Edit Time
              </Button>
            </View>
          </View>
        )}
      </View>

      <View>
        {(date || time) && !updated && (
          <>
            <Button
              size="sm"
              buttonStyle={{
                borderRadius: 10,
                paddingVertical: 10,
                marginBottom: 10,
              }}
              color={"blue"}
              onPress={() => {
                updateArrivalTime();
              }}
            >
              Save
            </Button>
            <Button
              buttonStyle={{
                borderRadius: 10,
                paddingVertical: 5,
              }}
              type={"outline"}
              onPress={() => {
                setDate("");
                setTime("");
                setUpdated(false);
              }}
            >
              Cancel
            </Button>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  displayTimeContainer: {
    flexDirection: "row",
    overflow: "hidden",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
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
