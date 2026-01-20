/**
 * Script de déploiement du contrat PokemonCards
 * Usage:
 *   - Local: pnpm run deploy:local
 *   - Sepolia: pnpm run deploy:sepolia
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("🚀 Déploiement des contrats avec le compte:", deployer.address);
  console.log("💰 Balance du compte:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  
  // ==========================================
  // 1. Déployer PokemonCards
  // ==========================================
  console.log("\n📦 Déploiement de PokemonCards...");
  const PokemonCards = await ethers.getContractFactory("PokemonCards");
  const pokemonCards = await PokemonCards.deploy();
  await pokemonCards.waitForDeployment();
  
  const cardsAddress = await pokemonCards.getAddress();
  console.log("✅ PokemonCards déployé à:", cardsAddress);
  
  // ==========================================
  // 2. Déployer TradeMarket
  // ==========================================
  console.log("\n📦 Déploiement de TradeMarket...");
  const TradeMarket = await ethers.getContractFactory("TradeMarket");
  const tradeMarket = await TradeMarket.deploy(cardsAddress);
  await tradeMarket.waitForDeployment();
  
  const marketAddress = await tradeMarket.getAddress();
  console.log("✅ TradeMarket déployé à:", marketAddress);
  
  // ==========================================
  // 3. Vérifier le déploiement
  // ==========================================
  console.log("\n🔍 Vérification des contrats...");
  const name = await pokemonCards.name();
  const symbol = await pokemonCards.symbol();
  const maxCards = await pokemonCards.MAX_CARDS_PER_WALLET();
  const lockDuration = await pokemonCards.LOCK_DURATION();
  const cooldownDuration = await tradeMarket.COOLDOWN_DURATION();
  
  console.log("   PokemonCards:");
  console.log("     - Nom:", name);
  console.log("     - Symbole:", symbol);
  console.log("     - Max cartes par wallet:", maxCards.toString());
  console.log("     - Durée du lock:", lockDuration.toString(), "secondes");
  console.log("   TradeMarket:");
  console.log("     - Cooldown:", cooldownDuration.toString(), "secondes");
  
  // ==========================================
  // 4. Sauvegarder les adresses
  // ==========================================
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PokemonCards: {
        address: cardsAddress,
        name: name,
        symbol: symbol,
      },
      TradeMarket: {
        address: marketAddress,
        pokemonCardsAddress: cardsAddress,
      },
    },
  };
  
  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }
  
  const networkName = (await ethers.provider.getNetwork()).name;
  const filename = `${networkName}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentPath, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // Aussi sauvegarder la dernière version
  fs.writeFileSync(
    path.join(deploymentPath, `${networkName}-latest.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 Informations de déploiement sauvegardées dans:", filename);
  
  // ==========================================
  // 5. Configuration pour le frontend
  // ==========================================
  console.log("\n📝 Configuration pour le frontend (.env.local):");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`NEXT_PUBLIC_POKEMON_CARDS_ADDRESS=${cardsAddress}`);
  console.log(`NEXT_PUBLIC_TRADE_MARKET_ADDRESS=${marketAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Mettre à jour automatiquement le .env.local du frontend
  const frontendEnvPath = path.join(__dirname, "../frontend/.env.local");
  if (fs.existsSync(frontendEnvPath)) {
    let envContent = fs.readFileSync(frontendEnvPath, "utf8");
    envContent = envContent.replace(
      /NEXT_PUBLIC_POKEMON_CARDS_ADDRESS=.*/,
      `NEXT_PUBLIC_POKEMON_CARDS_ADDRESS=${cardsAddress}`
    );
    if (!envContent.includes("NEXT_PUBLIC_TRADE_MARKET_ADDRESS")) {
      envContent += `\nNEXT_PUBLIC_TRADE_MARKET_ADDRESS=${marketAddress}\n`;
    } else {
      envContent = envContent.replace(
        /NEXT_PUBLIC_TRADE_MARKET_ADDRESS=.*/,
        `NEXT_PUBLIC_TRADE_MARKET_ADDRESS=${marketAddress}`
      );
    }
    fs.writeFileSync(frontendEnvPath, envContent);
    console.log("\n✅ Fichier .env.local du frontend mis à jour automatiquement!");
  }
  
  // ==========================================
  // 5. Vérification Etherscan (si Sepolia)
  // ==========================================
  if (networkName === "sepolia") {
    console.log("\n⏳ Attente de 30 secondes avant la vérification Etherscan...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log("\n🔍 Vérification sur Etherscan...");
    try {
      await (hre as any).run("verify:verify", {
        address: cardsAddress,
        constructorArguments: [],
      });
      console.log("✅ Contrat vérifié sur Etherscan!");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  Contrat déjà vérifié sur Etherscan");
      } else {
        console.log("⚠️  Erreur lors de la vérification:", error.message);
        console.log("   Vous pouvez vérifier manuellement avec:");
        console.log(`   npx hardhat verify --network sepolia ${cardsAddress}`);
      }
    }
  }
  
  console.log("\n✨ Déploiement terminé avec succès!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erreur lors du déploiement:", error);
    process.exit(1);
  });
