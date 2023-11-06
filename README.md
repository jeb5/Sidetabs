# Sidetabs
![Mozilla Add-on Version](https://img.shields.io/amo/v/sidetabs?link=https%3A%2F%2Faddons.mozilla.org%2Fen-US%2Ffirefox%2Faddon%2Fsidetabs%2F)
![Mozilla Add-on Users](https://img.shields.io/amo/users/sidetabs?link=https%3A%2F%2Faddons.mozilla.org%2Fen-US%2Ffirefox%2Faddon%2Fsidetabs%2F)
![GitHub License](https://img.shields.io/github/license/jeb5/sidetabs)
![Pull requests](https://img.shields.io/badge/pull_requests-welcome-green)

<span style="font-size: large;">A Firefox extension that shows tabs in the sidebar.</span>


## Installation

Sidetabs is on the [Firefox Add-ons Marketplace](https://addons.mozilla.org/en-US/firefox/addon/sidetabs/).

## Development

_Requires NPM version `>= 8.3.0`._

Install dependencies: `npm install`

Build subpackages: `npm run build --workspaces`

Build extension: `npm run build`

Watch for changes and rebuild: `npm run watch`

Serve extension in Firefox: `npm run serve`

## Building for production

use `web-ext build` to package extension.