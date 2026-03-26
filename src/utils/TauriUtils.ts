import { getAllWindows, getCurrentWindow } from "@tauri-apps/api/window";
import { exit } from "@tauri-apps/plugin-process";

export function showMainWindow() {
  return getAllWindows().then((windows) => {
    for (let window of windows) {
      if (window.label !== "main") continue;
      return window.show().then(() => window.setFocus());
    }
  });
}

export async function exitApp(code?: number) {
  return exit(code);
}
