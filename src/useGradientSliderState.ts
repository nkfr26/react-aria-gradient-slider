import { interpolate, formatHex8 } from "culori/fn";
import { useRef } from "react";
import { type Color, parseColor, type SliderStateOptions, useSliderState } from "react-stately";
import { snapValueToStep } from "react-stately/private/utils/number";
import type { Except } from "./utils";

type ColorStop = { id: string; value: number; color: Color };

const MIN_COLOR_STOPS = 2;

export type ColorStops = [ColorStop, ColorStop, ...ColorStop[]];

export type Mode = "oklab" | "oklch";

export type SelectedId = string | null;

export type GradientSliderStateOptions = Except<
  SliderStateOptions<number[]>,
  "value" | "defaultValue" | "onChange" | "onChangeEnd"
> & {
  value: ColorStops;
  onChange: React.Dispatch<React.SetStateAction<ColorStops>>;
  mode: Mode;
} & (
    | { selectedId?: never; setSelectedId?: never }
    | { selectedId: SelectedId; setSelectedId: React.Dispatch<React.SetStateAction<SelectedId>> }
  );

export function useGradientSliderState(props: GradientSliderStateOptions) {
  const state = useSliderState({
    ...props,
    value: props.value.map((cs) => cs.value),
    onChange: (value) => {
      props.onChange((prev) => prev.map((cs, i) => ({ ...cs, value: value[i] })) as ColorStops);
    },
  });

  const draggingRef = useRef(new Set<number>());
  const isThumbDragging = (index: number) => draggingRef.current.has(index);
  const setThumbDragging = (index: number, dragging: boolean) => {
    state.setThumbDragging(index, dragging);
    if (dragging) {
      draggingRef.current.add(index);
    } else {
      draggingRef.current.delete(index);
    }
  };

  const privateGetInterpolatedColor = (value: number, filterIndex?: number) => {
    const interpolator = interpolate(
      props.value
        .filter((_, index) => index !== filterIndex)
        .map((cs) => [cs.color.toString("hexa"), state.getValuePercent(cs.value)]),
      props.mode,
    );
    return parseColor(formatHex8(interpolator(state.getValuePercent(value))));
  };

  const getAddedColorStops = (colorStop: ColorStop): ColorStops => {
    if (props.value.some((cs) => cs.value === colorStop.value)) {
      return props.value;
    }
    return [...props.value, colorStop].toSorted((a, b) => a.value - b.value) as ColorStops;
  };

  const setThumbPercentColor = (index: number, percent: number) => {
    props.onChange((prev) => {
      return prev.map((cs, i) => {
        if (i === index) {
          const value = snapValueToStep(
            state.getPercentValue(percent),
            state.getThumbMinValue(i),
            state.getThumbMaxValue(i),
            state.step,
          );
          const color = privateGetInterpolatedColor(value, i);
          return { ...cs, value, color };
        }
        return cs;
      }) as ColorStops;
    });
  };

  const updateColorStop = (id: string, updates: Partial<Except<ColorStop, "id">>) => {
    props.onChange(
      (prev) => prev.map((cs) => (cs.id === id ? { ...cs, ...updates } : cs)) as ColorStops,
    );
  };

  const removeColorStop = (id: string) => {
    if (props.value.length === MIN_COLOR_STOPS) {
      return;
    }
    props.onChange((prev) => prev.filter((cs) => cs.id !== id) as ColorStops);

    const removedIndex = props.value.findIndex((cs) => cs.id === id);
    const prevStop = props.value[removedIndex - 1];
    const nextStop = props.value[removedIndex + 1];
    props.setSelectedId?.((prev) => {
      if (prev !== id) return prev;
      if (prevStop) return prevStop.id;
      if (nextStop) return nextStop.id;
      return null;
    });
  };

  const getAddableValue = (referenceId?: string): number | null => {
    const resolvedId = referenceId ?? props.selectedId ?? props.value[0].id;
    const referenceIndex = props.value.findIndex((cs) => cs.id === resolvedId);
    const referenceStop = props.value[referenceIndex];
    if (referenceStop === undefined) {
      return null;
    }
    const nextStop = props.value[referenceIndex + 1];
    const maxValue = nextStop ? nextStop.value : state.getThumbMaxValue(referenceIndex);
    const value = snapValueToStep(
      (referenceStop.value + maxValue) / 2,
      state.getThumbMinValue(referenceIndex),
      state.getThumbMaxValue(referenceIndex),
      state.step,
    );
    if (props.value.some((cs) => cs.value === value)) {
      return null;
    }
    return value;
  };

  const addColorStop = (referenceId?: string) => {
    const value = getAddableValue(referenceId);
    if (value === null) {
      return;
    }
    const id = crypto.randomUUID();
    const color = privateGetInterpolatedColor(value);
    props.onChange(
      [...props.value, { id, value, color }].toSorted((a, b) => a.value - b.value) as ColorStops,
    );
    props.setSelectedId?.(id);
  };
  return {
    ...state,
    isThumbDragging,
    setThumbDragging,
    value: props.value,
    onChange: props.onChange,
    mode: props.mode,
    selectedId: props.selectedId,
    setSelectedId: props.setSelectedId,
    getInterpolatedColor: (value: number) => privateGetInterpolatedColor(value),
    getAddedColorStops,
    setThumbPercentColor,
    updateColorStop,
    removeColorStop,
    canRemoveColorStop: MIN_COLOR_STOPS < props.value.length,
    addColorStop,
    canAddColorStop: (referenceId?: string) => getAddableValue(referenceId) !== null,
  };
}

export type GradientSliderState = ReturnType<typeof useGradientSliderState>;
