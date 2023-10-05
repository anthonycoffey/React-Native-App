import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { Text, Skeleton, Card, Chip, Button, Icon } from "@rneui/themed";
import { useLocalSearchParams } from "expo-router";
import api from "../../utils/api";
import { Job } from "../../types";
import { formatCentsToDollarsAndCents } from "../../utils/money";
import { formatDateTime, formatRelative } from "../../utils/dates";
import geocodeAddress from "../../utils/geocode";
import { ListItem } from "@rneui/base";
import { getApps, GetAppResult } from "react-native-map-link";
import ArrivalTime from "../../components/app/job/ArrivalTime";

type location = {
  lat: number;
  lng: number;
  place_id?: string;
  formatted_address?: string;
  location_type: string;
};
export default function JobPage() {
  const { id } = useLocalSearchParams();
  const [job, setJob] = useState<Job | null>(null);
  const [discountsTotal, setDiscountsTotal] = useState<number | undefined>(0);
  const [availableApps, setAvailableApps] = useState<
    | {
        id: string;
        name: string;
        icon: NodeRequire;
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
      (total, discount) => total + discount.amount,
      0,
    );
    console.log("discountsTotal", discountsTotal);
    setDiscountsTotal(discountsTotal);
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
          title: "The White House", // optional
          googleForceLatLon: false, // optionally force GoogleMaps to use the latlon for the query instead of the title
          appsWhiteList: ["google-maps"], // optionally you can set which apps to show (default: will show all supported apps installed on device)
        });
        setAvailableApps(result);
      }
    })();
  }, [location]);

  return (
    <ScrollView contentContainerStyle={styles.containerStyles}>
      {job ? (
        <>
          <View style={{ marginBottom: 20 }}>
            <View style={styles.topLeft}>
              <Icon name="calendar-clock" type="material-community" size={36} />
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

          <View style={styles.statusContainer}>
            <Chip> {job.status.toUpperCase()}</Chip>
            <Chip> {job.paymentStatus.toUpperCase().replace("-", " ")}</Chip>
          </View>
          {/*actions*/}
          <Card>
            <Card.Title>Job Actions</Card.Title>
            <Button
              color="green"
              size="lg"
              containerStyle={styles.buttonContainer}
            >
              On My Way
            </Button>
            <Button color="warning" containerStyle={styles.buttonContainer}>
              Quit Job
            </Button>
            <Button color="error" containerStyle={styles.buttonContainer}>
              Cancel Job
            </Button>
          </Card>
          {/*details*/}
          <Card>
            <Card.Title>Job Details</Card.Title>
            <Text style={styles.label}>Customer</Text>
            <TextInput
              //  @ts-ignore
              readOnly={true}
              value={job.Customer?.fullName}
              style={styles.input}
            />
            <Text style={styles.label}>Address</Text>
            <TextInput
              //  @ts-ignore
              readOnly={true}
              value={location?.formatted_address || job.Address?.short}
              style={styles.input}
            />
            <Text style={styles.label}>Phone</Text>
            <TextInput
              //  @ts-ignore
              readOnly={true}
              value={(() => {
                const lastFour = job.proxy?.CustomerPhone?.number;
                return "XXX-XXX-" + (lastFour ? lastFour.slice(-4) : "");
              })()}
              style={styles.input}
            />
            <Text style={styles.label}>Car</Text>

            <TextInput
              //  @ts-ignore
              readOnly={true}
              value={job?.Car?.concat}
              style={styles.input}
            />

            {Platform.OS === "ios" && (
              <ArrivalTime timestamp={job.arrivalTime} />
            )}

            <Text style={styles.openInMaps}>Open in Maps</Text>
            {availableApps.map(({ icon, name, id, open }) => (
              <Pressable key={id} onPress={open} style={styles.mapButton}>
                <Image source={icon} style={{ width: 60, height: 60 }} />
              </Pressable>
            ))}
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
            {job.JobLineItems?.map((item) => (
              <ListItem key={item.id}>
                <Icon name="cash-plus" type="material-community" />

                <ListItem.Content>
                  <Text>{item.Service.name}</Text>
                  <Text style={{ textAlign: "right" }}>
                    {formatCentsToDollarsAndCents(item.Service.price)}
                  </Text>
                </ListItem.Content>
              </ListItem>
            ))}
          </Card>
          {/*discounts*/}
          <Card>
            <Card.Title>Discounts</Card.Title>
            <Text style={{ textAlign: "right" }}>
              Total: {formatCentsToDollarsAndCents(discountsTotal)}
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
        </>
      ) : (
        <>
          <Skeleton height={50} animation="wave" style={styles.gap} />
          <Skeleton height={250} animation="wave" style={styles.gap} />
          <Skeleton height={50} animation="wave" style={styles.gap} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  containerStyles: {
    flexGrow: 1,
    padding: 10,
  },
  topLeft: {
    position: "absolute",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignContent: "center",
    top: 0,
    left: 0,
  },
  gap: {
    marginVertical: 5,
  },
  statusContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonContainer: {
    fontWeight: "bold",
    marginVertical: 5,
    borderRadius: 5,
    dropShadow: {
      shadowColor: "black",
      shadowOpacity: 0.1,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 0,
      },
    },
  },
  input: {
    padding: 10,
    marginVertical: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
  },
  lastCard: {
    paddingBottom: 500,
  },
  label: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#424242",
  },
  openInMaps: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  mapButton: {
    display: "flex",
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
  },
});
