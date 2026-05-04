import { formatHex, interpolate } from "culori";
import { useSliderState, type SliderStateOptions } from "react-stately";
import type { Except } from "type-fest";

type ColorStop = {
  id: string;
  value: number;
  color: string;
};

export type ColorStops = [ColorStop, ColorStop, ...ColorStop[]];

export type GradientSliderStateOptions = Except<
  SliderStateOptions<number[]>,
  "value" | "onChange"
> & {
  value: ColorStops;
  onChange: React.Dispatch<React.SetStateAction<ColorStops>>;
  setSelected?: React.Dispatch<React.SetStateAction<ColorStops[number] | null>>;
};

export function useGradientSliderState(props: GradientSliderStateOptions) {
  const state = useSliderState({
    ...props,
    value: props.value.map((cs) => cs.value),
    onChange: (value) => {
      props.onChange((prev) => prev.map((cs, i) => ({ ...cs, value: value[i] })) as ColorStops);
    },
  });

  const getInterpolatedColor = (value: number, mode: "oklab" | "oklch", filterIndex?: number) => {
    const interpolator = interpolate(
      props.value
        .filter((_, index) => index !== filterIndex)
        .map((cs) => [cs.color, state.getValuePercent(cs.value)]),
      mode,
    );
    return formatHex(interpolator(state.getValuePercent(value)));
  };

  const removeColorStop = (id: string) => {
    if (props.value.length === 2) {
      return;
    }
    props.onChange(props.value.filter((cs) => cs.id !== id) as ColorStops);
    props.setSelected?.((prev) => (prev?.id === id ? null : prev));
  };
  return {
    ...state,
    value: props.value,
    onChange: props.onChange,
    setSelected: props.setSelected,
    getInterpolatedColor,
    removeColorStop,
    canRemoveColorStop: 2 < props.value.length,
  };
}
