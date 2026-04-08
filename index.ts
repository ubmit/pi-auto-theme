import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { getSystemTheme, monitorSystemTheme, MonitoringUnsupportedError } from "crossterm-system-theme";

export default function (pi: ExtensionAPI) {
  let monitor: { stop(): void } | null = null;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let currentMode: 'auto' | 'light' | 'dark' = 'auto';

  const stopAutoMode = () => {
    if (monitor) {
      monitor.stop();
      monitor = null;
    }
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const startAutoMode = async (ctx: any) => {
    stopAutoMode(); // Ensure clean slate
    let currentTheme: 'light' | 'dark' = 'dark'; // Fallback initial theme
    
    try {
      currentTheme = await getSystemTheme();
      ctx.ui.setTheme(currentTheme);
    } catch (e) {
      // Ignored if theme detection fails initially
    }

    const updateTheme = (newTheme: 'light' | 'dark') => {
      if (newTheme !== currentTheme) {
        currentTheme = newTheme;
        ctx.ui.setTheme(currentTheme);
        ctx.ui.notify(`OS theme changed, synced pi to ${newTheme}`, "info");
      }
    };

    try {
      monitor = await monitorSystemTheme((newTheme) => {
        updateTheme(newTheme);
      });
    } catch (error) {
      if (error instanceof MonitoringUnsupportedError) {
        // Fall back to polling for environments where monitoring isn't supported
        intervalId = setInterval(async () => {
          try {
            const newTheme = await getSystemTheme();
            updateTheme(newTheme);
          } catch (e) {
            // Ignored if theme detection fails during polling
          }
        }, 3000);
      } else {
        ctx.ui.notify("Error setting up system theme monitor.", "error");
      }
    }
  };

  pi.on("session_start", async (_event, ctx) => {
    // Only run if we have a UI (e.g. interactive mode)
    if (!ctx.hasUI) return;

    if (currentMode === 'auto') {
      await startAutoMode(ctx);
    } else {
      ctx.ui.setTheme(currentMode);
    }
  });

  pi.on("session_shutdown", () => {
    stopAutoMode();
  });

  pi.registerCommand("theme", {
    description: "Switch theme mode: auto, light, or dark",
    getArgumentCompletions: (prefix: string): AutocompleteItem[] | null => {
      const options = ["auto", "light", "dark"];
      const items = options.map((e) => ({ value: e, label: e }));
      const filtered = items.filter((i) => i.value.startsWith(prefix));
      return filtered.length > 0 ? filtered : null;
    },
    handler: async (args, ctx) => {
      const arg = args.trim().toLowerCase();
      
      if (arg === "auto") {
        currentMode = "auto";
        await startAutoMode(ctx);
        ctx.ui.notify("Theme set to auto (syncing with OS)", "info");
      } else if (arg === "light" || arg === "dark") {
        currentMode = arg;
        stopAutoMode();
        ctx.ui.setTheme(arg);
        ctx.ui.notify(`Theme set to ${arg}`, "info");
      } else {
        ctx.ui.notify("Invalid theme mode. Use 'auto', 'light', or 'dark'", "error");
      }
    }
  });
}
