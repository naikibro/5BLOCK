import { expect } from "chai";
import { ethers } from "hardhat";
import { PokemonCards, TradeMarket } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("TradeMarket", function () {
  let pokemonCards: PokemonCards;
  let tradeMarket: TradeMarket;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const LOCK_DURATION = 10 * 60; // 10 minutes
  const COOLDOWN_DURATION = 5 * 60; // 5 minutes

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy PokemonCards
    const PokemonCardsFactory = await ethers.getContractFactory("PokemonCards");
    pokemonCards = await PokemonCardsFactory.deploy();
    await pokemonCards.waitForDeployment();

    // Deploy TradeMarket
    const TradeMarketFactory = await ethers.getContractFactory("TradeMarket");
    tradeMarket = await TradeMarketFactory.deploy(await pokemonCards.getAddress());
    await tradeMarket.waitForDeployment();

    // Set TradeMarket as authorized in PokemonCards
    await pokemonCards.setTradeMarket(await tradeMarket.getAddress());
  });

  describe("createOffer", function () {
    beforeEach(async function () {
      // Mint cards for testing
      // User1 mints Pikachu (#25)
      await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://pikachu");
      
      // User2 mints Charizard (#6)
      await pokemonCards.connect(user2).mint(6, 4, 534, "ipfs://charizard");

      // Wait for lock to expire (10 minutes)
      await time.increase(LOCK_DURATION + 1);
    });

    it("should create offer successfully", async function () {
      const makerTokenId = 0; // Pikachu (user1's card)
      const takerTokenId = 1; // Charizard (user2's card)

      // Create offer
      const tx = await tradeMarket.connect(user1).createOffer(makerTokenId, takerTokenId);
      
      // Verify event emission
      await expect(tx)
        .to.emit(tradeMarket, "TradeCreated")
        .withArgs(0, user1.address, makerTokenId, takerTokenId);

      // Verify offer details
      const offer = await tradeMarket.getOffer(0);
      expect(offer.maker).to.equal(user1.address);
      expect(offer.makerTokenId).to.equal(makerTokenId);
      expect(offer.takerTokenId).to.equal(takerTokenId);
      expect(offer.status).to.equal(0); // Open
    });

    it("should revert if card is locked", async function () {
      // Mint a new card (will be locked)
      await pokemonCards.connect(user1).mint(1, 1, 143, "ipfs://bulbasaur");
      const lockedTokenId = 2;

      // Attempt to create offer with locked card
      await expect(
        tradeMarket.connect(user1).createOffer(lockedTokenId, 1)
      ).to.be.revertedWithCustomError(tradeMarket, "CardIsLocked");
    });

    it("should revert if cooldown is active", async function () {
      const makerTokenId = 0;
      const takerTokenId = 1;

      // Create first offer
      await tradeMarket.connect(user1).createOffer(makerTokenId, takerTokenId);

      // Cancel the offer to free up the card
      await time.increase(COOLDOWN_DURATION + 1);
      await tradeMarket.connect(user1).cancelOffer(0);

      // Try to create another offer immediately (cooldown should be active)
      await expect(
        tradeMarket.connect(user1).createOffer(makerTokenId, takerTokenId)
      ).to.be.revertedWithCustomError(tradeMarket, "CooldownActive");
    });

    it("should revert if not card owner", async function () {
      const makerTokenId = 0; // Belongs to user1
      const takerTokenId = 1;

      // User2 tries to create offer with user1's card
      await expect(
        tradeMarket.connect(user2).createOffer(makerTokenId, takerTokenId)
      ).to.be.revertedWithCustomError(tradeMarket, "NotTokenOwner");
    });

    it("should revert if requested token does not exist", async function () {
      const makerTokenId = 0;
      const nonExistentTokenId = 999;

      // Try to create offer requesting non-existent token
      await expect(
        tradeMarket.connect(user1).createOffer(makerTokenId, nonExistentTokenId)
      ).to.be.revertedWithCustomError(tradeMarket, "TokenDoesNotExist");
    });

    it("should allow creating multiple offers after cooldown expires", async function () {
      // User1 mints another card
      await pokemonCards.connect(user1).mint(4, 2, 175, "ipfs://charmander");
      await time.increase(LOCK_DURATION + 1);

      // Create first offer
      await tradeMarket.connect(user1).createOffer(0, 1);

      // Wait for cooldown
      await time.increase(COOLDOWN_DURATION + 1);

      // Create second offer
      const tx = await tradeMarket.connect(user1).createOffer(2, 1);
      await expect(tx)
        .to.emit(tradeMarket, "TradeCreated")
        .withArgs(1, user1.address, 2, 1);
    });
  });

  describe("getCooldownRemaining", function () {
    beforeEach(async function () {
      // Mint cards
      await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://pikachu");
      await pokemonCards.connect(user2).mint(6, 4, 534, "ipfs://charizard");
      await time.increase(LOCK_DURATION + 1);
    });

    it("should return 0 when no cooldown is active", async function () {
      const remaining = await tradeMarket.getCooldownRemaining(user1.address);
      expect(remaining).to.equal(0);
    });

    it("should return correct remaining time after action", async function () {
      // Create offer to trigger cooldown
      await tradeMarket.connect(user1).createOffer(0, 1);

      // Check cooldown immediately
      const remaining = await tradeMarket.getCooldownRemaining(user1.address);
      expect(remaining).to.be.closeTo(COOLDOWN_DURATION, 5); // Allow 5 second tolerance
    });

    it("should decrease cooldown over time", async function () {
      // Create offer
      await tradeMarket.connect(user1).createOffer(0, 1);

      // Wait 2 minutes
      await time.increase(2 * 60);

      // Check cooldown
      const remaining = await tradeMarket.getCooldownRemaining(user1.address);
      expect(remaining).to.be.closeTo(COOLDOWN_DURATION - 2 * 60, 5);
    });

    it("should return 0 after cooldown expires", async function () {
      // Create offer
      await tradeMarket.connect(user1).createOffer(0, 1);

      // Wait for cooldown to expire
      await time.increase(COOLDOWN_DURATION + 1);

      // Check cooldown
      const remaining = await tradeMarket.getCooldownRemaining(user1.address);
      expect(remaining).to.equal(0);
    });
  });

  describe("getOpenOffers", function () {
    it("should return empty array when no offers exist", async function () {
      const openOffers = await tradeMarket.getOpenOffers();
      expect(openOffers.length).to.equal(0);
    });

    it("should return open offers", async function () {
      // Mint cards
      await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://pikachu");
      await pokemonCards.connect(user2).mint(6, 4, 534, "ipfs://charizard");
      await time.increase(LOCK_DURATION + 1);

      // Create offer
      await tradeMarket.connect(user1).createOffer(0, 1);

      // Get open offers
      const openOffers = await tradeMarket.getOpenOffers();
      expect(openOffers.length).to.equal(1);
      expect(openOffers[0]).to.equal(0);
    });

    it("should not return cancelled offers", async function () {
      // Mint cards
      await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://pikachu");
      await pokemonCards.connect(user2).mint(6, 4, 534, "ipfs://charizard");
      await time.increase(LOCK_DURATION + 1);

      // Create and cancel offer
      await tradeMarket.connect(user1).createOffer(0, 1);
      await time.increase(COOLDOWN_DURATION + 1);
      await tradeMarket.connect(user1).cancelOffer(0);

      // Get open offers
      const openOffers = await tradeMarket.getOpenOffers();
      expect(openOffers.length).to.equal(0);
    });
  });

  describe("getOffersByMaker", function () {
    beforeEach(async function () {
      // Mint cards
      await pokemonCards.connect(user1).mint(25, 3, 130, "ipfs://pikachu");
      await pokemonCards.connect(user1).mint(4, 2, 175, "ipfs://charmander");
      await pokemonCards.connect(user2).mint(6, 4, 534, "ipfs://charizard");
      await time.increase(LOCK_DURATION + 1);
    });

    it("should return empty array when user has no offers", async function () {
      const offers = await tradeMarket.getOffersByMaker(user1.address);
      expect(offers.length).to.equal(0);
    });

    it("should return all offers by maker", async function () {
      // Create two offers from user1
      await tradeMarket.connect(user1).createOffer(0, 2);
      await time.increase(COOLDOWN_DURATION + 1);
      await tradeMarket.connect(user1).createOffer(1, 2);

      // Get offers by user1
      const offers = await tradeMarket.getOffersByMaker(user1.address);
      expect(offers.length).to.equal(2);
      expect(offers[0]).to.equal(0);
      expect(offers[1]).to.equal(1);
    });

    it("should include cancelled offers in results", async function () {
      // Create and cancel offer
      await tradeMarket.connect(user1).createOffer(0, 2);
      await time.increase(COOLDOWN_DURATION + 1);
      await tradeMarket.connect(user1).cancelOffer(0);

      // Get offers (should still include cancelled)
      const offers = await tradeMarket.getOffersByMaker(user1.address);
      expect(offers.length).to.equal(1);
    });
  });
});
