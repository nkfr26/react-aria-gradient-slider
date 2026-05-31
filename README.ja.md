# react-aria-gradient-slider

[React Aria](https://react-aria.adobe.com) で構築されたグラデーションスライダーコンポーネント。  
カラーストップの追加・削除・ドラッグ・編集をサポートし、キーボードアクセシビリティにも対応しています。

## 特徴

- グラデーショントラック上のカラーストップの追加・ドラッグ
- ストップ追加時の補間色自動挿入 (ドラッグで調整可能)
- [culori](https://culorijs.org) による Oklab / Oklch 対応
- レンダープロップスを用いたヘッドレスな API
- React Aria によるキーボード・スクリーンリーダーのアクセシビリティ
- `value` / `onChange` による制御可能なステート (非制御コンポーネントは未対応)

## インストール

```bash
npm install react-aria-gradient-slider
```

## API

### コンポーネント

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

すべての子コンポーネントにコンテキストを提供するルートコンテナ。  
新たに追加したプロップスのみ表示しています。`defaultValue` / `onChangeEnd` は使用できません。

| プロップス      | 型                                     | 説明                                   | 必須      |
| --------------- | -------------------------------------- | -------------------------------------- | --------- |
| `value`         | `ColorStops`                           | 制御可能なカラーストップ               | はい      |
| `onChange`      | `Dispatch<SetStateAction<ColorStops>>` | カラーストップ変更時のコールバック     | はい      |
| `mode`          | `"oklab" \| "oklch"`                   | グラデーションに使用する色空間         | はい      |
| `selectedId`    | `SelectedId`                           | 現在選択されているカラーストップの ID  | 条件付き¹ |
| `setSelectedId` | `Dispatch<SetStateAction<SelectedId>>` | 選択中のストップを更新するコールバック | 条件付き¹ |

¹ `selectedId` と `setSelectedId` は両方指定するか、両方省略する必要があります。

#### `<SliderTrack>`

グラデーショントラックを描画します。  
レンダープロップス：`{ background: string }`

#### `<ColorStop>`

各カラーストップのドラッグ可能なつまみを描画します。  
`Enter` / `Space` キーでストップを選択、`Delete` / `Backspace` キーで削除します。

| プロップス | 型       | 説明                       | 必須 |
| ---------- | -------- | -------------------------- | ---- |
| `index`    | `number` | `value` 配列のインデックス | はい |

レンダープロップス：`{ background: string, isFocusVisible: boolean }`

#### `<ColorInput>`

特定のカラーストップの色の値と変更ハンドラを提供します。

| プロップス | 型       | 説明                        | 必須 |
| ---------- | -------- | --------------------------- | ---- |
| `id`       | `string` | 編集対象のカラーストップ ID | はい |

レンダープロップス：`{ value: Color, onChange: (color: Color) => void }`

#### `<RemoveStop>`

特定のカラーストップを削除するハンドラを提供します。ストップが 2 つの場合は無効になります。

| プロップス | 型       | 説明                        | 必須 |
| ---------- | -------- | --------------------------- | ---- |
| `id`       | `string` | 削除対象のカラーストップ ID | はい |

レンダープロップス：`{ onPress: () => void, isDisabled: boolean }`

#### `<AddStop>`

新しいカラーストップを追加するハンドラを提供します。  
デフォルトでは選択しているストップか最初のストップを基準に右側へ追加し、`id` を渡すと基準ストップを指定できます。

| プロップス | 型       | 説明              | 必須   |
| ---------- | -------- | ----------------- | ------ |
| `id`       | `string` | 基準ストップの ID | いいえ |

レンダープロップス：`{ onPress: () => void, isDisabled: boolean }`

### フック

#### `useGradientSliderState(props)`

グラデーションスライダーのステートを管理します (React Stately の `useSliderState` をラップ)

#### `useGradientSlider(props, state, trackRef)`

グラデーションスライダートラックの ARIA 挙動を提供します (React Aria の `useSlider` をラップ)

#### `useColorStop(opts, state)`

個々のカラーストップつまみの ARIA 挙動を提供します (React Aria の `useSliderThumb` をラップ)

### 型

| 型           | 定義                                          |
| ------------ | --------------------------------------------- |
| `ColorStop`  | `{ id: string; value: number; color: Color }` |
| `ColorStops` | `[ColorStop, ColorStop, ...ColorStop[]]`      |
| `Mode`       | `"oklab" \| "oklch"`                          |
| `SelectedId` | `string \| null`                              |

注意：`ColorStop` 単独では提供しません。`Color` は React Stately の型です。

## 開発

```bash
bun install        # 依存関係のインストール
bun run play       # プレイグラウンドの起動
bun run build      # ライブラリのビルド
bun run test       # テストの実行
bun run typecheck  # 型チェック
bun run lint       # リント
bun run fmt        # フォーマット
```

## ライセンス

[MIT](https://github.com/nkfr26/react-aria-gradient-slider/blob/main/LICENSE)
