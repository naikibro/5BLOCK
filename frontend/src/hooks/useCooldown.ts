/**
 * Hook pour gérer le cooldown des actions de trading
 * Affiche le temps restant avant la prochaine action possible
 */

import { useState, useEffect } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { tradeMarketAbi, tradeMarketAddress } from '@/lib/contracts';

export interface UseCooldownReturn {
  remaining: number; // Secondes restantes
  isOnCooldown: boolean;
  formattedTime: string; // Format MM:SS
}

/**
 * Formate le temps restant en MM:SS
 * @param seconds - Nombre de secondes
 * @returns Temps formaté (ex: "3:42")
 */
function formatCooldown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Hook pour suivre le cooldown d'un utilisateur
 * Met à jour automatiquement avec un countdown en temps réel
 * @returns État du cooldown avec temps restant formaté
 */
export function useCooldown(): UseCooldownReturn {
  const { address } = useAccount();
  const [remaining, setRemaining] = useState(0);

  // Lecture du cooldown depuis le contrat
  const { data: cooldownRemaining, refetch } = useReadContract({
    address: tradeMarketAddress,
    abi: tradeMarketAbi,
    functionName: 'getCooldownRemaining',
    args: address ? [address] : undefined,
    query: { 
      enabled: !!address,
      refetchInterval: 10000, // Refetch toutes les 10 secondes par sécurité
    },
  });

  // Sync avec la valeur du contrat
  useEffect(() => {
    if (cooldownRemaining !== undefined) {
      setRemaining(Number(cooldownRemaining));
    }
  }, [cooldownRemaining]);

  // Countdown local (met à jour chaque seconde)
  useEffect(() => {
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          refetch(); // Refresh depuis le contrat quand terminé
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining, refetch]);

  return {
    remaining,
    isOnCooldown: remaining > 0,
    formattedTime: formatCooldown(remaining),
  };
}
