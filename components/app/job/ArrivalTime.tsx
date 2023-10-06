import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { View, Text } from "react-native";
import { Button } from "@rneui/themed";
import api, { requestDebug } from "../../../utils/api";

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
        })
        .catch(function (error) {
          setUpdated(false);
          requestDebug(error);
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
        borderRadius: 30,
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
        Edit Arrival Date/Time
      </Text>
      <View
        style={{
          paddingVertical: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
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
      </View>
      <View>
        {(date || time) && !updated && (
          <>
            <Button
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
