import React from "react";
import {
  Composition,
  registerRoot,
  staticFile,
} from "remotion";

import {
  getAudioDurationInSeconds,
} from "@remotion/media-utils";

import {
  StarChildVideo,
} from "./StarChildVideo";

const FPS = 30;
const DEFAULT_DURATION_SECONDS = 92;

const calculateMetadata = async ({
  props,
}) => {
  if (
    !props.audioFile ||
    typeof props.audioFile !== "string"
  ) {
    return {
      durationInFrames:
        DEFAULT_DURATION_SECONDS * FPS,

      props: {
        ...props,
        totalDurationSeconds:
          DEFAULT_DURATION_SECONDS,
      },
    };
  }

  const audioDurationSeconds =
    await getAudioDurationInSeconds(
      staticFile(props.audioFile)
    );

  const safeDurationSeconds =
    Math.max(
      Math.ceil(audioDurationSeconds + 1),
      30
    );

  return {
    durationInFrames:
      safeDurationSeconds * FPS,

    props: {
      ...props,
      totalDurationSeconds:
        safeDurationSeconds,
    },
  };
};

export const RemotionRoot = () => {
  return (
    <Composition
      id="StarChildVideo"
      component={StarChildVideo}
      durationInFrames={
        DEFAULT_DURATION_SECONDS * FPS
      }
      fps={FPS}
      width={1080}
      height={1920}
      calculateMetadata={
        calculateMetadata
      }
      defaultProps={{
        childName: "Mila",
        guardianStar: "Veyla",
        pages: [],
        audioFile: null,
        totalDurationSeconds:
          DEFAULT_DURATION_SECONDS,
      }}
    />
  );
};

registerRoot(RemotionRoot);