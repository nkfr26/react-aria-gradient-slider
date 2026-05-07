import { useRef, type RefObject } from "react";
import { type AriaSliderProps, useSlider, useLocale, useMove, mergeProps } from "react-aria";
import { useGlobalListeners } from "react-aria/private/utils/useGlobalListeners";
import { clamp } from "react-stately/private/utils/number";
import type { Except } from "type-fest";
import type { useGradientSliderState } from "./useGradientSliderState";

export type AriaGradientSliderProps = Except<AriaSliderProps, "value" | "onChange">;

export function useGradientSlider(
  props: AriaGradientSliderProps,
  state: ReturnType<typeof useGradientSliderState>,
  trackRef: RefObject<Element | null>,
) {
  const sliderAria = useSlider(props, state, trackRef);

  const { direction } = useLocale();
  const { addGlobalListener, removeGlobalListener } = useGlobalListeners();
  const [isVertical, reverseX] = [props.orientation === "vertical", direction === "rtl"];

  const realTimeTrackDraggingIndex = useRef<number | null>(null);
  const currentPosition = useRef<number | null>(null);
  const { moveProps } = useMove({
    onMoveStart() {
      currentPosition.current = null;
    },
    onMove({ deltaX, deltaY }) {
      if (!trackRef.current) {
        return;
      }
      const { height, width } = trackRef.current.getBoundingClientRect();
      const size = isVertical ? height : width;

      if (currentPosition.current === null && realTimeTrackDraggingIndex.current !== null) {
        currentPosition.current = state.getThumbPercent(realTimeTrackDraggingIndex.current) * size;
      }
      if (currentPosition.current === null) {
        return;
      }

      let delta = isVertical ? deltaY : deltaX;
      if (isVertical || reverseX) {
        delta = -delta;
      }

      currentPosition.current += delta;

      if (realTimeTrackDraggingIndex.current !== null && trackRef.current) {
        const percent = clamp(currentPosition.current / size, 0, 1);
        state.setThumbPercentAndColor(realTimeTrackDraggingIndex.current, percent);
      }
    },
    onMoveEnd() {
      if (realTimeTrackDraggingIndex.current !== null) {
        state.setThumbDragging(realTimeTrackDraggingIndex.current, false);
        realTimeTrackDraggingIndex.current = null;
      }
    },
  });

  const currentPointer = useRef<number | null | undefined>(undefined);
  const onDownTrack = (
    e: PointerEvent,
    id: number | undefined,
    clientX: number,
    clientY: number,
  ) => {
    if (trackRef.current && !props.isDisabled) {
      const { height, width, top, left } = trackRef.current.getBoundingClientRect();
      const size = isVertical ? height : width;
      const trackPosition = isVertical ? top : left;
      const clickPosition = isVertical ? clientY : clientX;
      const offset = clickPosition - trackPosition;
      let percent = offset / size;
      if (reverseX || isVertical) {
        percent = 1 - percent;
      }

      const uuid = crypto.randomUUID();
      const value = state.getPercentValue(percent);
      const color = state.getInterpolatedColor(value);
      const newColorStops = state.getAddedColorStops({ id: uuid, value, color });
      const newColorStopIndex = newColorStops.findIndex((cs) => cs.id === uuid);

      if (newColorStopIndex >= 0) {
        e.preventDefault();

        realTimeTrackDraggingIndex.current = newColorStopIndex;
        state.setFocusedThumb(newColorStopIndex);
        currentPointer.current = id;

        state.setThumbDragging(newColorStopIndex, true);
        state.onChange(newColorStops);
        state.setSelectedId?.(uuid);

        addGlobalListener(window, "pointerup", onUpTrack, false);
      } else {
        realTimeTrackDraggingIndex.current = null;
      }
    }
  };

  const onUpTrack = (e: PointerEvent) => {
    if (e.pointerId === currentPointer.current) {
      if (realTimeTrackDraggingIndex.current !== null) {
        state.setThumbDragging(realTimeTrackDraggingIndex.current, false);
        realTimeTrackDraggingIndex.current = null;
      }
      removeGlobalListener(window, "pointerup", onUpTrack, false);
    }
  };

  const generateBackground = () => {
    let to: string;
    if (props.orientation === "vertical") {
      to = "top";
    } else if (direction === "ltr") {
      to = "right";
    } else {
      to = "left";
    }
    const linearColorStop = state.value
      .map(({ color, value }) => `${color} ${state.getValuePercent(value) * 100}%`)
      .join(", ");
    return `linear-gradient(in ${state.mode} to ${to}, ${linearColorStop})`;
  };
  return {
    ...sliderAria,
    trackProps: mergeProps(
      // eslint-disable-next-line react-hooks/refs
      {
        ...sliderAria.trackProps,
        onMouseDown: undefined,
        onTouchStart: undefined,
        onPointerDown(e: PointerEvent) {
          if (e.pointerType === "mouse" && (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)) {
            return;
          }
          onDownTrack(e, e.pointerId, e.clientX, e.clientY);
        },
      },
      moveProps,
    ),
    background: generateBackground(),
  };
}
