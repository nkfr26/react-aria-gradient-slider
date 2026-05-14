import { useState } from "react";
import { GradientSlider, SliderTrack, ColorStop, Remove, ColorInput } from "./GradientSlider";
import { Label } from "react-aria-components";
import type { ColorStops } from "./useGradientSliderState";
import { converter, formatHex } from "culori";
import { cn } from "./lib/utils";

function darken(hex: string, mode: "oklab" | "oklch", amount: number = 0.1) {
  const color = converter(mode)(hex);
  if (!color) {
    return hex;
  }
  color.l = Math.max(0, color.l - amount);
  return formatHex(color);
}

function App() {
  const [value, setValue] = useState<ColorStops>([
    { id: crypto.randomUUID(), value: 0, color: "#ff0000" },
    { id: crypto.randomUUID(), value: 100, color: "#00ff00" },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedColorStop = value.find((cs) => cs.id === selectedId);
  return (
    <main className="p-8 max-w-xl mx-auto flex flex-col gap-6 font-mono">
      <GradientSlider
        value={value}
        onChange={setValue}
        mode={"oklab"}
        setSelectedId={setSelectedId}
        className="flex flex-col gap-2"
      >
        <Label>gradient slider</Label>
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
                      className={cn(
                        "relative size-5 rounded-full border-2 border-white",
                        selectedId === cs.id &&
                          "outline-1 outline-foreground dark:-outline-offset-2 dark:outline-4",
                      )}
                      style={{
                        background,
                        boxShadow: `0 0 2px rgba(0,0,0,0.5), inset 0 0 0 1px ${darken(background, "oklab")}`,
                      }}
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
        <div className="flex items-center justify-center h-8 sm:h-7">
          {selectedColorStop ? (
            <>
              <ColorInput id={selectedColorStop.id}>
                {({ value, onChange }) => (
                  <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
                )}
              </ColorInput>
              <Remove id={selectedColorStop.id}>
                {({ isDisabled, onPress }) => (
                  <button
                    disabled={isDisabled}
                    onClick={onPress}
                    className="cursor-pointer disabled:cursor-not-allowed"
                  >
                    x
                  </button>
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
        mode={"oklab"}
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
        mode={"oklab"}
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
                  <svg className="size-4 drop-shadow-[0_0_1px_rgba(0,0,0,0.4)]" viewBox="0 0 16 16">
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
          value.map((cs) => ({ value: cs.value, color: cs.color })),
          null,
          2,
        )}
      </pre>
    </main>
  );
}

export default App;
