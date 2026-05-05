import { mergeProps, useButton, type AriaButtonOptions } from "react-aria";
import type { useGradientSliderState } from "./useGradientSliderState";

export type RemoveButtonOptions = AriaButtonOptions<"button"> & { id: string };

export function useRemoveButton(
  opts: RemoveButtonOptions,
  state: ReturnType<typeof useGradientSliderState>,
  ref: React.RefObject<HTMLButtonElement | null>,
) {
  const { buttonProps } = useButton(
    mergeProps(opts, {
      isDisabled: !state.canRemoveColorStop,
    } satisfies AriaButtonOptions<"button">),
    ref,
  );
  return {
    buttonProps: {
      ...buttonProps,
      onClick: () => state.removeColorStop(opts.id),
    },
  };
}
