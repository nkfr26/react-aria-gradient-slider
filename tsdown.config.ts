import pluginBabel from "@rolldown/plugin-babel";
import { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "tsdown";

export default defineConfig({
  dts: { tsgo: true },
  exports: true,
  unbundle: true,
  platform: "neutral",
  plugins: [pluginBabel({ presets: [reactCompilerPreset()] })],
});
