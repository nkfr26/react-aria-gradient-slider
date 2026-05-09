import { createContext, useContext, useRef } from "react";
import {
  useNumberFormatter,
  mergeProps,
  useFocusRing,
  VisuallyHidden,
  type AriaSliderThumbOptions,
} from "react-aria";
import { filterDOMProps } from "react-aria/filterDOMProps";
import { type RenderProps, useRenderProps } from "react-aria-components";
import type { Except } from "type-fest";
import { useGradientSlider, type AriaGradientSliderProps } from "./useGradientSlider";
import { useGradientSliderState, type GradientSliderStateOptions } from "./useGradientSliderState";
import { useColorStop } from "./useColorStop";

type GradientSliderContextValue = {
  state: ReturnType<typeof useGradientSliderState>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  trackProps: React.HTMLAttributes<HTMLDivElement>;
  background: string;
};

const GradientSliderContext = createContext<GradientSliderContextValue | null>(null);

function useGradientSliderContext() {
  const ctx = useContext(GradientSliderContext);
  if (!ctx) throw new Error();
  return ctx;
}

type GradientSliderProps = AriaGradientSliderProps &
  Except<GradientSliderStateOptions, "numberFormatter"> &
  Except<React.HTMLAttributes<HTMLDivElement>, "onChange">;

export function GradientSlider(props: GradientSliderProps) {
  const label = props.label ?? "Gradient Slider";
  const numberFormatter = useNumberFormatter();
  const state = useGradientSliderState({ ...props, numberFormatter });
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { groupProps, trackProps, labelProps, background } = useGradientSlider(
    { ...props, label },
    state,
    trackRef,
  );
  return (
    <GradientSliderContext.Provider value={{ state, trackRef, trackProps, background }}>
      <div {...mergeProps(filterDOMProps(props), groupProps)} className={props.className}>
        <VisuallyHidden>
          <label {...labelProps}>{label}</label>
        </VisuallyHidden>
        {props.children}
      </div>
    </GradientSliderContext.Provider>
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
  Except<AriaSliderThumbOptions, "trackRef" | "inputRef"> &
  Except<React.HTMLAttributes<HTMLDivElement>, "style">;

export function ColorStop(props: ColorStopProps) {
  const { state, trackRef } = useGradientSliderContext();
  const inputRef = useRef(null);
  const { thumbProps, inputProps, isDragging } = useColorStop(
    { ...props, trackRef, inputRef },
    state,
  );
  const { focusProps } = useFocusRing();
  const renderProps = useRenderProps({
    style: props.style,
    values: { background: thumbProps.style.background },
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
      {props.children}
    </div>
  );
}

type ColorInputProps = { id: string } & RenderProps<{
  value?: string;
  onChange: (color: string) => void;
}>;

export function ColorInput({ id, children }: ColorInputProps) {
  const { state } = useGradientSliderContext();
  const renderProps = useRenderProps({
    children,
    values: {
      value: state.value.find((cs) => cs.id === id)?.color,
      onChange: (color: string) => state.updateColorStop(id, { color }),
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
