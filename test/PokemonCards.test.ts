/**
 * Tests pour le contrat PokemonCards
 */

import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { PokemonCards } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("PokemonCards", function () {
  let pokemonCards: PokemonCards;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const PokemonCardsFactory = await ethers.getContractFactory("PokemonCards");
    pokemonCards = await PokemonCardsFactory.deploy();
    await pokemonCards.waitForDeployment();
  });

  describe("Déploiement", function () {
    it("devrait avoir le bon nom et symbole", async function () {
      expect(await pokemonCards.name()).to.equal("PokemonCards");
      expect(await pokemonCards.symbol()).to.equal("PKMN");
    });

    it("devrait avoir les bonnes constantes", async function () {
      expect(await pokemonCards.MAX_CARDS_PER_WALLET()).to.equal(4);
      expect(await pokemonCards.LOCK_DURATION()).to.equal(600); // 10 minutes
      expect(await pokemonCards.MAX_POKEMON_ID()).to.equal(151);
      expect(await pokemonCards.MIN_POKEMON_ID()).to.equal(1);
    });

    it("devrait définir le déployeur comme owner", async function () {
      expect(await pokemonCards.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("devrait minter avec succès quand sous la limite", async function () {
      const tx = await pokemonCards.connect(user1).mint(
        25,  // Pikachu
        1,   // Common
        130, // value
        "ipfs://QmTest"
      );

      await expect(tx)
        .to.emit(pokemonCards, "CardMinted")
        .withArgs(user1.address, 0, 25, 1);

      expect(await pokemonCards.ownerOf(0)).to.equal(user1.address);
      expect(await pokemonCards.getOwnedCount(user1.address)).to.equal(1);
    });

    it("devrait stocker les métadonnées correctement", async function () {
      await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://QmTest");

      const cardMeta = await pokemonCards.getCardMeta(0);
      expect(cardMeta.pokemonId).to.equal(25);
      expect(cardMeta.rarityTier).to.equal(3);
      expect(cardMeta.value).to.equal(130);
      expect(cardMeta.createdAt).to.be.gt(0);
      expect(cardMeta.lastTransferAt).to.equal(cardMeta.createdAt);
    });

    it("devrait définir le tokenURI correctement", async function () {
      await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://QmTest123");
      expect(await pokemonCards.tokenURI(0)).to.equal("ipfs://QmTest123");
    });

    it("devrait revert si pokemonId < 1", async function () {
      await expect(
        pokemonCards.connect(user1).mint(0, 1, 100, "ipfs://test")
      ).to.be.revertedWithCustomError(pokemonCards, "InvalidPokemonId");
    });

    it("devrait revert si pokemonId > 151", async function () {
      await expect(
        pokemonCards.connect(user1).mint(152, 1, 100, "ipfs://test")
      ).to.be.revertedWithCustomError(pokemonCards, "InvalidPokemonId");
    });

    it("devrait revert à la limite de 4 cartes", async function () {
      // Minter 4 cartes
      for (let i = 1; i <= 4; i++) {
        await pokemonCards.connect(user1).mint(i, 1, 100, `ipfs://test${i}`);
      }

      expect(await pokemonCards.getOwnedCount(user1.address)).to.equal(4);

      // La 5ème devrait échouer
      await expect(
        pokemonCards.connect(user1).mint(5, 1, 100, "ipfs://test5")
      ).to.be.revertedWithCustomError(pokemonCards, "MaxCardsReached");
    });

    it("devrait permettre à plusieurs wallets de minter", async function () {
      await pokemonCards.connect(user1).mint(1, 1, 100, "ipfs://test1");
      await pokemonCards.connect(user2).mint(2, 1, 100, "ipfs://test2");

      expect(await pokemonCards.getOwnedCount(user1.address)).to.equal(1);
      expect(await pokemonCards.getOwnedCount(user2.address)).to.equal(1);
    });
  });

  describe("Locking", function () {
    it("devrait verrouiller une carte après le mint", async function () {
      await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://test");
      expect(await pokemonCards.isLocked(0)).to.be.true;
    });

    it("devrait émettre l'event CardLocked avec le bon timestamp", async function () {
      const tx = await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://test");
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      const expectedLockUntil = block!.timestamp + 600; // 10 minutes

      await expect(tx)
        .to.emit(pokemonCards, "CardLocked")
        .withArgs(0, expectedLockUntil);
    });

    it("devrait déverrouiller après 10 minutes", async function () {
      await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://test");
      expect(await pokemonCards.isLocked(0)).to.be.true;

      // Avancer le temps de 10 minutes
      await time.increase(600);

      expect(await pokemonCards.isLocked(0)).to.be.false;
    });

    it("devrait retourner le bon lockUntil timestamp", async function () {
      const tx = await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://test");
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);
      const expectedLockUntil = block!.timestamp + 600;

      expect(await pokemonCards.getLockUntil(0)).to.equal(expectedLockUntil);
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      // Minter quelques cartes pour les tests
      await pokemonCards.connect(user1).mint(1, 1, 100, "ipfs://test1");
      await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://test2");
    });

    it("devrait retourner les métadonnées d'une carte", async function () {
      const cardMeta = await pokemonCards.getCardMeta(0);
      expect(cardMeta.pokemonId).to.equal(1);
      expect(cardMeta.rarityTier).to.equal(1);
      expect(cardMeta.value).to.equal(100);
    });

    it("devrait revert pour un token inexistant", async function () {
      await expect(
        pokemonCards.getCardMeta(999)
      ).to.be.revertedWithCustomError(pokemonCards, "TokenNotFound");
    });

    it("devrait retourner le bon ownedCount", async function () {
      expect(await pokemonCards.getOwnedCount(user1.address)).to.equal(2);
      expect(await pokemonCards.getOwnedCount(user2.address)).to.equal(0);
    });

    it("devrait confirmer l'existence d'un token", async function () {
      expect(await pokemonCards.exists(0)).to.be.true;
      expect(await pokemonCards.exists(1)).to.be.true;
      expect(await pokemonCards.exists(999)).to.be.false;
    });

    it("devrait retourner previousOwners vide pour une carte mintée", async function () {
      const previousOwners = await pokemonCards.getPreviousOwners(0);
      expect(previousOwners).to.have.lengthOf(0);
    });
  });

  describe("Transfer (simulation pour tests futurs)", function () {
    beforeEach(async function () {
      await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://test");
      // Attendre que le lock expire
      await time.increase(600);
    });

    it("devrait permettre un transfert après le lock", async function () {
      expect(await pokemonCards.isLocked(0)).to.be.false;
      
      await pokemonCards.connect(user1).transferFrom(user1.address, user2.address, 0);
      
      expect(await pokemonCards.ownerOf(0)).to.equal(user2.address);
      expect(await pokemonCards.getOwnedCount(user1.address)).to.equal(0);
      expect(await pokemonCards.getOwnedCount(user2.address)).to.equal(1);
    });

    it("devrait mettre à jour previousOwners après transfert", async function () {
      await pokemonCards.connect(user1).transferFrom(user1.address, user2.address, 0);
      
      const previousOwners = await pokemonCards.getPreviousOwners(0);
      expect(previousOwners).to.have.lengthOf(1);
      expect(previousOwners[0]).to.equal(user1.address);
    });

    it("devrait verrouiller à nouveau après transfert", async function () {
      await pokemonCards.connect(user1).transferFrom(user1.address, user2.address, 0);
      expect(await pokemonCards.isLocked(0)).to.be.true;
    });

    it("devrait revert si le destinataire atteint la limite", async function () {
      // User2 minte 4 cartes
      for (let i = 1; i <= 4; i++) {
        await pokemonCards.connect(user2).mint(i, 1, 100, `ipfs://test${i}`);
      }

      // Transfer depuis user1 vers user2 devrait échouer
      await expect(
        pokemonCards.connect(user1).transferFrom(user1.address, user2.address, 0)
      ).to.be.revertedWithCustomError(pokemonCards, "MaxCardsReached");
    });
  });

  describe("TradeMarket Authorization", function () {
    it("devrait permettre à l'owner de définir tradeMarket", async function () {
      const mockTradeMarket = user2.address;
      await pokemonCards.connect(owner).setTradeMarket(mockTradeMarket);
      expect(await pokemonCards.tradeMarket()).to.equal(mockTradeMarket);
    });

    it("devrait revert si non-owner essaie de définir tradeMarket", async function () {
      await expect(
        pokemonCards.connect(user1).setTradeMarket(user2.address)
      ).to.be.revertedWithCustomError(pokemonCards, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases", function () {
    it("devrait gérer plusieurs mints dans la même transaction", async function () {
      const tx1 = pokemonCards.connect(user1).mint(1, 1, 100, "ipfs://test1");
      const tx2 = pokemonCards.connect(user1).mint(2, 1, 100, "ipfs://test2");
      
      await Promise.all([tx1, tx2]);
      
      expect(await pokemonCards.getOwnedCount(user1.address)).to.equal(2);
    });

    it("devrait incrémenter correctement les token IDs", async function () {
      await pokemonCards.connect(user1).mint(1, 1, 100, "ipfs://test1");
      await pokemonCards.connect(user2).mint(2, 1, 100, "ipfs://test2");
      await pokemonCards.connect(user1).mint(3, 1, 100, "ipfs://test3");

      expect(await pokemonCards.ownerOf(0)).to.equal(user1.address);
      expect(await pokemonCards.ownerOf(1)).to.equal(user2.address);
      expect(await pokemonCards.ownerOf(2)).to.equal(user1.address);
    });
  });
});
