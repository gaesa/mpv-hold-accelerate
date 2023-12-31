# hold-accelerate

## Features

- **Hold-On**: Users can temporarily change the playback speed by holding a certain key. The speed is restored as before once the key is released.

## Requirements

No special requirements for this project.

## Installation

### Direct Download

1. Download the **latest** version of `hold_accelerate.js` from the _Releases_.
2. Move the downloaded `hold_accelerate.js` to your mpv scripts folder.

### Building from source

```shell
git clone https://github.com/gaesa/mpv-hold-accelerate
cd mpv-hold-accelerate
pnpm install --frozen-lockfile && pnpm run build
cp dist/hold_accelerate.js ~/.config/mpv/scripts
```

## Usage

By default, the `=` key is assigned to the `fastPlay`, which temporarily increases the playback speed to `2.0`. Conversely, the `-` key is assigned to the `slowPlay`, which temporarily reduces the playback speed to `0.5`. Refer to the [FAQ](#why-do-i-see-freeze-frames-when-i-reduce-the-speed-of-video-playback) for an explanation on why these values are chosen as the default.

You can overwrite these keybindings, and add your own keybindings, as shown in the example below:

```
# ~/.config/mpv/input.conf
- ignore
= ignore
LEFT script-binding hold_accelerate/fastPlay
RIGHT script-binding hold_accelerate/slowPlay
```

## Configuration

You can change the default temporary speed, as shown below:

```
# ~/.config/mpv/script-opts/hold_accelerate.conf
fastSpeed=2.5
slowSpeed=0.25
```

To enable speed transition animation, set `animation=yes`. By default, this option is set to `no`.

## FAQ

**Disclaimer**: Please note that the information provided in this FAQ is based on my current understanding and may not be entirely accurate or complete. It is intended for general informational purposes and should not be relied upon as the sole source of information. For more detailed, specific, or up-to-date information, please conduct further research or consult with a professional in the field.

### Why do I see freeze frames when I reduce the speed of video playback?

The phenomenon of “freeze frames” during video playback is primarily due to the way videos are played back and the limitations of frame rates. When a video is slowed down, the frames are stretched over a longer period of time. If there aren’t enough frames to fill these gaps, some frames may be displayed for longer than intended, resulting in “freeze frames”.

The visibility of this issue tends to increase with the magnitude of speed changes. Therefore, reducing `fastSpeed` to a smaller value can help alleviate this issue. This is the reason why `2.5` or `3` were not chosen as the default value for `fastSpeed`. It’s also worth noting that higher speeds are more likely to cause `Audio/Video desynchronisation`.

Despite these challenges, the current program uses a step-by-step adjustment method for video playback speed to mitigate this issue. However, the “freeze frames” effect can still be quite noticeable when the `interpolation` is enabled in `~/.config/mpv/mpv.conf`. To reduce the visibility of these freeze frames, consider commenting out the `interpolation` line in the mpv configuration file. Doing so disables interpolation and may lead to a smoother viewing experience when the playback speed is reduced.

## Motivation

The idea for this project was sparked by a [topic](https://bgm.tv/group/topic/369996) on Bangumi. This led me to a [Reddit discussion](https://www.reddit.com/r/mpv/comments/skf78w/is_there_a_way_to_customize_so_that_video_play_at/) and eventually to the [Ciacconas/mpv-scripts](https://github.com/Ciacconas/mpv-scripts/blob/master/hold_accelerate.lua). But I found some aspects of its implementation unsatisfactory, such as the overwriting of user's custom keybindings and the disregard for previous speed values. This motivated me to create my own version.

## Improvements

- **Speed Reversion**: The playback speed intelligently reverts to its previous state, rather than defaulting to a hardcoded `1.0` value.
- **Improved Keybinding Management**: This version respects user’s custom keybindings, unlike the original implementation which could overwrite them.
- **Smooth Transition**: This feature mitigates the "freeze frames" issue when slowing down the playback speed.
- **Always-On Speed Display**: Speed indicator remains visible when the key is held down, providing continuous visual feedback.
- **Modularity**: The code is highly modular with separate namespaces and high-level functions. This design makes it easier to maintain and extend. The program dynamically creates different function objects based on values and user configuration, demonstrating effective use of abstraction.
