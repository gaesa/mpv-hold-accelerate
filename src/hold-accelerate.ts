namespace config {
  const decayDelay: number = 0.05;
  export const osdDuration: number = Math.max(
    decayDelay,
    mp.get_property_native("osd-duration") / 1000,
  );
  export const fastSpeed: number = 2.5;
  export const slowSpeed: number = 0.5;
}

interface CallbackOnKey {
  event?: string;
  is_mouse?: boolean;
  key_name?: string;
}

namespace SpeedPlay {
  export let prevSpeed = mp.get_property_native("speed");
  export let isPlaying = false;
}

function makePlayFn(speedValue: number) {
  return function (table: CallbackOnKey): void {
    if (table.event === "down" || table.event === "repeat") {
      SpeedPlay.isPlaying = true;
      mp.set_property("speed", speedValue);
      mp.osd_message(`>> x${speedValue.toFixed(2)}`, config.osdDuration);
    } else if (table.event === "up") {
      mp.set_property("speed", SpeedPlay.prevSpeed);
      mp.osd_message(`${SpeedPlay.prevSpeed.toFixed(2)}x`, config.osdDuration);
      SpeedPlay.isPlaying = false;
    } else {
      return;
    }
  };
}

const fastPlay = makePlayFn(config.fastSpeed);
const slowPlay = makePlayFn(config.slowSpeed);

mp.observe_property("speed", "number", (_: string, value: number) => {
  if (SpeedPlay.isPlaying) {
    return;
  } else {
    SpeedPlay.prevSpeed = value;
  }
});

mp.add_key_binding("=", "hold-accelerate@fast", fastPlay, {
  complex: true,
  repeatable: false,
});
mp.add_key_binding("-", "hold-accelerate@slow", slowPlay, {
  complex: true,
  repeatable: false,
});
