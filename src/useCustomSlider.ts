import { useRef, type RefObject } from "react";
import { useSlider, useLocale, type AriaSliderProps, mergeProps, useMove } from "react-aria";
import type { Except } from "type-fest";
import { clamp, snapValueToStep } from "react-stately/private/utils/number";
import { useGlobalListeners } from "react-aria/private/utils/useGlobalListeners";
import type { ColorStops, useCustomSliderState } from "./useCustomSliderState";

export type CustomSliderProps = Except<AriaSliderProps, "value" | "onChange"> & {
  mode: "oklab" | "oklch";
  setSelected?: React.Dispatch<React.SetStateAction<ColorStops[number] | null>>;
};

export function useCustomSlider(
  props: CustomSliderProps,
  state: ReturnType<typeof useCustomSliderState>,
  trackRef: RefObject<Element | null>,
): ReturnType<typeof useSlider> {
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
        state.onChange((prev) => {
          return prev.map((cs, index) => {
            if (index === realTimeTrackDraggingIndex.current) {
              const value = snapValueToStep(
                state.getPercentValue(percent),
                state.getThumbMinValue(index),
                state.getThumbMaxValue(index),
                state.step,
              );
              const color = state.getInterpolatedColor(value, props.mode, index);
              return { ...cs, value, color };
            }
            return cs;
          }) as ColorStops;
        });
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
    if (
      trackRef.current &&
      !props.isDisabled &&
      state.values.every((_, i) => !state.isThumbDragging(i))
    ) {
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
      const color = state.getInterpolatedColor(value, props.mode);
      const newColorStops = [...state.value, { id: uuid, value, color }].toSorted(
        (a, b) => a.value - b.value,
      ) as ColorStops;
      const newColorStopIndex = newColorStops.findIndex((cs) => cs.id === uuid);

      e.preventDefault();

      if (newColorStopIndex >= 0) {
        realTimeTrackDraggingIndex.current = newColorStopIndex;
        state.setFocusedThumb(newColorStopIndex);
        currentPointer.current = id;

        state.onChange(newColorStops);
        state.setThumbDragging(newColorStopIndex, true);
        props.setSelected?.(newColorStops[newColorStopIndex]);

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
    return `linear-gradient(in ${props.mode} to ${to}, ${linearColorStop})`;
  };
  return {
    ...sliderAria,
    trackProps: mergeProps(
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
        style: {
          ...sliderAria.trackProps.style,
          background: generateBackground(),
        },
      },
      moveProps,
    ),
  };
}
