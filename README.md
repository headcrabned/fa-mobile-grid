# FA Mobile Grid

An **unofficial** userscript that makes [Fur Affinity](https://www.furaffinity.net) galleries comfortable on phones and tablets. It turns FA's modern-theme thumbnail pages into a masonry grid with an adjustable column count, with less pinching and zooming than the default layout.

| Default FA layout | With FA Mobile Grid |
|---|---|
| ![Tablet, default FA layout](docs/tablet-before.png) | ![Tablet, with FA Mobile Grid, 2 columns](docs/tablet-after.png) |

## Features

- **Masonry grid** that uses the whole screen: thumbnails keep their aspect ratio and pack into 1–4 columns.
- **Column buttons** (1–4, bottom-left). Your choice is remembered. Defaults: 2 on phones, 3 on tablets, 4 on desktop.
- **Sharper thumbnails** at low column counts (FA's 600 px version at 1 column, 400 px at 2), so big tiles aren't blurry.
- **Quick fave heart** on every tile. Tap to fave or unfave without leaving the page.

Runs on user galleries, scraps, favorites, new submissions (`/msg/submissions/`), browse and search. It leaves the front page, notifications, messages and journals alone.

## Install

1. Install a userscript manager in your browser: [Violentmonkey](https://violentmonkey.github.io/) or Tampermonkey (Firefox for Android supports both as add-ons).
2. Open the [script file](https://raw.githubusercontent.com/headcrabned/fa-mobile-grid/main/fa-mobile-grid.user.js) and confirm the install when prompted by the userscript plugin.
3. Reload an FA gallery. The 1–4 buttons appear at the bottom-left.

Updates are picked up automatically through your userscript manager's update check.

## Notes and limits

- **Modern theme only.** The classic theme isn't supported.
- The script never touches your login or cookies. It only makes the same-site requests your browser would make anyway.
- If FA changes its page markup, the script does nothing and the normal layout stays intact. Please [open an issue](https://github.com/headcrabned/fa-mobile-grid/issues).

## License

[MIT](LICENSE)
