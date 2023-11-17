import React from "react";
import { TextInput, Alert } from "react-native";
import { Button, Card, Text, Sheet, Stack, YStack, XStack } from "tamagui";
import api, { responseDebug } from "@/utils/api";
import globalStyles from "@/styles/globalStyles";
import { router } from "expo-router";
import { AxiosError, Job } from "@/types";
import JobHeader from "@/app/(app)/job/components/JobHeader";
import { HeaderText } from "@/components/Typography";

type Props = {
  job: Job;
  fetchJob: () => void;
};
export default function JobStatus({ job, fetchJob }: Props) {
  const [cancelComment, setCancelComment] = React.useState<string>("");
  const [showCancelDialog, setShowCancelDialog] =
    React.useState<boolean>(false);
  const [cannotCancel, setCannotCancel] = React.useState<boolean>(false);
  const updateJobStatus = (event: string) => {
    api
      .post(`/jobs/${job.id}/${event}`, { event })
      .then(() => {
        fetchJob();
      })
      .catch((error: AxiosError) => {
        responseDebug(error);
      });
  };

  const quitJob = () => {
    try {
      api.post(`/jobs/${job.id}/quit`).then(() => {
        router.back();
      });
    } catch (error) {
      console.log(error);
    }
  };

  const cancelJob = () => {
    try {
      api
        .post(`/jobs/${job.id}/cancel`, {
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
    <Card style={globalStyles.card} elevation={4}>
      <JobHeader job={job} id={job.id} />

      <Stack space={5}>
        {job.status === "assigned" && (
          <Button
            onPress={() => {
              updateJobStatus("depart");
            }}
          >
            On My Way
          </Button>
        )}

        {job.status === "en-route" && (
          <Button
            onPress={() => {
              updateJobStatus("start");
            }}
          >
            Start Job
          </Button>
        )}

        {job.status === "in-progress" && (
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
        )}
        {!cannotCancel && (
          <Button
            color="red"
            onPress={() => {
              setShowCancelDialog(true);
            }}
          >
            Cancel Job
          </Button>
        )}
      </Stack>

      <Sheet
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        modal={true}
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame style={globalStyles.frameContainer} space>
          <HeaderText>Cancel Job?</HeaderText>
          <Text style={globalStyles.label}>Enter Reason</Text>
          <TextInput
            style={globalStyles.priceInput}
            onChange={(event) => {
              setCancelComment(event.nativeEvent.text);
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
        </Sheet.Frame>
      </Sheet>
    </Card>
  );
}
