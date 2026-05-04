import { createContext, useContext, useRef } from "react";
import {
  useNumberFormatter,
  mergeProps,
  useFocusRing,
  VisuallyHidden,
  type AriaButtonOptions,
  useButton,
} from "react-aria";
import { filterDOMProps } from "react-aria/filterDOMProps";
import { type RenderProps, useRenderProps } from "react-aria-components";
import type { Except } from "type-fest";
import { useGradientSlider, type AriaGradientSliderProps } from "./useGradientSlider";
import {
  useGradientSliderState,
  type ColorStops,
  type GradientSliderStateOptions,
} from "./useGradientSliderState";
import { useColorStop } from "./useColorStop";

type GradientSliderContextValue = {
  state: ReturnType<typeof useGradientSliderState>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  trackProps: React.HTMLAttributes<HTMLDivElement>;
  background: string;
  setSelected?: React.Dispatch<React.SetStateAction<ColorStops[number] | null>>;
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
  const numberFormatter = useNumberFormatter();
  const state = useGradientSliderState({
    ...props,
    numberFormatter,
  });
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { groupProps, trackProps, background } = useGradientSlider(
    { ...props, label: props.label ?? "Gradient Slider" },
    state,
    trackRef,
  );
  return (
    <GradientSliderContext.Provider
      value={{ state, trackRef, trackProps, background, setSelected: props.setSelected }}
    >
      <div {...mergeProps(filterDOMProps(props), groupProps)} className={props.className}>
        {props.children}
      </div>
    </GradientSliderContext.Provider>
  );
}

type SliderTrackProps = RenderProps<{ background: string }> &
  Except<React.HTMLAttributes<HTMLDivElement>, "style" | "children">;

export function SliderTrack(props: SliderTrackProps) {
  const { trackRef, trackProps, background } = useGradientSliderContext();
  const renderProps = useRenderProps({
    children: props.children,
    values: { background },
  });
  return (
    <div {...trackProps} className={props.className} ref={trackRef}>
      {renderProps.children}
    </div>
  );
}

type ColorStopProps = React.HTMLAttributes<HTMLDivElement> & { index: number };

export function ColorStop({ index, ...props }: ColorStopProps) {
  const { state, trackRef, setSelected } = useGradientSliderContext();
  const inputRef = useRef(null);
  const { thumbProps, inputProps, isDragging } = useColorStop(
    { index, trackRef, inputRef, setSelected },
    state,
  );
  const { focusProps, isFocusVisible } = useFocusRing();
  return (
    <div
      {...mergeProps(props, thumbProps)}
      data-focus-visible={isFocusVisible || undefined}
      data-dragging={isDragging || undefined}
    >
      <VisuallyHidden>
        <input ref={inputRef} {...mergeProps(inputProps, focusProps)} />
      </VisuallyHidden>
      {props.children}
    </div>
  );
}

type RemoveButtonProps = AriaButtonOptions<"button"> &
  React.HTMLAttributes<HTMLButtonElement> & { id: string };

export function RemoveButton({ id, ...props }: RemoveButtonProps) {
  const { state } = useGradientSliderContext();
  const ref = useRef<HTMLButtonElement | null>(null);
  const { buttonProps } = useButton(
    mergeProps(props, { isDisabled: !state.canRemoveColorStop }),
    ref,
  );
  return (
    <button
      {...buttonProps}
      className={props.className}
      onPointerDown={() => state.removeColorStop(id)}
      style={{ cursor: buttonProps.disabled ? "not-allowed" : "pointer" }}
    >
      {props.children}
    </button>
  );
}
