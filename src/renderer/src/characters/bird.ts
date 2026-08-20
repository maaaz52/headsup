import type { Character } from './types'

export const bird: Character = {
  id: 'bird',
  name: 'Skye',
  accent: '#f472b6',
  svg: `
    <svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg">
      <!-- paper plane -->
      <path d="M50 160 L360 150 L160 170 L90 190 Z" fill="#93c5fd" stroke="#60a5fa" stroke-width="3" />
      <path d="M50 160 L360 150 L200 190 Z" fill="#bfdbfe" stroke="#60a5fa" stroke-width="2" />
      <path d="M50 160 L360 150 L160 170 L90 190 Z" fill="none" stroke="#2563eb" stroke-width="2" />
      <!-- plane fold line -->
      <path d="M50 160 L200 190" stroke="#60a5fa" stroke-width="2" fill="none" />
      <!-- bird head (big!) -->
      <circle cx="205" cy="78" r="58" fill="#38bdf8" stroke="#0284c7" stroke-width="4" />
      <!-- crest -->
      <path d="M160 40 q-6 -18 10 -26 q-2 12 10 12 q-4 -14 12 -18 q0 12 10 12 q-4 -10 8 -12 q-4 14 6 20 q-14 6 -28 6 q-16 0 -28 6 z" fill="#0ea5e9" />
      <!-- eyes -->
      <circle cx="182" cy="72" r="9" fill="#ffffff" />
      <circle cx="228" cy="72" r="9" fill="#ffffff" />
      <circle cx="182" cy="74" r="4" fill="#111827" />
      <circle cx="228" cy="74" r="4" fill="#111827" />
      <!-- beak -->
      <path d="M180 92 L205 108 L230 92 Q205 98 180 92 Z" fill="#fb923c" stroke="#ea580c" stroke-width="2" />
      <!-- cheeks -->
      <circle cx="172" cy="92" r="8" fill="#fecaca" opacity="0.8" />
      <circle cx="238" cy="92" r="8" fill="#fecaca" opacity="0.8" />
      <!-- tiny body -->
      <ellipse cx="205" cy="158" rx="20" ry="14" fill="#7dd3fc" stroke="#0ea5e9" stroke-width="3" />
      <!-- scarf -->
      <path d="M182 148 q10 6 23 4 q14 2 20 8 q-8 8 -22 8 q-16 0 -21 -10 z" fill="#ef4444" stroke="#b91c1c" stroke-width="2" />
      <path d="M205 156 q10 14 4 26 q-8 6 -14 0 q6 -14 0 -24 z" fill="#ef4444" stroke="#b91c1c" stroke-width="2" />
      <!-- tail feather -->
      <path d="M392 154 q10 -8 22 -4 q-6 8 -18 12 q8 -2 10 6 q-10 0 -14 -8 z" fill="#0ea5e9" />
    </svg>
  `
}
