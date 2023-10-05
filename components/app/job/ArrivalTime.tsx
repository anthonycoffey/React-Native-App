import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import { View, Text } from "react-native";
import { Button } from "@rneui/themed";

interface ArrivalTimeProps {
  timestamp?: string;
}

export default function ArrivalTime({ timestamp }: ArrivalTimeProps) {
  const [date, setDate] = React.useState<string | null>(null);
  const [time, setTime] = React.useState<string | null>(null);

  if (!timestamp) {
    return null; // If time is not provided, don't render anything
  }

  const onChangeDate = (event: any, selectedDate: any) => {
    setDate(selectedDate);
  };

  const onChangeTime = (event: any, selectedTime: any) => {
    setTime(selectedTime);
  };

  console.log({ date, time });

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
        {(date || time) && (
          <>
            <Button
              buttonStyle={{
                borderRadius: 10,
                paddingVertical: 10,
                marginBottom: 10,
              }}
              color={"blue"}
              onPress={() => {
                console.log({ date, time });
                // todo: update the arrival time
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
                setDate(null);
                setTime(null);
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
