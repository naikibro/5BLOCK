/**
 * Validation des variables d'environnement avec Zod
 * Garantit que toutes les variables critiques sont définies et valides
 */

import { z } from 'zod';

/**
 * Schema pour les variables d'environnement côté serveur
 * Ces variables NE DOIVENT PAS être exposées au client
 */
const serverEnvSchema = z.object({
  PINATA_JWT: z.string().min(1, 'PINATA_JWT est requis'),
});

/**
 * Schema pour les variables d'environnement côté client
 * Ces variables sont préfixées par NEXT_PUBLIC_ et exposées au navigateur
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_POKEMON_CARDS_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Adresse Ethereum invalide')
    .optional()
    .transform((val) => val || '0x0000000000000000000000000000000000000000'),
  
  NEXT_PUBLIC_CHAIN_ID: z
    .string()
    .regex(/^\d+$/, 'Chain ID invalide')
    .optional()
    .transform((val) => val || '11155111'), // Sepolia par défaut
  
  NEXT_PUBLIC_NETWORK_NAME: z
    .string()
    .optional()
    .transform((val) => val || 'sepolia'),
});

/**
 * Type pour les variables serveur
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Type pour les variables client
 */
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Valide les variables d'environnement serveur
 * @throws ZodError si validation échoue
 */
export function validateServerEnv(): ServerEnv {
  try {
    return serverEnvSchema.parse({
      PINATA_JWT: process.env.PINATA_JWT,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `❌ Variables d'environnement serveur invalides:\n${messages.join('\n')}`
      );
    }
    throw error;
  }
}

/**
 * Valide les variables d'environnement client
 * @throws ZodError si validation échoue
 */
export function validateClientEnv(): ClientEnv {
  try {
    return clientEnvSchema.parse({
      NEXT_PUBLIC_POKEMON_CARDS_ADDRESS: process.env.NEXT_PUBLIC_POKEMON_CARDS_ADDRESS,
      NEXT_PUBLIC_CHAIN_ID: process.env.NEXT_PUBLIC_CHAIN_ID,
      NEXT_PUBLIC_NETWORK_NAME: process.env.NEXT_PUBLIC_NETWORK_NAME,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      console.warn(
        `⚠️  Variables d'environnement client invalides:\n${messages.join('\n')}`
      );
      // Ne pas throw pour les variables client car l'app peut fonctionner partiellement
      // Retourner des valeurs par défaut
      return clientEnvSchema.parse({});
    }
    throw error;
  }
}

/**
 * Variables d'environnement client validées
 * Peuvent être importées partout dans l'app
 */
export const clientEnv = validateClientEnv();

/**
 * Helper pour vérifier si le contrat est configuré
 */
export function isContractConfigured(): boolean {
  return (
    clientEnv.NEXT_PUBLIC_POKEMON_CARDS_ADDRESS !==
    '0x0000000000000000000000000000000000000000'
  );
}

/**
 * Helper pour vérifier si on est sur le bon réseau
 */
export function getExpectedChainId(): number {
  return parseInt(clientEnv.NEXT_PUBLIC_CHAIN_ID);
}
