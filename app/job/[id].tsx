import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Platform,
  KeyboardAvoidingView,
  ImageSourcePropType,
} from "react-native";
import { Text, Skeleton, Card, Chip, Icon } from "@rneui/themed";
import { useLocalSearchParams } from "expo-router";
import JobStatus from "../../components/app/job/JobStatus";
import { ListItem } from "@rneui/base";
import { Discount, Job, JobLineItems } from "../../types";
import geocodeAddress from "../../utils/geocode";
import { getApps, GetAppResult } from "react-native-map-link";
import ArrivalTime from "../../components/app/job/ArrivalTime";
import Invoice from "../../components/app/job/Invoice";
import { centsToDollars } from "../../utils/money";
import { formatDateTime } from "../../utils/dates";
import globalStyles from "../../styles/globalStyles";
import api from "../../utils/api";

type location = {
  lat: number;
  lng: number;
  place_id?: string;
  formatted_address?: string;
  location_type: string;
};

type availableAppsProps = {
  icon: ImageSourcePropType;
  name: string;
  id: number;
  open: () => Promise<void>;
};
export default function JobPage() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [discountsTotal, setDiscountsTotal] = useState<number>(0);
  const [availableApps, setAvailableApps] = useState<
    | {
        id: string;
        name: string;
        icon: ImageSourcePropType;
        open: () => Promise<void>;
      }[]
    | any
  >([]);
  const [location, setLocation] = useState<location | null>(null);

  const fetchJob = () => {
    api
      .get(`/jobs/${id}`)
      .then(function (response) {
        const { data } = response;
        setJob(data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  useEffect(() => {
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (!job) return;
    const discountsTotal = job.Discounts?.reduce(
      (total, discount: Discount) => total + discount.amount,
      0,
    );
    if (discountsTotal) {
      setDiscountsTotal(discountsTotal);
    }
  }, [job]);

  useEffect(() => {
    (async () => {
      try {
        const geoQry: string =
          job?.Address?.address_1 +
          " " +
          job?.Address?.address_2 +
          " " +
          job?.Address?.city +
          " " +
          job?.Address?.state +
          " " +
          job?.Address?.zipcode;
        const result = await geocodeAddress(geoQry);
        setLocation(result);
      } catch (error) {
        setLocation(null);
      }
    })();
  }, [job?.Address]);

  useEffect(() => {
    (async () => {
      if (location?.lat && location?.lng) {
        const { lat, lng, place_id } = location;
        const result = await getApps({
          latitude: lat,
          longitude: lng,
          alwaysIncludeGoogle: true, // optional, true will always add Google Maps to iOS and open in Safari, even if app is not installed (default: false)
          googlePlaceId: place_id,
          googleForceLatLon: true, // optionally force GoogleMaps to use the latlon for the query instead of the title
          appsWhiteList: ["google-maps", "apple-maps"], // optionally you can set which apps to show (default: will show all supported apps installed on device)
        });
        setAvailableApps(result);
      }
    })();
  }, [location]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={globalStyles.containerStyles}>
        {job?.id ? (
          <>
            <View style={{ marginBottom: 20 }}>
              <View style={globalStyles.topLeft}>
                <Icon
                  name="calendar-clock"
                  type="material-community"
                  size={36}
                />
                <Text
                  style={{
                    fontSize: 18,
                    marginLeft: 5,
                    fontWeight: "bold",
                  }}
                >
                  {job?.arrivalTime && formatDateTime(job.arrivalTime)}
                </Text>
              </View>
              <Text
                style={{ textAlign: "right", fontSize: 22, fontWeight: "bold" }}
              >
                #{id}
              </Text>
            </View>

            <View style={globalStyles.statusContainer}>
              <Chip> {job.status.toUpperCase()}</Chip>
              <Chip> {job.paymentStatus.toUpperCase()}</Chip>
            </View>
            {/*actions*/}
            <JobStatus id={job.id} status={job.status} fetchJob={fetchJob} />
            {/*details*/}
            <Card>
              <Card.Title>Job Details</Card.Title>
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
                value={(() => {
                  const lastFour = job.proxy?.CustomerPhone?.number;
                  return "XXX-XXX-" + (lastFour ? lastFour.slice(-4) : "");
                })()}
                style={globalStyles.input}
              />
              <Text style={globalStyles.label}>Car</Text>

              <TextInput
                //  @ts-ignore
                readOnly={true}
                value={job?.Car?.concat}
                style={globalStyles.input}
              />

              {Platform.OS === "ios" && (
                <ArrivalTime
                  timestamp={job.arrivalTime}
                  jobId={job.id}
                  fetchJob={fetchJob}
                />
              )}

              <Text style={globalStyles.openInMaps}>Open in Maps</Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {availableApps.map(
                  ({ icon, name, id, open }: availableAppsProps) => (
                    <Pressable
                      key={id}
                      onPress={open}
                      style={globalStyles.mapButton}
                    >
                      <Image source={icon} style={{ width: 60, height: 60 }} />
                    </Pressable>
                  ),
                )}
              </View>
            </Card>
            {/*activity*/}
            <Card>
              <Card.Title>Job Activity</Card.Title>
              {job.JobActions?.map((a) => (
                <ListItem key={a.id}>
                  <Icon name="minus" type="material-community" />
                  <ListItem.Content>
                    <ListItem.Title>{a.action}</ListItem.Title>
                  </ListItem.Content>
                </ListItem>
              ))}
            </Card>
            {/*line items*/}
            <Card>
              <Card.Title>Line Items</Card.Title>
              {job.JobLineItems?.map(
                (item: JobLineItems) =>
                  item.Service && (
                    <ListItem key={item.id}>
                      <Icon name="cash-plus" type="material-community" />
                      <ListItem.Content>
                        <Text>{item.Service.name}</Text>
                        <Text style={{ textAlign: "right" }}>
                          {centsToDollars(+item.Service.price)}
                        </Text>
                      </ListItem.Content>
                    </ListItem>
                  ),
              )}
            </Card>
            {/*discounts*/}
            <Card>
              <Card.Title>Discounts</Card.Title>
              <Text style={{ textAlign: "right" }}>
                Total: {centsToDollars(+discountsTotal)}
              </Text>
              <View>
                {job.Discounts?.map((item) => (
                  <ListItem key={item.id}>
                    <Icon name="cash-plus" type="material-community" />
                    <ListItem.Content>
                      <ListItem.Title>{item.reason}</ListItem.Title>
                    </ListItem.Content>
                  </ListItem>
                ))}
              </View>
            </Card>
            {/*payments*/}

            {job.paymentStatus != "paid" && (
              <Invoice job={job} fetchJob={fetchJob} />
            )}
          </>
        ) : (
          <>
            <Skeleton height={50} animation="wave" style={globalStyles.gap} />
            <Skeleton height={250} animation="wave" style={globalStyles.gap} />
            <Skeleton height={50} animation="wave" style={globalStyles.gap} />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
