import { useState } from "react";
import { Slider, SliderTrack, SliderThumb } from "./Slider";
import type { ColorStops } from "./useCustomSliderState";

function App() {
  const [value, setValue] = useState<ColorStops>([
    { id: crypto.randomUUID(), value: 0, color: "#ff0000" },
    { id: crypto.randomUUID(), value: 100, color: "#00ff00" },
  ]);
  const [selected, setSelected] = useState<ColorStops[number] | null>(null);
  return (
    <div className="px-12 pt-6 max-w-4xl mx-auto flex flex-col gap-6">
      <Slider
        value={value}
        onChange={setValue}
        mode={"oklab"}
        setSelected={setSelected}
        className="group relative flex touch-none select-none flex-col disabled:opacity-50 orientation-horizontal:w-full orientation-horizontal:min-w-fit orientation-horizontal:gap-y-2 orientation-vertical:h-full orientation-vertical:min-h-fit orientation-vertical:w-1.5 orientation-vertical:items-center orientation-vertical:gap-y-2 py-1.75 mt-5.5 cursor-copy px-2.5"
      >
        <SliderTrack className="bg-(--slider-track-bg,var(--color-secondary)) group/track relative rounded-full grow group-orientation-horizontal:h-1.5 group-orientation-horizontal:w-full group-orientation-vertical:w-1.5 group-orientation-vertical:flex-1 disabled:cursor-default disabled:opacity-60">
          {value.map((cs, index) => (
            <SliderThumb
              key={cs.id}
              index={index}
              className="top-1/2 left-1/2 size-5 rounded-full border border-fg/10 bg-white outline-hidden ring-black transition-[width,height] cursor-grab dragging:cursor-grabbing border-2 border-white [box-shadow:0_0_0_1px_black,inset_0_0_0_1px_black]"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 font-medium text-base/6 sm:text-sm/6">
                {cs.value}
              </div>
            </SliderThumb>
          ))}
        </SliderTrack>
      </Slider>
      <pre className="font-medium text-base/6 sm:text-sm/6">
        selected: {selected?.id.split("-")[0]}
      </pre>
      <pre className="font-medium text-base/6 sm:text-sm/6">
        {JSON.stringify(
          value.map((cs) => ({ ...cs, id: cs.id.split("-")[0] })),
          null,
          2,
        )}
      </pre>
    </div>
  );
}

export default App;
