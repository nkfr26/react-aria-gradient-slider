import { MarkGithubIcon } from "@primer/octicons-react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { parseColor, Label } from "react-aria-components";
import { ThemeButton } from "./ThemeButton";
import { cn } from "./lib/utils";
import { Button, button } from "./components/ui/Button";
import { ColorPicker } from "./components/ui/ColorPicker";
import { ColorArea } from "./components/ui/ColorArea";
import { ColorSlider } from "./components/ui/ColorSlider";
import { ColorSwatchPicker, ColorSwatchPickerItem } from "./components/ui/ColorSwatchPicker";
import {
  ColorInput,
  ColorStop,
  GradientSlider,
  Remove,
  SliderTrack,
} from "../../src/GradientSlider";
import type { ColorStops, Mode, SelectedId } from "../../src/useGradientSliderState";

export function App() {
  const [mode, setMode] = useState<Mode>("oklab");
  const [value, setValue] = useState<ColorStops>([
    { id: crypto.randomUUID(), value: 0, color: parseColor("#ff0000") },
    { id: crypto.randomUUID(), value: 100, color: parseColor("#00ff00") },
  ]);
  const [selectedId, setSelectedId] = useState<SelectedId>(null);
  const selectedColorStop = value.find((cs) => cs.id === selectedId);
  return (
    <>
      <header className="flex h-12 items-center border-b border-foreground bg-background">
        <div className="container mx-auto flex items-center justify-between pl-4 pr-2">
          <div className="font-mono">react-aria-gradient-slider</div>
          <a
            href="https://github.com/nkfr26/react-aria-gradient-slider"
            target="_blank"
            rel="noopener noreferrer"
            className={button({ variant: "quiet", className: "rounded-md" })}
            aria-label="GitHub Repository"
          >
            <MarkGithubIcon />
          </a>
        </div>
      </header>
      <main className="p-8 max-w-xl mx-auto flex flex-col gap-6 font-mono">
        <GradientSlider
          value={value}
          onChange={setValue}
          mode={mode}
          setSelectedId={setSelectedId}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <Label>gradient slider</Label>
            <div className="flex items-center gap-2">
              <button onClick={() => setMode((prev) => (prev === "oklab" ? "oklch" : "oklab"))}>
                <span className="underline">{mode}</span>
              </button>
              <ThemeButton className="rounded-md" aria-label="Theme Button" />
            </div>
          </div>
          <SliderTrack className="flex items-center h-6 cursor-copy mt-5 mx-2.5">
            {({ background }) => (
              <>
                <div style={{ background }} className="h-2 w-full rounded-full" />
                {value.map((cs, index) => (
                  <ColorStop
                    key={cs.id}
                    index={index}
                    className="top-1/2 size-6 cursor-grab dragging:cursor-grabbing flex items-center justify-center"
                  >
                    {({ background }) => (
                      <div
                        style={{ background }}
                        className={cn(
                          "relative size-5 rounded-full border-3 border-white shadow-[0_0_2px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(0,0,0,0.1)]",
                          selectedId === cs.id &&
                            "outline-1 outline-black -outline-offset-1 dark:-outline-offset-3",
                        )}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 text-sm pb-1">
                          {cs.value}
                        </div>
                      </div>
                    )}
                  </ColorStop>
                ))}
              </>
            )}
          </SliderTrack>
          <div className="flex items-center justify-center h-8">
            {selectedColorStop ? (
              <>
                <ColorInput id={selectedColorStop.id}>
                  {({ value, onChange }) => (
                    <ColorPicker value={value} onChange={onChange}>
                      <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" />
                      <ColorSlider colorSpace="hsb" channel="hue" />
                      <ColorSwatchPicker className="justify-between">
                        <ColorSwatchPickerItem color="#A00" />
                        <ColorSwatchPickerItem color="#f80" />
                        <ColorSwatchPickerItem color="#080" />
                        <ColorSwatchPickerItem color="#08f" />
                        <ColorSwatchPickerItem color="#088" />
                        <ColorSwatchPickerItem color="#008" />
                      </ColorSwatchPicker>
                    </ColorPicker>
                  )}
                </ColorInput>
                <Remove id={selectedColorStop.id}>
                  {({ isDisabled, onPress }) => (
                    <Button
                      isDisabled={isDisabled}
                      onPress={onPress}
                      variant="secondary"
                      className="rounded-md disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  )}
                </Remove>
              </>
            ) : (
              <span className="text-sm">select or add a color stop to edit</span>
            )}
          </div>
        </GradientSlider>

        <GradientSlider
          value={value}
          onChange={setValue}
          mode={mode}
          setSelectedId={setSelectedId}
          className="flex flex-col gap-2"
        >
          <Label>different style</Label>
          <SliderTrack className="flex items-center h-6 cursor-copy mx-2.5">
            {({ background }) => (
              <>
                <div style={{ background }} className="size-full rounded-sm" />
                {value.map((cs, index) => (
                  <ColorStop
                    key={cs.id}
                    index={index}
                    className="top-1/2 size-6 cursor-grab dragging:cursor-grabbing flex items-center justify-center"
                  >
                    {({ background }) => (
                      <div
                        className="size-4 rounded-full border-2 border-white shadow-[0_0_1px_rgba(0,0,0,0.4)]"
                        style={{ background }}
                      />
                    )}
                  </ColorStop>
                ))}
              </>
            )}
          </SliderTrack>
        </GradientSlider>

        <GradientSlider
          value={value}
          onChange={setValue}
          mode={mode}
          setSelectedId={setSelectedId}
          className="flex flex-col gap-2"
          aria-label="different style 2"
        >
          <div className="mb-2 mx-2.5">
            <SliderTrack className="flex items-center h-4 cursor-copy">
              {({ background }) => (
                <div
                  style={{ background }}
                  className="size-full border border-white shadow-[0_0_1px_rgba(0,0,0,0.4)]"
                />
              )}
            </SliderTrack>
            <div className="w-full relative mt-2">
              {value.map((cs, index) => (
                <ColorStop
                  key={cs.id}
                  index={index}
                  className="size-6 cursor-grab dragging:cursor-grabbing flex items-center justify-center"
                >
                  {({ background }) => (
                    <svg
                      className="size-4 drop-shadow-[0_0_1px_rgba(0,0,0,0.4)]"
                      viewBox="0 0 16 16"
                    >
                      <polygon
                        points="8,0.5 0.5,13.5 15.5,13.5"
                        fill={background}
                        stroke="white"
                        strokeWidth="1"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </ColorStop>
              ))}
            </div>
          </div>
        </GradientSlider>

        <pre>selected index: {value.findIndex((cs) => cs.id === selectedId)}</pre>
        <pre>
          {JSON.stringify(
            value.map((cs) => ({ value: cs.value, color: cs.color.toString("hexa") })),
            null,
            2,
          )}
        </pre>
      </main>
    </>
  );
}
