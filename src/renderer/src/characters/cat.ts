import type { Character } from './types'

export const cat: Character = {
  id: 'cat',
  name: 'Cosmo',
  accent: '#f472b6',
  svg: `
    <svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg">
      <!-- saucer body -->
      <ellipse cx="205" cy="170" rx="110" ry="34" fill="#cbd5e1" stroke="#64748b" stroke-width="3" />
      <ellipse cx="205" cy="164" rx="110" ry="30" fill="#e2e8f0" stroke="#94a3b8" stroke-width="2" />
      <!-- dome -->
      <path d="M150 166 Q155 100 205 100 Q255 100 260 166 Z" fill="#a5f3fc" stroke="#22d3ee" stroke-width="3" opacity="0.9" />
      <path d="M150 166 Q155 100 205 100 Q255 100 260 166 Z" fill="none" stroke="#67e8f9" stroke-width="1.5" />
      <!-- lights -->
      <circle cx="110" cy="172" r="6" fill="#f472b6" />
      <circle cx="150" cy="188" r="6" fill="#f472b6" />
      <circle cx="260" cy="188" r="6" fill="#f472b6" />
      <circle cx="300" cy="172" r="6" fill="#f472b6" />
      <!-- cat head (big!) -->
      <circle cx="205" cy="128" r="46" fill="#f97316" stroke="#c2410c" stroke-width="3" />
      <!-- ears -->
      <path d="M168 96 L158 58 L186 80 Z" fill="#f97316" stroke="#c2410c" stroke-width="2" />
      <path d="M242 96 L252 58 L224 80 Z" fill="#f97316" stroke="#c2410c" stroke-width="2" />
      <path d="M170 92 L164 68 L182 81 Z" fill="#fb7185" />
      <path d="M240 92 L246 68 L228 81 Z" fill="#fb7185" />
      <!-- eyes -->
      <ellipse cx="189" cy="126" rx="7" ry="9" fill="#1f2937" />
      <ellipse cx="221" cy="126" rx="7" ry="9" fill="#1f2937" />
      <circle cx="189" cy="123" r="2.6" fill="#ffffff" />
      <circle cx="221" cy="123" r="2.6" fill="#ffffff" />
      <!-- nose -->
      <ellipse cx="205" cy="142" rx="6" ry="4" fill="#f472b6" />
      <!-- mouth -->
      <path d="M199 147 q6 7 12 0 M199 147 q-6 7 -12 0" stroke="#1f2937" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <!-- whiskers -->
      <path d="M176 138 L150 132 M176 144 L148 146 M234 138 L260 132 M234 144 L262 146" stroke="#1f2937" stroke-width="2" stroke-linecap="round" />
    </svg>
  `
}
