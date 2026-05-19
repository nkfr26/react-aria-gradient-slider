import { createContext, useContext, useRef } from "react";
import {
  mergeProps,
  useFocusRing,
  useNumberFormatter,
  type AriaSliderThumbProps,
} from "react-aria";
import { filterDOMProps } from "react-aria/filterDOMProps";
import {
  Provider,
  LabelContext,
  type RenderProps,
  useRenderProps,
  VisuallyHidden,
  type Color,
} from "react-aria-components";
import { useColorStop } from "./useColorStop";
import { type AriaGradientSliderProps, useGradientSlider } from "./useGradientSlider";
import { useGradientSliderState, type GradientSliderStateOptions } from "./useGradientSliderState";
import { type Except, useSlot } from "./utils";

type GradientSliderContextValue = {
  state: ReturnType<typeof useGradientSliderState>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  trackProps: React.HTMLAttributes<HTMLDivElement>;
  background: string;
};

export const GradientSliderContext = createContext<GradientSliderContextValue | null>(null);

export function useGradientSliderContext() {
  const context = useContext(GradientSliderContext);
  if (!context) {
    throw new Error();
  }
  return context;
}

type GradientSliderProps = Except<AriaGradientSliderProps, "label"> &
  Except<GradientSliderStateOptions, "numberFormatter"> &
  Except<React.HTMLAttributes<HTMLDivElement>, "onChange"> & {
    formatOptions?: Intl.NumberFormatOptions;
  };

export function GradientSlider(props: GradientSliderProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const numberFormatter = useNumberFormatter(props.formatOptions);
  const state = useGradientSliderState({ ...props, numberFormatter });
  const [labelRef, label] = useSlot(!props["aria-label"] && !props["aria-labelledby"]);
  const { groupProps, trackProps, labelProps, background } = useGradientSlider(
    { ...props, label },
    state,
    trackRef,
  );
  return (
    <Provider
      values={[
        [GradientSliderContext, { state, trackRef, trackProps, background }],
        [LabelContext, { ...labelProps, ref: labelRef }],
      ]}
    >
      <div {...mergeProps(filterDOMProps(props), groupProps)} className={props.className}>
        {props.children}
      </div>
    </Provider>
  );
}

type SliderTrackProps = RenderProps<{ background: string }> &
  Except<React.HTMLAttributes<HTMLDivElement>, "children">;

export function SliderTrack(props: SliderTrackProps) {
  const { trackRef, trackProps, background } = useGradientSliderContext();
  const renderProps = useRenderProps({ children: props.children, values: { background } });
  return (
    <div {...trackProps} className={props.className} ref={trackRef}>
      {renderProps.children}
    </div>
  );
}

type ColorStopProps = RenderProps<{ background: string }> &
  AriaSliderThumbProps &
  Except<React.HTMLAttributes<HTMLDivElement>, "children">;

export function ColorStop(props: ColorStopProps) {
  const { state, trackRef } = useGradientSliderContext();
  const inputRef = useRef(null);
  const { thumbProps, inputProps, isDragging, background } = useColorStop(
    { ...props, trackRef, inputRef },
    state,
  );
  const { focusProps } = useFocusRing();
  const renderProps = useRenderProps({
    children: props.children,
    values: { background: background.toString("hexa") },
  });
  return (
    <div
      {...mergeProps(filterDOMProps(props), thumbProps)}
      className={props.className}
      style={{ ...thumbProps.style, ...renderProps.style }}
      data-dragging={isDragging || undefined}
    >
      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
      {renderProps.children}
    </div>
  );
}

type ColorInputProps = { id: string } & RenderProps<{
  value?: Color;
  onChange: (value: Color) => void;
}>;

export function ColorInput({ id, children }: ColorInputProps) {
  const { state } = useGradientSliderContext();
  const renderProps = useRenderProps({
    children,
    values: {
      value: state.value.find((cs) => cs.id === id)?.color,
      onChange: (color) => state.updateColorStop(id, { color }),
    },
  });
  return renderProps.children;
}

type RemoveProps = { id: string } & RenderProps<{ isDisabled: boolean; onPress: () => void }>;

export function Remove({ id, children }: RemoveProps) {
  const { state } = useGradientSliderContext();
  const renderProps = useRenderProps({
    children,
    values: { isDisabled: !state.canRemoveColorStop, onPress: () => state.removeColorStop(id) },
  });
  return renderProps.children;
}
