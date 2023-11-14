const msg = mp.msg;

namespace Config {
    type Opts = {
        fastSpeed: number;
        slowSpeed: number;
        animation: boolean;
    };
    export const opts: Opts = {
        fastSpeed: 2.5, // a higher value like `3` is more likely to cause `Audio/Video desynchronisation`
        slowSpeed: 0.5,
        animation: false,
    };

    mp.options.read_options(opts, mp.get_script_name());
    [opts.fastSpeed, opts.slowSpeed].forEach((speed: number) => {
        // https://man.archlinux.org/man/mpv.1#scaletempo2_=option1:option2:..._
        // https://man.archlinux.org/man/mpv.1#sub~9
        if (speed > 4 || speed < 0.25) {
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
    delta: number,
    interval: number,
    compare: (a: number, b: number) => boolean,
) {
    return (target: number, postFn?: () => void) => {
        function adjust() {
            const current = getSpeed();
            const currentTarget = current + delta;
            if (compare(currentTarget, target)) {
                clearInterval(timer);
                setSpeed(target);
                postFn !== void 0 ? postFn() : void 0;
            } else {
                setSpeed(currentTarget);
            }
        }

        const timer = setInterval(adjust, interval);
    };
}

namespace SpeedPlayback {
    type Input = {
        event: "down" | "repeat" | "up" | "press";
        is_mouse: boolean;
        key_name?: string;
        key_text?: string;
    };

    namespace Opts {
        const decayDelay = 0.15;
        export const osdDuration = Math.max(
            decayDelay,
            mp.get_property_native("osd-duration", 1000) / 1000,
        );
        export const speedDelta = -0.05; // negative because it's only needed for slowing down speed
        export const timerInterval = 15; // in miliseconds

        function checkInput(delta: number) {
            if (delta === 0) {
                throw new Error(
                    "Invalid input: Delta must be a non-zero number",
                );
            } else {
                return;
            }
        }
        checkInput(speedDelta);
    }

    function showSpeedOnce(speed: number) {
        mp.osd_message(`▶▶ x${speed.toFixed(1)}`, Opts.osdDuration);
    }

    function genShowSpeed(
        showSpeed: (speed: number) => void,
        interval: number,
    ) {
        return (speed: number) => {
            showSpeedOnce(speed);
            const timer = setInterval(() => {
                if (state.isChanged) {
                    showSpeed(speed);
                } else {
                    clearInterval(timer);
                }
            }, interval);
            return timer;
        };
    }

    const showSpeed = Config.opts.animation
        ? genShowSpeed((_) => {
              showSpeedOnce(getSpeed());
          }, Opts.timerInterval * 2)
        : genShowSpeed(showSpeedOnce, Opts.osdDuration);

    const adjustSpeed = smoothTransition(
        Opts.speedDelta,
        Opts.timerInterval,
        Opts.speedDelta < 0
            ? (a, b) => {
                  return a < b;
              }
            : (a, b) => {
                  return a < b;
              },
    );

    export function make(target: number) {
        function checkInput() {
            if (state.prevSpeed === target) {
                throw new Error(
                    "Invalid input: Target speed can't be the same as current speed.",
                );
            } else {
                return;
            }
        }
        checkInput();

        const [activate, deactivate] =
            state.prevSpeed < target
                ? [
                      () => {
                          state.isChanged = true;
                          setSpeed(target);
                          state.timer = showSpeed(target);
                      },
                      () => {
                          adjustSpeed(state.prevSpeed, () => {
                              state.isChanged = false;
                          });
                          showSpeed(state.prevSpeed);
                      },
                  ]
                : [
                      () => {
                          state.isChanged = true;
                          adjustSpeed(target);
                          state.timer = showSpeed(target);
                      },
                      () => {
                          setSpeed(state.prevSpeed);
                          showSpeedOnce(state.prevSpeed);
                          state.isChanged = false;
                      },
                  ];

        return (table: Input) => {
            if (table.event === "down") {
                activate();
            } else if (table.event === "up") {
                clearInterval(state.timer);
                deactivate();
            } else {
                return;
            }
        };
    }

    const state = {
        prevSpeed: getSpeed(),
        isChanged: false,
        timer: setTimeout(() => {}),
    };

    mp.observe_property("speed", "number", (_: string, value: number) => {
        if (state.isChanged) {
            return;
        } else {
            state.prevSpeed = value;
        }
    });
}

mp.add_key_binding("=", "fastPlay", SpeedPlayback.make(Config.opts.fastSpeed), {
    complex: true,
    repeatable: false,
});
mp.add_key_binding("-", "slowPlay", SpeedPlayback.make(Config.opts.slowSpeed), {
    complex: true,
    repeatable: false,
});
