import type { Character } from './types'

export const rocket: Character = {
  id: 'rocket',
  name: 'Boomer',
  accent: '#22d3ee',
  svg: `
    <svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg">
      <!-- flame -->
      <path d="M420 145 q30 20 18 45 q-8 -12 -18 -12 q14 8 8 20 q-22 -14 -34 -28 q-6 8 -8 18 q-10 -12 -10 -26 q14 -6 24 -17 z" fill="#fb923c" />
      <path d="M424 150 q18 14 8 34 q-6 -10 -14 -14 q8 6 2 16 q-16 -12 -24 -24 z" fill="#fde047" />
      <!-- rocket body -->
      <path d="M60 130 Q70 95 120 95 L330 95 Q370 95 390 130 Q370 165 330 165 L120 165 Q70 165 60 130 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="3" />
      <!-- nose -->
      <path d="M60 130 Q40 130 40 130 Q55 112 76 106 Q68 118 60 130 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2" />
      <!-- red stripe -->
      <rect x="120" y="126" width="200" height="8" fill="#ef4444" />
      <!-- window (big face!) -->
      <circle cx="205" cy="130" r="46" fill="#0f172a" stroke="#334155" stroke-width="4" />
      <!-- face -->
      <circle cx="188" cy="120" r="6" fill="#ffffff" />
      <circle cx="222" cy="120" r="6" fill="#ffffff" />
      <circle cx="188" cy="121" r="2.6" fill="#111827" />
      <circle cx="222" cy="121" r="2.6" fill="#111827" />
      <path d="M196 140 q9 8 18 0" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" />
      <!-- cheeks -->
      <circle cx="176" cy="136" r="6" fill="#fb7185" opacity="0.6" />
      <circle cx="234" cy="136" r="6" fill="#fb7185" opacity="0.6" />
      <!-- fins -->
      <path d="M300 150 L370 180 L370 160 L330 150 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2" />
      <path d="M300 110 L370 80 L370 100 L330 110 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2" />
      <!-- bottom fin -->
      <path d="M190 162 L205 190 L220 162 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="2" />
    </svg>
  `
}
