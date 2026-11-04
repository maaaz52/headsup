const releaseBase = 'https://github.com/maaaz52/headsup/releases/latest/download'
const downloads = {
  windows: {
    label: 'Windows 10 or newer',
    button: 'Download for Windows',
    url: `${releaseBase}/Headsup-win-x64.exe`
  },
  macos: {
    label: 'macOS, Apple silicon or Intel',
    button: 'Choose a macOS build',
    url: '#platform-list'
  },
  linux: {
    label: 'Linux, 64-bit',
    button: 'Download AppImage',
    url: `${releaseBase}/Headsup-linux-x86_64.AppImage`
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
const recommended = document.querySelector('#recommended-download')
const label = document.querySelector('#detected-platform')

if (primary && recommended && label) {
  primary.textContent = choice.button
  primary.href = choice.url
  recommended.textContent = choice.button
  recommended.href = choice.url
  label.textContent = choice.label
  document.querySelector(`[data-platform="${platform}"]`)?.classList.add('is-recommended')
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }
  }, { threshold: 0.14 })

  document.querySelectorAll('.reveal:not(.is-visible)').forEach((element) => observer.observe(element))
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'))
}
