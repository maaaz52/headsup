import type { Character } from './types'

export const panda: Character = {
  id: 'panda',
  name: 'Paddy',
  accent: '#facc15',
  svg: `
    <svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg">
      <!-- propeller -->
      <g class="prop">
        <circle cx="45" cy="165" r="5" fill="#1f2937" />
        <rect x="45" y="162" width="34" height="6" rx="3" fill="#6b7280" />
        <rect x="45" y="162" width="34" height="6" rx="3" fill="#6b7280" transform="rotate(120 45 165)" />
        <rect x="45" y="162" width="34" height="6" rx="3" fill="#6b7280" transform="rotate(240 45 165)" />
      </g>
      <!-- exhaust puffs -->
      <circle cx="62" cy="158" r="6" fill="#e5e7eb" opacity="0.5" />
      <circle cx="72" cy="166" r="4" fill="#e5e7eb" opacity="0.35" />
      <!-- fuselage -->
      <path d="M55 165 Q65 135 125 135 L300 135 Q360 135 360 165 Q360 195 300 195 L125 195 Q65 195 55 165 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="3" />
      <!-- top wing -->
      <path d="M125 118 h140 l-10 20 h-140 z" fill="#dc2626" stroke="#991b1b" stroke-width="2" />
      <!-- wing struts -->
      <rect x="165" y="135" width="6" height="60" fill="#7f1d1d" />
      <rect x="245" y="135" width="6" height="60" fill="#7f1d1d" />
      <!-- lower wing -->
      <rect x="150" y="197" width="130" height="14" rx="7" fill="#b91c1c" />
      <!-- tail -->
      <path d="M360 140 l34 -20 10 22 -10 16 -34 -18 z" fill="#b91c1c" stroke="#991b1b" stroke-width="2" />
      <!-- panda body (small, inside cockpit) -->
      <ellipse cx="205" cy="158" rx="20" ry="15" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
      <!-- panda head (big, facing forward) -->
      <circle cx="205" cy="90" r="55" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3" />
      <!-- ears -->
      <circle cx="165" cy="46" r="16" fill="#111827" />
      <circle cx="245" cy="46" r="16" fill="#111827" />
      <circle cx="165" cy="46" r="8" fill="#374151" />
      <circle cx="245" cy="46" r="8" fill="#374151" />
      <!-- eye patches -->
      <ellipse cx="181" cy="88" rx="14" ry="17" fill="#111827" />
      <ellipse cx="229" cy="88" rx="14" ry="17" fill="#111827" />
      <!-- glasses -->
      <circle cx="181" cy="88" r="17" fill="none" stroke="#111827" stroke-width="3" />
      <circle cx="229" cy="88" r="17" fill="none" stroke="#111827" stroke-width="3" />
      <path d="M198 88 h14" stroke="#111827" stroke-width="3" />
      <path d="M164 88 l-7 -4" stroke="#111827" stroke-width="3" stroke-linecap="round" />
      <path d="M246 88 l7 -4" stroke="#111827" stroke-width="3" stroke-linecap="round" />
      <!-- eyes -->
      <circle cx="181" cy="88" r="5" fill="#ffffff" />
      <circle cx="229" cy="88" r="5" fill="#ffffff" />
      <circle cx="181" cy="89" r="2.4" fill="#152033" />
      <circle cx="229" cy="89" r="2.4" fill="#152033" />
      <!-- lens shine -->
      <circle cx="175" cy="83" r="1.6" fill="#ffffff" />
      <circle cx="223" cy="83" r="1.6" fill="#ffffff" />
      <!-- nose -->
      <ellipse cx="205" cy="108" rx="9" ry="6" fill="#111827" />
      <!-- mouth -->
      <path d="M205 114 v6 m0 0 q-6 8 -14 4 M205 120 q6 8 14 4" stroke="#111827" stroke-width="3" fill="none" stroke-linecap="round" />
      <!-- landing gear -->
      <rect x="172" y="196" width="11" height="8" fill="#7f1d1d" />
      <rect x="248" y="196" width="11" height="8" fill="#7f1d1d" />
      <circle cx="177" cy="208" r="9" fill="#1f2937" stroke="#111827" stroke-width="2" />
      <circle cx="253" cy="208" r="9" fill="#1f2937" stroke="#111827" stroke-width="2" />
    </svg>
  `
}
