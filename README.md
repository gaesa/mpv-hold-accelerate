# hold-accelerate

## Features

- **Hold-On**: Users can temporarily change the playback speed by holding a certain key. The speed returns to normal once the key is released.

## Requirements

No special requirements for this project.

## Installation

### Direct Download

1. Download the **latest** version of `hold-accelerate.js` from the _Releases_.
2. Move the downloaded `hold-accelerate.js` to your mpv scripts folder.

### Building from source

```shell
git clone https://github.com/gaesa/mpv-hold-accelerate
cd mpv-hold-accelerate
npm ci && npm run build
cp dist/hold-accelerate.js ~/.config/mpv/scripts
```

## Usage

By default, the `=` key is assigned to the `hold-accelerate@fast`, which temporarily increases the playback speed to `2.5`. Conversely, the `-` key is assigned to the `hold-accelerate@slow`, which temporarily reduces the playback speed to `0.5`. You can overwrite these keybindings, and add your own keybindings, as shown in the example below:

```
# ~/.config/mpv/input.conf
- ignore
= ignore
LEFT script-binding hold-accelerate@slow
RIGHT script-binding hold-accelerate@fast
```

## Improvements Over [ Original Lua Implementation ](https://github.com/Ciacconas/mpv-scripts/blob/master/hold_accelerate.lua)

- **Speed Reversion**: The playback speed can adaptively adjust back to its previous state instead of being set to `1.0`, a value hardcoded in the original implementation.
- **Improved Keybinding Management**: Unlike the original lua implementation which uses `mp.add_forced_key_binding` that could overwrite user’s custom keybindings, this implementation uses `mp.add_key_binding` which respects user’s custom keybindings.
- **Modularity**: The code is more modular, it uses separate namespaces and a high-level function which is used to create different functions which set different playback speeds, making it easier to maintain and extend. This allows for better organization and scalability of the code.
