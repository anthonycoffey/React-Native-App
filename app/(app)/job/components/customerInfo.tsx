import React, { useState } from "react";
import { TextInput } from "react-native";
import { Text } from "@rneui/themed";
import globalStyles from "@/styles/globalStyles";
import { Job } from "@/types";

type Props = {
  job: Job;
  location: {
    lat: number | undefined;
    lng: number | undefined;
    place_id?: string | undefined;
    formatted_address?: string | undefined;
    location_type: string | undefined;
  };
};
export default function CustomerInfo({ job, location }: Props) {
  const [maskedNumber, setMaskedNumber] = useState<string>(
    "XXX-XXX-" + job.proxy?.CustomerPhone?.number.slice(-4),
  );
  return (
    <>
      <Text style={globalStyles.label}>Customer</Text>
      <TextInput
        //  @ts-ignore
        readOnly={true}
        value={job.Customer?.fullName}
        style={globalStyles.input}
      />
      <Text style={globalStyles.label}>Address</Text>
      <TextInput
        //  @ts-ignore
        readOnly={true}
        value={location?.formatted_address || job.Address?.short}
        style={globalStyles.input}
      />
      <Text style={globalStyles.label}>Phone</Text>
      <TextInput
        //  @ts-ignore
        readOnly={true}
        value={maskedNumber}
        style={globalStyles.input}
      />
      <Text style={globalStyles.label}>Car</Text>

      <TextInput
        //  @ts-ignore
        readOnly={true}
        value={job?.Car?.concat}
        style={globalStyles.input}
      />
    </>
  );
}
