import type { Character } from './types'

export const dino: Character = {
  id: 'dino',
  name: 'Rex',
  accent: '#4ade80',
  svg: `
    <svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg">
      <!-- paper plane -->
      <path d="M50 170 L365 148 L165 182 L95 205 Z" fill="#93c5fd" stroke="#60a5fa" stroke-width="3" />
      <path d="M50 170 L365 148 L200 195 Z" fill="#bfdbfe" stroke="#60a5fa" stroke-width="2" />
      <path d="M50 170 L200 195" stroke="#60a5fa" stroke-width="2" fill="none" />
      <!-- dino body -->
      <ellipse cx="205" cy="150" rx="22" ry="15" fill="#4ade80" stroke="#16a34a" stroke-width="3" />
      <!-- tail -->
      <path d="M225 150 q24 2 34 12 q-12 -8 -6 -16 q-16 2 -28 4 z" fill="#4ade80" stroke="#16a34a" stroke-width="2" />
      <!-- dino head (big!) -->
      <circle cx="205" cy="92" r="52" fill="#4ade80" stroke="#16a34a" stroke-width="3" />
      <!-- spikes -->
      <path d="M175 46 L185 26 L195 46 Z" fill="#15803d" />
      <path d="M195 42 L205 22 L215 42 Z" fill="#15803d" />
      <path d="M215 46 L225 26 L235 46 Z" fill="#15803d" />
      <!-- eyes -->
      <ellipse cx="190" cy="88" rx="8" ry="10" fill="#ffffff" stroke="#14532d" stroke-width="3" />
      <ellipse cx="220" cy="88" rx="8" ry="10" fill="#ffffff" stroke="#14532d" stroke-width="3" />
      <circle cx="190" cy="90" r="4.5" fill="#111827" />
      <circle cx="220" cy="90" r="4.5" fill="#111827" />
      <circle cx="190" cy="90" r="1.8" fill="#ffffff" />
      <circle cx="220" cy="90" r="1.8" fill="#ffffff" />
      <!-- snout -->
      <ellipse cx="205" cy="108" rx="20" ry="13" fill="#86efac" stroke="#16a34a" stroke-width="2" />
      <!-- nostrils -->
      <circle cx="198" cy="106" r="2.5" fill="#14532d" />
      <circle cx="212" cy="106" r="2.5" fill="#14532d" />
      <!-- mouth -->
      <path d="M190 118 q15 8 30 0" stroke="#14532d" stroke-width="3" fill="none" stroke-linecap="round" />
      <!-- teeth -->
      <path d="M196 114 l0 5 M200 115 l0 5 M204 116 l0 5 M208 115 l0 5 M212 114 l0 5" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
      <!-- belly -->
      <ellipse cx="205" cy="158" rx="14" ry="8" fill="#bbf7d0" />
    </svg>
  `
}
