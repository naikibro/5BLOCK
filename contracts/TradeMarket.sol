// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PokemonCards.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TradeMarket
 * @author 5BLOCK Team
 * @notice Marketplace for trading Pokémon cards with cooldown and lock mechanisms
 * @dev Manages trade offers and executes atomic swaps
 */
contract TradeMarket is ReentrancyGuard {
    // ==================== Constants ====================
    
    /// @notice Duration between allowed trade actions for a wallet
    uint256 public constant COOLDOWN_DURATION = 5 minutes;

    // ==================== Structures ====================
    
    /// @notice Status of a trade offer
    enum OfferStatus {
        Open,       // Offer is active and can be accepted
        Cancelled,  // Offer was cancelled by maker
        Accepted    // Offer was accepted and trade completed
    }

    /// @notice Data structure for a trade offer
    /// @param maker Address that created the offer
    /// @param makerTokenId Token offered by maker
    /// @param takerTokenId Token requested from taker
    /// @param status Current status of the offer
    /// @param createdAt Timestamp when offer was created
    struct Offer {
        address maker;
        uint256 makerTokenId;
        uint256 takerTokenId;
        OfferStatus status;
        uint256 createdAt;
    }

    // ==================== State Variables ====================
    
    /// @notice Reference to the PokemonCards contract
    PokemonCards public immutable pokemonCards;

    /// @notice Counter for generating unique offer IDs
    uint256 private _nextOfferId;

    /// @notice Mapping from offer ID to offer data
    mapping(uint256 => Offer) private _offers;

    /// @notice Mapping from address to last action timestamp (for cooldown)
    mapping(address => uint256) private _lastActionAt;

    // ==================== Events ====================
    
    /**
     * @notice Emitted when a new trade offer is created
     * @param offerId Unique identifier of the offer
     * @param maker Address that created the offer
     * @param makerTokenId Token offered
     * @param takerTokenId Token requested
     */
    event TradeCreated(
        uint256 indexed offerId,
        address indexed maker,
        uint256 makerTokenId,
        uint256 takerTokenId
    );

    /**
     * @notice Emitted when a trade offer is accepted
     * @param offerId Unique identifier of the offer
     * @param taker Address that accepted the offer
     * @param maker Address that created the offer
     */
    event TradeAccepted(
        uint256 indexed offerId,
        address indexed taker,
        address indexed maker
    );

    /**
     * @notice Emitted when a trade offer is cancelled
     * @param offerId Unique identifier of the offer
     */
    event TradeCancelled(
        uint256 indexed offerId
    );

    // ==================== Errors ====================
    
    /// @notice Thrown when action is attempted before cooldown expires
    error CooldownActive(address wallet, uint256 remainingTime);

    /// @notice Thrown when trying to trade a locked card
    error CardIsLocked(uint256 tokenId);

    /// @notice Thrown when caller doesn't own the specified token
    error NotTokenOwner(address caller, uint256 tokenId);

    /// @notice Thrown when offer is not in Open status
    error OfferNotOpen(uint256 offerId, OfferStatus currentStatus);

    /// @notice Thrown when caller is not the offer maker
    error NotOfferMaker(address caller, address maker);

    /// @notice Thrown when maker no longer owns their token
    error MakerNoLongerOwnsToken(uint256 tokenId);

    /// @notice Thrown when querying non-existent offer
    error OfferNotFound(uint256 offerId);

    /// @notice Thrown when requested token doesn't exist
    error TokenDoesNotExist(uint256 tokenId);

    // ==================== Modifiers ====================
    
    /**
     * @notice Ensures cooldown period has passed for caller
     * @dev Updates last action timestamp after successful check
     */
    modifier checkCooldown() {
        uint256 timeSinceLastAction = block.timestamp - _lastActionAt[msg.sender];
        if (timeSinceLastAction < COOLDOWN_DURATION) {
            revert CooldownActive(msg.sender, COOLDOWN_DURATION - timeSinceLastAction);
        }
        _;
        _lastActionAt[msg.sender] = block.timestamp;
    }

    /**
     * @notice Ensures the specified card is not locked
     * @param tokenId Token to check
     */
    modifier cardNotLocked(uint256 tokenId) {
        if (pokemonCards.isLocked(tokenId)) {
            revert CardIsLocked(tokenId);
        }
        _;
    }

    // ==================== Constructor ====================
    
    /**
     * @notice Initializes the contract with the PokemonCards address
     * @param _pokemonCards Address of the PokemonCards contract
     */
    constructor(address _pokemonCards) {
        pokemonCards = PokemonCards(_pokemonCards);
    }

    // ==================== External Functions ====================
    
    /**
     * @notice Creates a new trade offer
     * @dev Caller must own makerTokenId, card must not be locked, cooldown must have passed
     * @param makerTokenId Token the caller is offering
     * @param takerTokenId Token the caller wants in return
     * @return offerId The ID of the newly created offer
     */
    function createOffer(
        uint256 makerTokenId,
        uint256 takerTokenId
    ) external checkCooldown cardNotLocked(makerTokenId) returns (uint256 offerId) {
        // Verify caller owns the token
        if (pokemonCards.ownerOf(makerTokenId) != msg.sender) {
            revert NotTokenOwner(msg.sender, makerTokenId);
        }

        // Verify requested token exists
        if (!pokemonCards.exists(takerTokenId)) {
            revert TokenDoesNotExist(takerTokenId);
        }

        // Create offer
        offerId = _nextOfferId++;
        _offers[offerId] = Offer({
            maker: msg.sender,
            makerTokenId: makerTokenId,
            takerTokenId: takerTokenId,
            status: OfferStatus.Open,
            createdAt: block.timestamp
        });

        emit TradeCreated(offerId, msg.sender, makerTokenId, takerTokenId);
    }

    /**
     * @notice Cancels an existing offer
     * @dev Only the maker can cancel. Cooldown applies.
     * @param offerId ID of the offer to cancel
     */
    function cancelOffer(uint256 offerId) external checkCooldown {
        Offer storage offer = _offers[offerId];

        // Verify offer exists
        if (offer.maker == address(0)) {
            revert OfferNotFound(offerId);
        }

        // Verify caller is maker
        if (offer.maker != msg.sender) {
            revert NotOfferMaker(msg.sender, offer.maker);
        }

        // Verify offer is open
        if (offer.status != OfferStatus.Open) {
            revert OfferNotOpen(offerId, offer.status);
        }

        // Cancel offer
        offer.status = OfferStatus.Cancelled;

        emit TradeCancelled(offerId);
    }

    /**
     * @notice Accepts an existing offer and executes the swap
     * @dev Caller must own takerTokenId. Both cards must not be locked. Cooldown applies.
     * @param offerId ID of the offer to accept
     */
    function acceptOffer(uint256 offerId) external nonReentrant checkCooldown {
        Offer storage offer = _offers[offerId];

        // Verify offer exists
        if (offer.maker == address(0)) {
            revert OfferNotFound(offerId);
        }

        // Verify offer is open
        if (offer.status != OfferStatus.Open) {
            revert OfferNotOpen(offerId, offer.status);
        }

        // Verify maker still owns their token
        if (pokemonCards.ownerOf(offer.makerTokenId) != offer.maker) {
            revert MakerNoLongerOwnsToken(offer.makerTokenId);
        }

        // Verify caller owns the requested token
        if (pokemonCards.ownerOf(offer.takerTokenId) != msg.sender) {
            revert NotTokenOwner(msg.sender, offer.takerTokenId);
        }

        // Verify both cards are not locked
        if (pokemonCards.isLocked(offer.makerTokenId)) {
            revert CardIsLocked(offer.makerTokenId);
        }
        if (pokemonCards.isLocked(offer.takerTokenId)) {
            revert CardIsLocked(offer.takerTokenId);
        }

        // Execute atomic swap
        // Transfer maker's card to taker
        pokemonCards.transferFrom(offer.maker, msg.sender, offer.makerTokenId);
        
        // Transfer taker's card to maker
        pokemonCards.transferFrom(msg.sender, offer.maker, offer.takerTokenId);

        // Update offer status
        offer.status = OfferStatus.Accepted;

        // Update cooldown for both parties
        _lastActionAt[offer.maker] = block.timestamp;

        emit TradeAccepted(offerId, msg.sender, offer.maker);
    }

    // ==================== View Functions ====================
    
    /**
     * @notice Returns offer details
     * @param offerId ID of the offer to query
     * @return Offer struct with all details
     */
    function getOffer(uint256 offerId) external view returns (Offer memory) {
        if (_offers[offerId].maker == address(0)) {
            revert OfferNotFound(offerId);
        }
        return _offers[offerId];
    }

    /**
     * @notice Returns the remaining cooldown time for an address
     * @param wallet Address to check
     * @return Remaining seconds until cooldown expires (0 if no cooldown)
     */
    function getCooldownRemaining(address wallet) external view returns (uint256) {
        uint256 timeSinceLastAction = block.timestamp - _lastActionAt[wallet];
        if (timeSinceLastAction >= COOLDOWN_DURATION) {
            return 0;
        }
        return COOLDOWN_DURATION - timeSinceLastAction;
    }

    /**
     * @notice Returns all open offers
     * @dev This is gas-intensive for large datasets. Consider pagination in production.
     * @return Array of offer IDs with Open status
     */
    function getOpenOffers() external view returns (uint256[] memory) {
        // Count open offers
        uint256 openCount = 0;
        for (uint256 i = 0; i < _nextOfferId; i++) {
            if (_offers[i].status == OfferStatus.Open) {
                openCount++;
            }
        }

        // Create array and populate
        uint256[] memory openOfferIds = new uint256[](openCount);
        uint256 index = 0;
        for (uint256 i = 0; i < _nextOfferId; i++) {
            if (_offers[i].status == OfferStatus.Open) {
                openOfferIds[index++] = i;
            }
        }

        return openOfferIds;
    }

    /**
     * @notice Returns all offers created by a specific address
     * @param maker Address to query
     * @return Array of offer IDs created by the maker
     */
    function getOffersByMaker(address maker) external view returns (uint256[] memory) {
        // Count maker's offers
        uint256 makerCount = 0;
        for (uint256 i = 0; i < _nextOfferId; i++) {
            if (_offers[i].maker == maker) {
                makerCount++;
            }
        }

        // Create array and populate
        uint256[] memory makerOfferIds = new uint256[](makerCount);
        uint256 index = 0;
        for (uint256 i = 0; i < _nextOfferId; i++) {
            if (_offers[i].maker == maker) {
                makerOfferIds[index++] = i;
            }
        }

        return makerOfferIds;
    }

    /**
     * @notice Returns the total number of offers created
     * @return Total offer count
     */
    function getTotalOffers() external view returns (uint256) {
        return _nextOfferId;
    }
}
