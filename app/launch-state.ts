import "server-only";

export type LaunchState = "prelaunch" | "live";

export function getLaunchState(): LaunchState {
  return process.env.LAUNCH_STATE === "live" ? "live" : "prelaunch";
}

