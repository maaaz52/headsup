import type { Character } from './types'

export const owl: Character = {
  id: 'owl',
  name: 'Hoot',
  accent: '#a78bfa',
  svg: `
    <svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg">
      <!-- broom -->
      <rect x="120" y="196" width="230" height="8" rx="4" fill="#92400e" transform="rotate(-14 235 200)" />
      <path d="M120 204 L60 240 L80 250 L130 212 Z" fill="#d97706" stroke="#b45309" stroke-width="2" />
      <rect x="60" y="236" width="26" height="12" rx="4" fill="#92400e" />
      <!-- star trail -->
      <path d="M300 150 l4 9 9 4 -9 4 -4 9 -4 -9 -9 -4 9 -4 z" fill="#fde047" opacity="0.8" />
      <path d="M350 130 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" fill="#fde047" opacity="0.6" />
      <!-- owl body -->
      <ellipse cx="205" cy="160" rx="22" ry="16" fill="#8b5cf6" stroke="#6d28d9" stroke-width="3" />
      <path d="M185 170 q-10 14 -22 10 q4 -8 12 -8 q-4 -6 2 -10 q6 4 8 8 z" fill="#a78bfa" />
      <!-- owl head (big!) -->
      <circle cx="205" cy="92" r="52" fill="#8b5cf6" stroke="#6d28d9" stroke-width="3" />
      <!-- ear tufts -->
      <path d="M160 58 L148 24 L176 44 Z" fill="#6d28d9" />
      <path d="M250 58 L262 24 L234 44 Z" fill="#6d28d9" />
      <!-- face disc -->
      <ellipse cx="205" cy="92" rx="38" ry="34" fill="#c4b5fd" stroke="#8b5cf6" stroke-width="2" />
      <!-- eyes -->
      <circle cx="188" cy="88" r="13" fill="#ffffff" stroke="#312e81" stroke-width="3" />
      <circle cx="222" cy="88" r="13" fill="#ffffff" stroke="#312e81" stroke-width="3" />
      <circle cx="188" cy="90" r="6" fill="#1e1b4b" />
      <circle cx="222" cy="90" r="6" fill="#1e1b4b" />
      <circle cx="188" cy="90" r="2.4" fill="#ffffff" />
      <circle cx="222" cy="90" r="2.4" fill="#ffffff" />
      <!-- beak -->
      <path d="M196 104 L205 116 L214 104 Z" fill="#f59e0b" stroke="#b45309" stroke-width="2" />
      <!-- brow -->
      <path d="M176 74 Q186 70 196 74" stroke="#4c1d95" stroke-width="3" fill="none" stroke-linecap="round" />
      <path d="M214 74 Q224 70 234 74" stroke="#4c1d95" stroke-width="3" fill="none" stroke-linecap="round" />
      <!-- feet -->
      <path d="M192 176 L188 190 L196 186 M218 176 L222 190 L214 186" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" fill="none" />
    </svg>
  `
}
