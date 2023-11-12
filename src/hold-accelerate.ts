namespace Config {
    type Opts = {
        [key: string]: number;
    };
    export const opts: Opts = {
        fastSpeed: 2.5, // a higher value like `3` is more likely to cause `Audio/Video desynchronisation`
        slowSpeed: 0.5,
    };

    mp.options.read_options(opts, mp.get_script_name());
}

namespace SpeedPlayback {
    const decayDelay = 0.05;
    const osdDuration = Math.max(
        decayDelay,
        mp.get_property_native("osd-duration", 1000) / 1000,
    );

    function showSpeed(speed: number) {
        mp.osd_message(`▶▶ x${speed.toFixed(1)}`, osdDuration);
    }

    type Input = {
        event?: "down" | "repeat" | "up" | "press";
        is_mouse: boolean;
        key_name?: string;
        key_text?: string;
    };

    export function make(speed: number) {
        return (table: Input): void => {
            if (table.event === "down") {
                isPlaying = true;
                mp.set_property("speed", speed);
                showSpeed(speed);
            } else if (table.event === "up") {
                mp.set_property("speed", prevSpeed);
                showSpeed(prevSpeed);
                isPlaying = false;
            } else {
                return;
            }
        };
    }

    let prevSpeed: number = mp.get_property_native("speed", 1);
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
    SpeedPlayback.make(Config.opts.fastSpeed),
    {
        complex: true,
        repeatable: false,
    },
);
mp.add_key_binding(
    "-",
    "hold-accelerate@slow",
    SpeedPlayback.make(Config.opts.slowSpeed),
    {
        complex: true,
        repeatable: false,
    },
);
