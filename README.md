# pi-auto-theme

[![npm version](https://img.shields.io/npm/v/pi-auto-theme.svg)](https://www.npmjs.com/package/pi-auto-theme)

A simple extension for the [pi coding agent](https://github.com/mariozechner/pi) that automatically changes the theme from dark to light (and vice versa) based on the theme of your operating system.

## Features

- **Instant Reactions**: This extension does **NOT** depend on 'polling' every N seconds. Instead, it uses [crossterm-system-theme](https://github.com/championswimmer/crossterm-system-theme) with a native listener for theme changes, allowing it to react to OS-level theme changes instantly. 
- *(Note: It does fall back to a 3-second poll in certain Linux desktop environments if it cannot find a way to listen natively, but this rarely happens.)*
- **No Clutter**: This pi extension is lightweight. It adds a single `/theme` command to allow manual overrides.
- **Commands**: 
  - `/theme auto`: Syncs the theme with your OS natively.
  - `/theme dark`: Overrides auto-sync and forces dark theme.
  - `/theme light`: Overrides auto-sync and forces light theme.

## Installation

```bash
npm install -g pi-auto-theme
```

Or just point pi to the local directory:

```bash
pi -e ./index.ts
```

## How it works

When the extension is loaded, it checks the current OS theme and immediately sets the `pi` UI theme. It also sets up a native theme change listener using `crossterm-system-theme`. If your OS switches between Light and Dark mode, the pi TUI will update instantly without restarting the session.

## License

ISC
