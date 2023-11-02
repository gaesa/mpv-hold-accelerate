namespace Config {
    const decayDelay = 0.05;
    export const osdDuration = Math.max(
        decayDelay,
        mp.get_property_native("osd-duration") / 1000,
    );
    export const fastSpeed = 2.5; // a higher value like `3` is more likely to cause `Audio/Video desynchronisation`
    export const slowSpeed = 0.5;
}

namespace SpeedPlayback {
    interface Input {
        event?: string;
        is_mouse?: boolean;
        key_name?: string;
    }

    export function make(speedValue: number) {
        return function (table: Input): void {
            if (table.event === "down" || table.event === "repeat") {
                isPlaying = true;
                mp.set_property("speed", speedValue);
                mp.osd_message(
                    `>> x${speedValue.toFixed(2)}`,
                    Config.osdDuration,
                );
            } else if (table.event === "up") {
                mp.set_property("speed", prevSpeed);
                mp.osd_message(`${prevSpeed.toFixed(2)}x`, Config.osdDuration);
                isPlaying = false;
            } else {
                return;
            }
        };
    }

    let prevSpeed: number = mp.get_property_native("speed");
    let isPlaying = false;

    mp.observe_property("speed", "number", (_: string, value: number) => {
        if (isPlaying) {
            return;
        } else {
            prevSpeed = value;
        }
    });
}

mp.add_key_binding(
    "=",
    "hold-accelerate@fast",
    SpeedPlayback.make(Config.fastSpeed),
    {
        complex: true,
        repeatable: false,
    },
);
mp.add_key_binding(
    "-",
    "hold-accelerate@slow",
    SpeedPlayback.make(Config.slowSpeed),
    {
        complex: true,
        repeatable: false,
    },
);
