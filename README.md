# Headsup

Headsup is a desktop meeting reminder that sends a friendly character across the screen before an event starts.

## Platforms

- Windows 10 or newer: NSIS installer
- macOS 11 or newer: DMG and ZIP for Apple silicon and Intel
- Linux: AppImage and DEB for 64-bit systems

## Calendar support

Headsup reads HTTPS ICS or iCal subscription links. It works with Google Calendar, Outlook, iCloud, and other calendar services that provide a subscription URL. Calendar links and settings remain on the local device.

## Development

```sh
npm install
npm run dev
```

Run the checks:

```sh
npm run typecheck
npm run build
```

Build for the current release platform:

```sh
npm run dist:win
npm run dist:mac
npm run dist:linux
```

macOS packages must be built on macOS. The GitHub Actions release workflow uses native runners for every supported operating system.

## Website

The static download website lives in `website/`.

```sh
node website/build.mjs
```

The public deployment workflow publishes `website/dist` to GitHub Pages.

## Releases

Push a tag such as `v1.0.0` to build every desktop package and create a GitHub Release. Stable asset names keep the website download links unchanged between releases.

Trusted public distribution requires platform signing credentials. Configure the Windows certificate secrets and Apple Developer signing and notarization secrets in the repository before promoting builds to end users.

## License

[MIT](LICENSE)
