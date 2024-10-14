import {
  BarVisualizer,
  TrackReferenceOrPlaceholder,
} from "@livekit/components-react";

export const AudioInputTile = ({
  trackRef,
}: {
  trackRef: TrackReferenceOrPlaceholder;
}) => {
  return (
    <div
      className={`flex flex-row gap-2 h-full items-center w-full justify-center border rounded-sm border-gray-800 bg-gray-900`}
    >
      <BarVisualizer
        trackRef={trackRef}
        className="h-full w-full"
        barCount={15}
        options={{ minHeight: 0 }}
      />
    </div>
  );
};
