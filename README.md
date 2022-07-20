# SideTabs

A Firefox extension that shows vertical tabs in the sidebar.

## Installation

Sidetabs is on the [Firefox Add-ons Marketplace](https://addons.mozilla.org/en-US/firefox/addon/sidetabs/).

## Development

_Requires NPM version `>= 8.3.0`._

Install dependencies: `npm install`

Build extension for development: `npm run devbuild`

Run built extension in Firefox: `npm run run`

Auto Build & Run in development mode: `npm run dev`

Build extension for production: `npm run build`

## Building

_Notes for building sidetabs:_

- use `web-ext build` rather than `zip` to package extension.
- an issue with the firefox extension validator means it won't recognise sidebar.js & settings.js as javascript modules, causing `import.meta` to be invalid syntax. By adding a dummy import to the start of these files, they will be recognised as modules.
  - after modifying any files after the build, be sure to test. Messing up the syntax of the dummy import will break the entire extension. It should be `import test from "./test.js";` and `export default ""` in `test.js`
