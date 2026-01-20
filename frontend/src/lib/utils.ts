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

/**
 * Formate une date en format lisible "MMM d, yyyy HH:mm"
 * Ex: "Jan 15, 2026 14:32"
 * Utilise UTC pour éviter les problèmes de timezone
 */
export function formatDate(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Utiliser l'heure locale (cohérent avec l'affichage blockchain)
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${month} ${day}, ${year} ${hours}:${minutes}`;
}

/**
 * Formate un temps en secondes au format "mm:ss"
 * Ex: formatTime(330) => "5:30"
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
