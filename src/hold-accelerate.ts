namespace Config {
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

namespace SpeedPlayback {
  export let prevSpeed = mp.get_property_native("speed");
  export let isPlaying = false;
}

function makePlayFn(speedValue: number) {
  return function (table: CallbackOnKey): void {
    if (table.event === "down" || table.event === "repeat") {
      SpeedPlayback.isPlaying = true;
      mp.set_property("speed", speedValue);
      mp.osd_message(`>> x${speedValue.toFixed(2)}`, Config.osdDuration);
    } else if (table.event === "up") {
      mp.set_property("speed", SpeedPlayback.prevSpeed);
      mp.osd_message(
        `${SpeedPlayback.prevSpeed.toFixed(2)}x`,
        Config.osdDuration,
      );
      SpeedPlayback.isPlaying = false;
    } else {
      return;
    }
  };
}

mp.observe_property("speed", "number", (_: string, value: number) => {
  if (SpeedPlayback.isPlaying) {
    return;
  } else {
    SpeedPlayback.prevSpeed = value;
  }
});

mp.add_key_binding("=", "hold-accelerate@fast", makePlayFn(Config.fastSpeed), {
  complex: true,
  repeatable: false,
});
mp.add_key_binding("-", "hold-accelerate@slow", makePlayFn(Config.slowSpeed), {
  complex: true,
  repeatable: false,
});
