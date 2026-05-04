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
import { useCustomSlider, type CustomSliderProps } from "./useCustomSlider";
import {
  useCustomSliderState,
  type ColorStops,
  type CustomSliderStateOptions,
} from "./useCustomSliderState";
import { useCustomSliderThumb } from "./useCustomSliderThumb";

type GradientSliderContextValue = {
  state: ReturnType<typeof useCustomSliderState>;
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

type GradientSliderProps = CustomSliderProps &
  Except<CustomSliderStateOptions, "numberFormatter"> &
  Except<React.HTMLAttributes<HTMLDivElement>, "onChange">;

export function GradientSlider(props: GradientSliderProps) {
  const numberFormatter = useNumberFormatter();
  const state = useCustomSliderState({
    ...props,
    numberFormatter,
  });
  const trackRef = useRef<HTMLDivElement | null>(null);
  const { groupProps, trackProps, background } = useCustomSlider(
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

type GradientSliderTrackProps = RenderProps<{ background: string }> &
  Except<React.HTMLAttributes<HTMLDivElement>, "style" | "children">;

export function GradientSliderTrack(props: GradientSliderTrackProps) {
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
  const { thumbProps, inputProps, isDragging } = useCustomSliderThumb(
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

type DeleteButtonProps = AriaButtonOptions<"button"> &
  React.HTMLAttributes<HTMLButtonElement> & { id: string };

export function DeleteButton({ id, ...props }: DeleteButtonProps) {
  const { state } = useGradientSliderContext();
  const ref = useRef<HTMLButtonElement | null>(null);
  const { buttonProps } = useButton(
    mergeProps(props, { isDisabled: !state.isColorStopDeletable }),
    ref,
  );
  return (
    <button
      {...buttonProps}
      className={props.className}
      onPointerDown={() => state.deleteColorStop(id)}
      style={{ cursor: buttonProps.disabled ? "not-allowed" : "pointer" }}
    >
      {props.children}
    </button>
  );
}
