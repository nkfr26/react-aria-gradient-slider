import { useState } from "react";
import { GradientSlider, SliderTrack, ColorStop, Remove, ColorInput } from "./GradientSlider";
import type { ColorStops } from "./useGradientSliderState";
import { Button } from "./components/ui/button";
import { converter, formatHex } from "culori";

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
    <main className="px-12 pt-12 max-w-xl mx-auto flex flex-col gap-6 font-medium text-base sm:text-sm">
      <GradientSlider
        value={value}
        onChange={setValue}
        mode={"oklab"}
        setSelectedId={setSelectedId}
        className="flex flex-col gap-2"
      >
        <SliderTrack className="flex items-center h-5.5 cursor-copy mt-5.5 mx-2.5">
          {({ background }) => (
            <>
              <div style={{ background }} className="h-1.5 w-full rounded-full" />
              {value.map((cs, index) => (
                <ColorStop
                  key={cs.id}
                  index={index}
                  className="top-1/2 size-4.5 cursor-grab rounded-full border-2 border-white dragging:cursor-grabbing"
                  style={({ background }) => ({
                    boxShadow: [
                      `0 0 2px rgba(0,0,0,0.5)`,
                      `inset 0 0 0 1px ${darken(background, "oklab")}`,
                      selectedId === cs.id && "0 0 0 2px black",
                    ]
                      .filter(Boolean)
                      .join(","),
                  })}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2">{cs.value}</div>
                </ColorStop>
              ))}
            </>
          )}
        </SliderTrack>
        <div className="font-mono flex items-center justify-center">
          {selectedColorStop ? (
            <>
              <ColorInput id={selectedColorStop.id}>
                {({ value, onChange }) => (
                  <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
                )}
              </ColorInput>
              <Remove id={selectedColorStop.id}>
                {({ isDisabled, onPress }) => (
                  <Button
                    isDisabled={isDisabled}
                    onPress={onPress}
                    intent="plain"
                    size="sq-xs"
                    className="cursor-pointer disabled:cursor-not-allowed"
                  >
                    x
                  </Button>
                )}
              </Remove>
            </>
          ) : (
            "Select or add a color stop to edit"
          )}
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
