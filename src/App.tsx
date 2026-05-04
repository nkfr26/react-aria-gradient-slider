import { useState } from "react";
import { Slider, SliderTrack, SliderThumb, DeleteSliderThumbButton } from "./Slider";
import type { ColorStops } from "./useCustomSliderState";

function App() {
  const [value, setValue] = useState<ColorStops>([
    { id: crypto.randomUUID(), value: 0, color: "#ff0000" },
    { id: crypto.randomUUID(), value: 100, color: "#00ff00" },
  ]);
  const [selected, setSelected] = useState<ColorStops[number] | null>(null);
  return (
    <div className="px-12 pt-12 max-w-4xl mx-auto flex flex-col gap-6">
      <Slider
        value={value}
        onChange={setValue}
        mode={"oklab"}
        setSelected={setSelected}
        className="flex flex-col gap-2"
      >
        <SliderTrack className="flex items-center h-5 cursor-copy mt-6 mx-2.5">
          {({ background }) => (
            <>
              <div style={{ background }} className="h-1.5 w-full rounded-full" />
              {value.map((cs, index) => (
                <SliderThumb
                  key={cs.id}
                  index={index}
                  className={`top-1/2 box-border size-5 cursor-grab rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring dragging:cursor-grabbing ${
                    selected?.id === cs.id
                      ? "shadow-[0_0_0_1px_black,inset_0_0_0_2px_white,inset_0_0_0_3px_black]"
                      : "shadow-[0_0_0_1px_silver,inset_0_0_0_2px_white,inset_0_0_0_3px_silver]"
                  }`}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 font-medium text-base sm:text-sm">
                    {cs.value}
                  </div>
                </SliderThumb>
              ))}
            </>
          )}
        </SliderTrack>
        {value.map((cs) => (
          <DeleteSliderThumbButton key={cs.id} id={cs.id} className="disabled:opacity-50">
            {cs.id.split("-")[0]}
          </DeleteSliderThumbButton>
        ))}
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
