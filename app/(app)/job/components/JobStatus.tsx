import React from "react";
import { TextInput, Alert } from "react-native";
import { Button, Card, Text, Dialog } from "tamagui";
import api, { responseDebug } from "@/utils/api";
import globalStyles from "@/styles/globalStyles";
import { router } from "expo-router";
import { AxiosError } from "@/types";

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
      .then(() => {
        fetchJob();
      })
      .catch((error: AxiosError) => {
        responseDebug(error);
      });
  };

  const quitJob = () => {
    try {
      api.post(`/jobs/${id}/quit`).then(() => {
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
        .then(() => {
          router.back();
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card>
      <Text> STATUS: {status.toUpperCase()}</Text>

      {status === "assigned" && (
        <Button
          onPress={() => {
            updateJobStatus("depart");
          }}
        >
          On My Way
        </Button>
      )}

      {status === "en-route" && (
        <Button
          onPress={() => {
            updateJobStatus("start");
          }}
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
          >
            Quit Job
          </Button>
          <Button
            onPress={() => {
              setShowCancelDialog(true);
            }}
          >
            Cancel Job
          </Button>
        </>
      )}

      <Dialog open={showCancelDialog}>
        <Dialog.Content>
          <Dialog.Title>Cancel Job?</Dialog.Title>
          <Text>{cancelComment}</Text>
          <Text style={globalStyles.label}>Enter Reason</Text>
          <TextInput
            style={globalStyles.input}
            onChange={(event) => {
              setCancelComment(event.nativeEvent.text); // todo: research this approach, tested fine on ios
            }}
          />
          <Button
            onPress={() => {
              setShowCancelDialog(false);
              cancelJob();
            }}
          >
            Cancel Job
          </Button>
          <Button
            onPress={() => {
              setCancelComment("");
              setShowCancelDialog(false);
            }}
          >
            Close Window
          </Button>
        </Dialog.Content>
      </Dialog>
    </Card>
  );
}
