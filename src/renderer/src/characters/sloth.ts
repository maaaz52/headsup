import type { Character } from './types'

export const sloth: Character = {
  id: 'sloth',
  name: 'Snooze',
  accent: '#a3a3a3',
  svg: `
    <svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg">
      <!-- balloon envelope -->
      <ellipse cx="205" cy="105" rx="88" ry="80" fill="#f97316" stroke="#c2410c" stroke-width="3" />
      <path d="M117 105 Q205 10 293 105 Q205 40 117 105 Z" fill="#fb923c" />
      <path d="M117 105 Q205 175 293 105 Q205 160 117 105 Z" fill="#fdba74" />
      <ellipse cx="205" cy="105" rx="30" ry="74" fill="#ea580c" stroke="#c2410c" stroke-width="2" />
      <!-- rigging -->
      <path d="M165 172 L185 210 M245 172 L225 210" stroke="#78350f" stroke-width="3" />
      <!-- basket -->
      <path d="M155 210 L155 240 Q155 252 205 252 Q255 252 255 240 L255 210 Z" fill="#92400e" stroke="#78350f" stroke-width="3" />
      <rect x="155" y="218" width="100" height="4" fill="#78350f" />
      <rect x="155" y="230" width="100" height="4" fill="#78350f" />
      <!-- sloth head (big!) -->
      <circle cx="205" cy="200" r="34" fill="#a8a29e" stroke="#78716c" stroke-width="3" />
      <!-- eye patches -->
      <path d="M180 196 q-4 -14 12 -14 q-8 10 -8 22 M230 196 q4 -14 -12 -14 q8 10 8 22" fill="#1f2937" />
      <!-- eyes -->
      <circle cx="192" cy="194" r="6" fill="#ffffff" />
      <circle cx="218" cy="194" r="6" fill="#ffffff" />
      <circle cx="192" cy="195" r="3" fill="#111827" />
      <circle cx="218" cy="195" r="3" fill="#111827" />
      <!-- nose -->
      <ellipse cx="205" cy="206" rx="7" ry="5" fill="#57534e" />
      <!-- sleepy mouth -->
      <path d="M197 214 q8 6 16 0" stroke="#57534e" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <!-- blush -->
      <circle cx="180" cy="206" r="5" fill="#fdba74" opacity="0.7" />
      <circle cx="230" cy="206" r="5" fill="#fdba74" opacity="0.7" />
      <!-- paws on basket -->
      <ellipse cx="182" cy="210" rx="9" ry="6" fill="#a8a29e" stroke="#78716c" stroke-width="2" />
      <ellipse cx="228" cy="210" rx="9" ry="6" fill="#a8a29e" stroke="#78716c" stroke-width="2" />
    </svg>
  `
}
