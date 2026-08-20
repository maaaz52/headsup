import type { Character } from './types'

export const fox: Character = {
  id: 'fox',
  name: 'Foxy',
  accent: '#fb923c',
  svg: `
    <svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg">
      <!-- hang glider wing -->
      <path d="M150 70 L395 110 Q290 40 150 70 Z" fill="#fb923c" stroke="#c2410c" stroke-width="3" />
      <path d="M150 70 L395 110 L310 128 L150 92 Z" fill="#fdba74" stroke="#c2410c" stroke-width="2" />
      <path d="M150 70 L110 85 L150 92 Z" fill="#fb923c" stroke="#c2410c" stroke-width="2" />
      <!-- frame lines -->
      <path d="M150 70 L210 150 M320 118 L235 152" stroke="#7c2d12" stroke-width="2" />
      <!-- fox body -->
      <ellipse cx="205" cy="158" rx="19" ry="14" fill="#fb923c" stroke="#ea580c" stroke-width="2" />
      <!-- harness -->
      <path d="M190 150 L185 172 L225 172 L220 150" stroke="#7c2d12" stroke-width="3" fill="none" />
      <!-- fox head (big!) -->
      <circle cx="205" cy="92" r="50" fill="#fb923c" stroke="#ea580c" stroke-width="3" />
      <!-- ears -->
      <path d="M165 60 L158 20 L188 44 Z" fill="#fb923c" stroke="#ea580c" stroke-width="2" />
      <path d="M245 60 L252 20 L222 44 Z" fill="#fb923c" stroke="#ea580c" stroke-width="2" />
      <path d="M166 54 L161 28 L182 44 Z" fill="#1f2937" />
      <path d="M244 54 L249 28 L228 44 Z" fill="#1f2937" />
      <!-- white face -->
      <path d="M175 92 Q185 70 205 70 Q225 70 235 92 Q228 120 205 128 Q182 120 175 92 Z" fill="#fff7ed" />
      <!-- eyes -->
      <circle cx="188" cy="88" r="6" fill="#111827" />
      <circle cx="222" cy="88" r="6" fill="#111827" />
      <circle cx="188" cy="88" r="2.4" fill="#ffffff" />
      <circle cx="222" cy="88" r="2.4" fill="#ffffff" />
      <!-- nose -->
      <ellipse cx="205" cy="104" rx="7" ry="5" fill="#1f2937" />
      <!-- mouth -->
      <path d="M200 110 q5 6 10 0" stroke="#1f2937" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <!-- cheeks -->
      <circle cx="170" cy="100" r="7" fill="#fdba74" opacity="0.6" />
      <circle cx="240" cy="100" r="7" fill="#fdba74" opacity="0.6" />
    </svg>
  `
}
