/**
 * Anonymous Identity Generator
 * Provides static word banks (adjectives and nouns) and helper functions
 * to generate persistent, unique, and human-readable anonymous display names.
 *
 * Pattern: "Anonymous [Adjective] [Noun]"
 * Example: "Anonymous Calm Sparrow"
 */

export const ADJECTIVES = [
  'calm',
  'brave',
  'bright',
  'gentle',
  'wise',
  'kind',
  'warm',
  'silent',
  'resilient',
  'peaceful',
  'happy',
  'patient',
  'strong',
  'noble',
  'creative',
  'eager',
  'joyful',
  'sincere',
  'lively',
  'friendly',
  'honest',
  'loyal',
  'thoughtful',
  'cheerful',
  'quiet',
  'bold',
  'pleasant',
  'polite',
  'generous',
  'helpful',
  'caring',
  'optimistic',
  'hopeful',
  'fearless',
  'humble',
  'mindful',
  'balanced',
  'gracious',
  'compassionate',
  'serene',
  'tranquil',
  'radiant',
  'vigilant',
  'playful',
  'harmonic',
  'gentle',
  'steady',
  'clever',
  'earnest',
  'friendly',
];

export const NOUNS = [
  'sparrow',
  'willow',
  'river',
  'meadow',
  'star',
  'panda',
  'koala',
  'otter',
  'robin',
  'deer',
  'fox',
  'dolphin',
  'badger',
  'squirrel',
  'owl',
  'rabbit',
  'bear',
  'turtle',
  'butterfly',
  'swan',
  'ocean',
  'forest',
  'mountain',
  'breeze',
  'cloud',
  'sunflower',
  'pebble',
  'feather',
  'leaf',
  'acorn',
  'fawn',
  'hawk',
  'maple',
  'cedar',
  'elm',
  'brook',
  'valley',
  'canyon',
  'coast',
  'harbor',
  'glade',
  'island',
  'haven',
  'shelter',
  'beacon',
  'anchor',
  'crest',
  'summit',
  'path',
  'journey',
];

/**
 * Capitalizes the first letter of a string.
 */
function capitalize(word: string | undefined): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Generates a random anonymous identity name.
 * Format: "Anonymous [Adjective] [Noun]"
 */
export function generateAnonymousName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `Anonymous ${capitalize(adj)} ${capitalize(noun)}`;
}
