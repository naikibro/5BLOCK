/**
 * Script pour financer un compte avec de l'ETH
 * Utilise un compte pré-financé de Hardhat pour envoyer des fonds
 */

import { ethers } from "hardhat";

async function main() {
  // Récupérer l'adresse cible depuis les arguments
  const targetAddress = process.env.TARGET_ADDRESS || process.argv[2];
  
  if (!targetAddress) {
    console.error("❌ Erreur: Veuillez fournir une adresse cible");
    console.log("Usage: npx hardhat run scripts/fund-account.ts --network localhost -- <address>");
    console.log("   ou: TARGET_ADDRESS=0x... npx hardhat run scripts/fund-account.ts --network localhost");
    process.exit(1);
  }

  // Vérifier que l'adresse est valide
  if (!ethers.isAddress(targetAddress)) {
    console.error("❌ Erreur: Adresse invalide:", targetAddress);
    process.exit(1);
  }

  // Récupérer le premier signer (compte pré-financé)
  const [funder] = await ethers.getSigners();
  
  console.log("\n💰 Financement du compte...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 Compte source:", funder.address);
  console.log("🎯 Compte cible:", targetAddress);
  
  // Vérifier le solde actuel de la cible
  const currentBalance = await ethers.provider.getBalance(targetAddress);
  console.log("📊 Solde actuel:", ethers.formatEther(currentBalance), "ETH");
  
  // Montant à envoyer (10 ETH par défaut, peut être modifié)
  const amountToSend = process.env.AMOUNT || "10";
  const amount = ethers.parseEther(amountToSend);
  
  console.log("💸 Montant à envoyer:", amountToSend, "ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Envoyer les fonds
  console.log("\n⏳ Envoi de la transaction...");
  const tx = await funder.sendTransaction({
    to: targetAddress,
    value: amount,
  });
  
  console.log("📝 Transaction hash:", tx.hash);
  console.log("⏳ Attente de confirmation...");
  
  await tx.wait();
  
  // Vérifier le nouveau solde
  const newBalance = await ethers.provider.getBalance(targetAddress);
  console.log("\n✅ Transaction confirmée!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Nouveau solde:", ethers.formatEther(newBalance), "ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Erreur:", error.message);
    process.exit(1);
  });
