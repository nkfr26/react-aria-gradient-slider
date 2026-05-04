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

type SliderContextValue = {
  state: ReturnType<typeof useCustomSliderState>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  trackProps: React.HTMLAttributes<HTMLDivElement>;
  background: string;
  setSelected?: React.Dispatch<React.SetStateAction<ColorStops[number] | null>>;
};

const SliderContext = createContext<SliderContextValue | null>(null);

function useSliderContext() {
  const ctx = useContext(SliderContext);
  if (!ctx) throw new Error();
  return ctx;
}

type SliderProps = CustomSliderProps &
  Except<CustomSliderStateOptions, "numberFormatter"> &
  Except<React.HTMLAttributes<HTMLDivElement>, "onChange">;

export function Slider(props: SliderProps) {
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
    <SliderContext.Provider
      value={{ state, trackRef, trackProps, background, setSelected: props.setSelected }}
    >
      <div {...mergeProps(filterDOMProps(props), groupProps)} className={props.className}>
        {props.children}
      </div>
    </SliderContext.Provider>
  );
}

type SliderTrackProps = RenderProps<{ background: string }> &
  Except<React.HTMLAttributes<HTMLDivElement>, "style" | "children">;

export function SliderTrack(props: SliderTrackProps) {
  const { trackRef, trackProps, background } = useSliderContext();
  const renderProps = useRenderProps({
    ...props,
    values: { background },
  });
  return (
    <div {...trackProps} className={props.className} ref={trackRef}>
      {renderProps.children}
    </div>
  );
}

type SliderThumbProps = React.HTMLAttributes<HTMLDivElement> & { index: number };

export function SliderThumb({ index, ...props }: SliderThumbProps) {
  const { state, trackRef, setSelected } = useSliderContext();
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

type DeleteSliderThumbButtonProps = AriaButtonOptions<"button"> &
  React.HTMLAttributes<HTMLButtonElement> & { id: string };

export function DeleteSliderThumbButton({ id, ...props }: DeleteSliderThumbButtonProps) {
  const { state } = useSliderContext();
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
