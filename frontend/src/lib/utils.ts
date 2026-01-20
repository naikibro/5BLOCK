/**
 * Utilitaires généraux
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine les classes CSS avec Tailwind merge
 * Permet de fusionner les classes Tailwind de manière intelligente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
