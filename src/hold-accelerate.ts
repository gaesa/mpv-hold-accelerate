const msg = mp.msg;

namespace Config {
    type Opts = {
        [key: string]: number;
    };
    export const opts: Opts = {
        fastSpeed: 2.5, // a higher value like `3` is more likely to cause `Audio/Video desynchronisation`
        slowSpeed: 0.5,
    };

    mp.options.read_options(opts, mp.get_script_name());
    Object.keys(opts).forEach((key) => {
        // https://man.archlinux.org/man/mpv.1#scaletempo2_=option1:option2:..._
        // https://man.archlinux.org/man/mpv.1#sub~9
        if (opts[key] > 4 || opts[key] < 0.25) {
            msg.warn(
                "Warning: The playback speed is outside the typical range.",
                "The audio will be muted if the speed is below 0.25 or above 4.0",
            );
        }
    });
}

function getSpeed(): number {
    return mp.get_property_native("speed");
}

function setSpeed(speed: number) {
    mp.set_property("speed", speed);
}

function smoothTransition(
    target: number,
    delta: number,
    interval: number,
    postFn?: () => void,
) {
    function adjust() {
        const current = getSpeed();
        const currentTarget = current + delta;
        if (compare(currentTarget, target)) {
            setSpeed(target);
            postFn !== void 0 ? postFn() : void 0;
            clearInterval(timer);
        } else {
            setSpeed(currentTarget);
        }
    }

    let compare: (a: number, b: number) => boolean;
    if (delta < 0) {
        compare = (a, b) => {
            return a < b;
        };
    } else if (delta > 0) {
        compare = (a, b) => {
            return a > b;
        };
    } else {
        throw new Error("Invalid input: Delta must be a non-zero number");
    }
    const timer = setInterval(adjust, interval);
}

namespace SpeedPlayback {
    namespace Opts {
        const decayDelay = 0.05;
        export const osdDuration = Math.max(
            decayDelay,
            mp.get_property_native("osd-duration", 1000) / 1000,
        );
        export const speedDelta = -0.05; // negative because it's only needed for slowing down speed
        export const timerInterval = 15; // in miliseconds
    }

    function showSpeed(speed: number) {
        mp.osd_message(`▶▶ x${speed.toFixed(1)}`, Opts.osdDuration);
    }

    type Input = {
        event: "down" | "repeat" | "up" | "press";
        is_mouse: boolean;
        key_name?: string;
        key_text?: string;
    };

    function adjustSpeed(target: number, postFn?: () => void) {
        smoothTransition(target, Opts.speedDelta, Opts.timerInterval, postFn);
    }

    export function make(target: number) {
        let activate: () => void;
        let deactivate: () => void;

        if (state.prevSpeed < target) {
            activate = () => {
                state.isChanged = true;
                setSpeed(target);
                showSpeed(target);
            };
            deactivate = () => {
                adjustSpeed(state.prevSpeed, () => {
                    showSpeed(state.prevSpeed);
                    state.isChanged = false;
                });
            };
        } else if (state.prevSpeed > target) {
            activate = () => {
                state.isChanged = true;
                adjustSpeed(target, () => {
                    showSpeed(target);
                });
            };
            deactivate = () => {
                setSpeed(state.prevSpeed);
                showSpeed(state.prevSpeed);
                state.isChanged = false;
            };
        } else {
            throw new Error("Target speed can't be the same as current speed.");
        }

        return (table: Input): void => {
            if (table.event === "down") {
                activate();
            } else if (table.event === "up") {
                deactivate();
            } else {
                return;
            }
        };
    }

    const state = {
        prevSpeed: getSpeed(),
        isChanged: false,
    };

    mp.observe_property("speed", "number", (_: string, value: number) => {
        if (state.isChanged) {
            return;
        } else {
            state.prevSpeed = value;
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
