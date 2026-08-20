import type { Character } from './types'
import { panda } from './panda'
import { rocket } from './rocket'
import { bird } from './bird'
import { fox } from './fox'
import { cat } from './cat'
import { owl } from './owl'
import { dino } from './dino'
import { sloth } from './sloth'

export const characters: Record<string, Character> = {
  panda,
  rocket,
  bird,
  fox,
  cat,
  owl,
  dino,
  sloth
}

export function getCharacter(id: string): Character {
  return characters[id] ?? characters.panda
}

export function getCharacters(): Character[] {
  return Object.values(characters)
}