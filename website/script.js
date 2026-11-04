const releaseBase = 'https://github.com/maaaz52/headsup/releases/latest/download'
const linuxReleaseBase = 'https://github.com/maaaz52/headsup/releases/download/v1.0.1'
const downloads = {
  windows: {
    label: 'Windows detected. The EXE is ready.',
    button: 'Download for Windows',
    url: `${releaseBase}/Headsup-win-x64.exe`
  },
  macos: {
    label: 'macOS detected. The build is still pending.',
    button: 'View macOS status',
    url: '#downloads'
  },
  linux: {
    label: 'Linux detected. The AppImage is ready.',
    button: 'Download AppImage',
    url: `${linuxReleaseBase}/Headsup-linux-x86_64.AppImage`
  }
}

function detectPlatform() {
  const value = `${navigator.platform || ''} ${navigator.userAgent || ''}`.toLowerCase()
  if (value.includes('mac')) return 'macos'
  if (value.includes('linux')) return 'linux'
  return 'windows'
}

const platform = detectPlatform()
const choice = downloads[platform]
const primary = document.querySelector('#primary-download')
const label = document.querySelector('#detected-platform')

if (primary && label) {
  primary.textContent = choice.button
  primary.href = choice.url
  label.textContent = choice.label
  document.querySelector(`[data-platform="${platform}"]`)?.classList.add('is-recommended')
}
