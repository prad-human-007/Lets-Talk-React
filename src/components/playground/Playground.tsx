"use client";

import { LoadingSVG } from "@/components/button/LoadingSVG";
import { ChatMessageType } from "@/components/chat/ChatTile";
import { ColorPicker } from "@/components/colorPicker/ColorPicker";
import { AudioInputTile } from "@/components/config/AudioInputTile";
import { ConfigurationPanelItem } from "@/components/config/ConfigurationPanelItem";
import { NameValueRow } from "@/components/config/NameValueRow";
import { PlaygroundHeader } from "@/components/playground/PlaygroundHeader";
import {
  PlaygroundTab,
  PlaygroundTabbedTile,
  PlaygroundTile,
} from "@/components/playground/PlaygroundTile";
import { useConfig } from "@/hooks/useConfig";
import { TranscriptionTile } from "@/transcriptions/TranscriptionTile";
import {
  BarVisualizer,
  VideoTrack,
  useConnectionState,
  useDataChannel,
  useLocalParticipant,
  useRoomInfo,
  useTracks,
  useVoiceAssistant,
} from "@livekit/components-react";
import { ConnectionState, LocalParticipant, Track } from "livekit-client";
import { QRCodeSVG } from "qrcode.react";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import tailwindTheme from "../../lib/tailwindTheme.preval";
import { Button } from "@/components/button/Button";
import { PlaygroundDeviceSelector } from "@/components/playground/PlaygroundDeviceSelector";
import { TrackToggle } from "@livekit/components-react";

export interface PlaygroundMeta {
  name: string;
  value: string;
}

export interface PlaygroundProps {
  logo?: ReactNode;
  themeColors: string[];
  onConnect: (connect: boolean, opts?: { token: string; url: string }) => void;
}

const headerHeight = 56;

export default function Playground({
  logo,
  themeColors,
  onConnect,
}: PlaygroundProps) {
  const { config, setUserSettings } = useConfig();
  const { name } = useRoomInfo();
  const [transcripts, setTranscripts] = useState<ChatMessageType[]>([]);
  const { localParticipant } = useLocalParticipant();

  const voiceAssistant = useVoiceAssistant();

  const roomState = useConnectionState();
  const tracks = useTracks();

  useEffect(() => {
    if (roomState === ConnectionState.Connected) {
      localParticipant.setCameraEnabled(config.settings.inputs.camera);
      localParticipant.setMicrophoneEnabled(config.settings.inputs.mic);
    }
  }, [config, localParticipant, roomState]);

  const agentVideoTrack = tracks.find( // agent to stream video
    (trackRef) =>
      trackRef.publication.kind === Track.Kind.Video &&
      trackRef.participant.isAgent
  );

  const localTracks = tracks.filter(
    ({ participant }) => participant instanceof LocalParticipant
  );
  const localVideoTrack = localTracks.find(
    ({ source }) => source === Track.Source.Camera
  );
  const localMicTrack = localTracks.find(
    ({ source }) => source === Track.Source.Microphone
  );

  const onDataReceived = useCallback(
    (msg: any) => {
      if (msg.topic === "transcription") {
        const decoded = JSON.parse(
          new TextDecoder("utf-8").decode(msg.payload)
        );
        let timestamp = new Date().getTime();
        if ("timestamp" in decoded && decoded.timestamp > 0) {
          timestamp = decoded.timestamp;
        }
        setTranscripts([
          ...transcripts,
          {
            name: "You",
            message: decoded.text,
            timestamp: timestamp,
            isSelf: true,
          },
        ]);
      }
    },
    [transcripts]
  );

  useDataChannel(onDataReceived);

  useEffect(() => {
    document.body.style.setProperty(
      "--lk-theme-color",
      // @ts-ignore
      tailwindTheme.colors[config.settings.theme_color]["500"]
    );
    document.body.style.setProperty(
      "--lk-drop-shadow",
      `var(--lk-theme-color) 0px 0px 18px`
    );
  }, [config.settings.theme_color]);

  const audioTileContent = useMemo(() => {
    const disconnectedContent = (
      <div className="flex flex-col items-center justify-center gap-2 italic text-gray-700 text-center w-full">
       Connect to get started.
      </div>
    );

    const waitingContent = (
      <div className="flex flex-col items-center gap-2 text-gray-700 text-center w-full">
        <LoadingSVG />
        Waiting for AI to connect...
      </div>
    );

    const visualizerContent = (
      <div
        className={`flex items-center justify-center w-full h-48 [--lk-va-bar-width:30px] [--lk-va-bar-gap:20px] [--lk-fg:var(--lk-theme-color)]`}
      >
        <BarVisualizer
          state={voiceAssistant.state}
          trackRef={voiceAssistant.audioTrack}
          barCount={5}
          options={{ minHeight: 20 }}
        />
      </div>
    );

    if (roomState === ConnectionState.Disconnected) {
      return disconnectedContent;
    }

    if (!voiceAssistant.audioTrack) {
      return waitingContent;
    }

    return visualizerContent;
  }, [
    voiceAssistant.audioTrack,
    config.settings.theme_color,
    roomState,
    voiceAssistant.state,
  ]);

  return (
    <>
      <div className="flex flex-col gap-4 w-full h-full py-3">

        <div className="flex flex-row justify-start gap-3  mb-4">
          <div>
            <Button
              accentColor={config.settings.theme_color}
              disabled={false}>
                Mission
            </Button>
          </div>
        </div>

        <div className="flex w-full h-full py-6 flex-col gap-2 item-center justify-around">
          
          <div className="flex flex-col py-6 gap-3 justify-around">
            <h1 className="text-4xl leading-tight text-center">
              India's First Realtime Voice AI Teacher
            </h1>
            <h1 className="text-l leading-tight text-center">
            Trained to give personalized tutoring to 
            Primary and Secondary Students
            </h1>
          </div>

          <div className="flex item-center justify-center">
            {/* <PlaygroundTile
                // title="Audio"
                className="w-full h-full grow"
                childrenClassName="justify-center"
              > */}
              {audioTileContent}
            {/* </PlaygroundTile> */}
          </div>

          <div className="flex flex-col item-center justify-center gap-2">
            <div className="flex item-center justify-center">
                  <Button
                    accentColor={
                      roomState === ConnectionState.Connected ? "red" : config.settings.theme_color
                    }
                    disabled={roomState === ConnectionState.Connecting}
                    onClick={() => {
                      onConnect(roomState === ConnectionState.Disconnected);
                    }}
                  >
                    {roomState === ConnectionState.Connecting ? (
                      <LoadingSVG />
                    ) : roomState === ConnectionState.Connected ? (
                      "Disconnect"
                    ) : (
                      "Connect"
                    )}
                  </Button>
            </div>

            <div>
              {localMicTrack && (
                // <ConfigurationPanelItem
                //   title="Microphone"
                //   deviceSelectorKind="audioinput"
                // >
                <div className="flex flex-col item-center gap-2 justify-center">
                  <div className="flex justify-center">
                  <div className="w-[200px] h-[50px] justify-center rounded-full overflow-hidden ">
                      <AudioInputTile trackRef={localMicTrack} />
                  </div>
                  </div>
                  
                  <div className="flex flex-row gap-2 item-center justify-center">
                      <TrackToggle
                        className=""
                        source={ Track.Source.Microphone }/>
                    <div className="rounded-lg justify-center overflow-hidden">
                      <PlaygroundDeviceSelector kind={"audioinput"} />
                    </div>
                  </div>
                </div>
                // </ConfigurationPanelItem>
              )}
            </div>

          </div> 
        </div>
        
        <div className="flex flex-row justify-center gap-3  mb-4">
          <div className="flex items-center italic">
              <h1>
                Made by Pradhumn &lt;3
              </h1>
            </div>
        </div>
      </div>
    </>
  );
}
