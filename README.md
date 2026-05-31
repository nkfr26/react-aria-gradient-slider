# react-aria-gradient-slider

A gradient slider component built with [React Aria](https://react-aria.adobe.com).  
Supports adding, removing, dragging, and editing color stops with keyboard accessibility.

## Features

- Add and drag color stops on a gradient track
- Automatic interpolated color insertion when adding stops (adjustable via drag)
- Oklab / Oklch support via [culori](https://culorijs.org)
- Headless API using render props
- Keyboard and screen reader accessibility via React Aria
- Controlled state via `value` / `onChange` (uncontrolled component not supported)

## Installation

```bash
npm install react-aria-gradient-slider
```

## API

### Components

```tsx
<GradientSlider>
  <Label />
  <SliderTrack>
    {({ background }) => (
      <ColorStop>
        {({ background, isFocusVisible }) => ()}
      </ColorStop>
    )}
  </SliderTrack>
  <ColorInput>
    {({ value, onChange }) => ()}
  </ColorInput>
  <RemoveStop>
    {({ onPress, isDisabled }) => ()}
  </RemoveStop>
  <AddStop>
    {({ onPress, isDisabled }) => ()}
  </AddStop>
</GradientSlider>
```

#### `<GradientSlider>`

Root container that provides context to all child components.  
Only newly added props are shown. `defaultValue` / `onChangeEnd` are not supported.

| Props           | Types                                  | Description                             | Required     |
| --------------- | -------------------------------------- | --------------------------------------- | ------------ |
| `value`         | `ColorStops`                           | Controlled color stops                  | Yes          |
| `onChange`      | `Dispatch<SetStateAction<ColorStops>>` | Callback when color stops change        | Yes          |
| `mode`          | `"oklab" \| "oklch"`                   | Color space used for interpolation      | Yes          |
| `selectedId`    | `SelectedId`                           | ID of the currently selected color stop | Conditional¹ |
| `setSelectedId` | `Dispatch<SetStateAction<SelectedId>>` | Callback to update the selected stop    | Conditional¹ |

¹ `selectedId` and `setSelectedId` must both be provided or both omitted.

#### `<SliderTrack>`

Renders the gradient track.  
Render props: `{ background: string }`

#### `<ColorStop>`

Renders a draggable thumb for each color stop.  
`Enter` / `Space` to select a stop, `Delete` / `Backspace` to remove it.

| Props   | Types    | Description                | Required |
| ------- | -------- | -------------------------- | -------- |
| `index` | `number` | Index in the `value` array | Yes      |

Render props: `{ background: string, isFocusVisible: boolean }`

#### `<ColorInput>`

Provides the color value and change handler for a specific color stop.

| Props | Types    | Description                  | Required |
| ----- | -------- | ---------------------------- | -------- |
| `id`  | `string` | ID of the color stop to edit | Yes      |

Render props: `{ value: Color, onChange: (color: Color) => void }`

#### `<RemoveStop>`

Provides a handler to remove a specific color stop. Disabled when only 2 stops remain.

| Props | Types    | Description                    | Required |
| ----- | -------- | ------------------------------ | -------- |
| `id`  | `string` | ID of the color stop to remove | Yes      |

Render props: `{ onPress: () => void, isDisabled: boolean }`

#### `<AddStop>`

Provides a handler to add a new color stop.  
By default, adds to the right of the selected stop (or the first stop). Pass `id` to specify the reference stop.

| Props | Types    | Description              | Required |
| ----- | -------- | ------------------------ | -------- |
| `id`  | `string` | ID of the reference stop | No       |

Render props: `{ onPress: () => void, isDisabled: boolean }`

### Hooks

#### `useGradientSliderState(props)`

Manages gradient slider state (wraps React Stately's `useSliderState`)

#### `useGradientSlider(props, state, trackRef)`

Provides ARIA behavior for the gradient slider track (wraps React Aria's `useSlider`)

#### `useColorStop(opts, state)`

Provides ARIA behavior for an individual color stop thumb (wraps React Aria's `useSliderThumb`)

### Types

| Types        | Definition                                    |
| ------------ | --------------------------------------------- |
| `ColorStop`  | `{ id: string; value: number; color: Color }` |
| `ColorStops` | `[ColorStop, ColorStop, ...ColorStop[]]`      |
| `Mode`       | `"oklab" \| "oklch"`                          |
| `SelectedId` | `string \| null`                              |

Note: `ColorStop` is not exported on its own. `Color` is a React Stately type.

## Development

```bash
bun install        # Install dependencies
bun run play       # Start playground
bun run build      # Build the library
bun run test       # Run tests
bun run typecheck  # Type check
bun run lint       # Lint
bun run fmt        # Format
```

## License

[MIT](https://github.com/nkfr26/react-aria-gradient-slider/blob/main/LICENSE)
