import React from "react";
import { Button, Card, Text, Dialog, Divider } from "@rneui/themed";
import styles from "../../../styles/globalStyles";
import api, { responseDebug } from "../../../utils/api";
import globalStyles from "../../../styles/globalStyles";
import { router } from "expo-router";
import { TextInput, Alert } from "react-native";

type Props = {
  id: number;
  status: string;
  fetchJob: () => void;
};
export default function JobStatus({ id, status, fetchJob }: Props) {
  const [cancelComment, setCancelComment] = React.useState<string>("");
  const [showCancelDialog, setShowCancelDialog] =
    React.useState<boolean>(false);
  const [cannotCancel, setCannotCancel] = React.useState<boolean>(false);
  const updateJobStatus = (event: string) => {
    api
      .post(`/jobs/${id}/${event}`, { event })
      .then((res) => {
        fetchJob();
      })
      .catch((error) => {
        responseDebug(error);
      });
  };

  const quitJob = () => {
    try {
      api.post(`/jobs/${id}/quit`).then((res) => {
        router.back();
      });
    } catch (error) {
      console.log(error);
    }
  };

  const cancelJob = () => {
    try {
      api
        .post(`/jobs/${id}/cancel`, {
          comment: cancelComment,
        })
        .then((res) => {
          router.back();
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card>
      <Card.Title> STATUS: {status.toUpperCase()}</Card.Title>

      {status === "assigned" && (
        <Button
          onPress={() => {
            updateJobStatus("depart");
          }}
          color="green"
          size="lg"
          containerStyle={styles.buttonContainer}
        >
          On My Way
        </Button>
      )}

      {status === "en-route" && (
        <Button
          onPress={() => {
            updateJobStatus("start");
          }}
          color="green"
          size="lg"
          containerStyle={styles.buttonContainer}
        >
          Start Job
        </Button>
      )}

      {status === "in-progress" && (
        <Button
          onPress={() => {
            updateJobStatus("complete");
            setCannotCancel(true);
            // router.back();
          }}
          color="green"
          size="lg"
          containerStyle={styles.buttonContainer}
        >
          Finish Job
        </Button>
      )}

      {!cannotCancel && (
        <>
          <Button
            onPress={() => {
              Alert.alert(
                "Cancel Job?",
                "Please note, this action cannot be undone.",
                [
                  {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                  },
                  { text: "OK", onPress: () => quitJob() },
                ],
              );
            }}
            color="warning"
            containerStyle={styles.buttonContainer}
          >
            Quit Job
          </Button>
          <Button
            onPress={() => {
              setShowCancelDialog(true);
            }}
            color="error"
            containerStyle={styles.buttonContainer}
          >
            Cancel Job
          </Button>
        </>
      )}

      <Dialog
        isVisible={showCancelDialog}
        onBackdropPress={() => {
          setShowCancelDialog(false);
        }}
      >
        <Dialog.Title
          title="Cancel Job?"
          titleStyle={{ textAlign: "center", fontSize: 24 }}
        />
        <Text>{cancelComment}</Text>

        <Text style={globalStyles.label}>Enter Reason</Text>
        <TextInput
          style={globalStyles.input}
          onChange={(event) => {
            setCancelComment(event.nativeEvent.text); // todo: research this approach, tested fine on ios
          }}
        />
        <Divider
          style={{ marginVertical: 12 }}
          inset={true}
          insetType={"middle"}
        />
        <Button
          containerStyle={globalStyles.buttonContainer}
          onPress={() => {
            setShowCancelDialog(false);
            cancelJob();
          }}
          color="error"
        >
          Cancel Job
        </Button>
        <Button
          size={"sm"}
          type={"outline"}
          onPress={() => {
            setCancelComment("");
            setShowCancelDialog(false);
          }}
        >
          Close Window
        </Button>
      </Dialog>
    </Card>
  );
}
