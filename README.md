# hold-accelerate

## Features

- **Hold-On**: Users can temporarily change the playback speed by holding a certain key. The speed is restored as before once the key is released.

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

## Configuration

You can change the default temporary speed, as shown below:

```
# ~/.config/mpv/script-opts/hold_accelerate.conf
fastSpeed=2
slowSpeed=0.25
```

To enable speed transition animation, set `animation=yes`. By default, this option is set to `no`.

## FAQ

**Disclaimer**: Please note that the information provided in this FAQ is based on my current understanding and may not be entirely accurate or complete. It is intended for general informational purposes and should not be relied upon as the sole source of information. For more detailed, specific, or up-to-date information, please conduct further research or consult with a professional in the field.

### Why do I see freeze frames when I reduce the speed of video playback?

The phenomenon you’re observing is largely due to the way video playback works and the limitations of frame rates. When you slow down a video, the frames are stretched over a longer period of time. If there aren’t enough frames to fill these gaps, some frames may be displayed for longer than intended, resulting in “freeze frames”. Although the current program uses a method of step-by-step adjustment of the video playback speed to mitigate this issue, the effect can still be very noticeable, especially if you have enabled the `interpolation` in `~/.config/mpv/mpv.conf`. To reduce the visibility of these freeze frames, you can comment out the `interpolation` line in the mpv configuration file. This will disable interpolation and may provide a smoother viewing experience when changing the playback speed to a slower rate.

## Improvements Over [Ciacconas/mpv-scripts](https://github.com/Ciacconas/mpv-scripts/blob/master/hold_accelerate.lua)

- **Speed Reversion**: The playback speed can adaptively adjust back to its previous state instead of being set to `1.0`, a value hardcoded in the original implementation.
- **Improved Keybinding Management**: Unlike the original lua implementation which uses `mp.add_forced_key_binding` that could overwrite user’s custom keybindings, this implementation uses `mp.add_key_binding` which respects user’s custom keybindings.
- **Modularity**: The code is more modular, it uses separate namespaces and a high-level function which is used to create different functions which set different playback speeds, making it easier to maintain and extend. This allows for better organization and scalability of the code.
