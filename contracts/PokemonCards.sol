// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PokemonCards
 * @author 5BLOCK Team
 * @notice ERC721 token representing Pokémon trading cards
 * @dev Implements ownership limits, transfer locks, and provenance tracking
 */
contract PokemonCards is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    // ==================== Constants ====================
    
    /// @notice Maximum number of cards a wallet can own
    uint256 public constant MAX_CARDS_PER_WALLET = 4;
    
    /// @notice Duration a card is locked after acquisition (10 minutes)
    uint256 public constant LOCK_DURATION = 10 minutes;
    
    /// @notice Maximum valid Pokémon ID (Gen 1)
    uint256 public constant MAX_POKEMON_ID = 151;
    
    /// @notice Minimum valid Pokémon ID
    uint256 public constant MIN_POKEMON_ID = 1;

    // ==================== Structures ====================
    
    /**
     * @notice Metadata stored on-chain for each card
     * @param createdAt Timestamp when the card was minted
     * @param lastTransferAt Timestamp of the last transfer
     * @param lockUntil Timestamp until which the card cannot be traded
     * @param pokemonId PokeAPI ID (1-151)
     * @param rarityTier Rarity level (1=Common, 2=Uncommon, 3=Rare, 4=Legendary)
     * @param value Calculated value (HP + Attack + Defense)
     */
    struct CardMeta {
        uint256 createdAt;
        uint256 lastTransferAt;
        uint256 lockUntil;
        uint256 pokemonId;
        uint8 rarityTier;
        uint256 value;
    }

    // ==================== State Variables ====================
    
    /// @notice Counter for generating unique token IDs
    uint256 private _nextTokenId;
    
    /// @notice Mapping from token ID to card metadata
    mapping(uint256 => CardMeta) private _cards;
    
    /// @notice Mapping from token ID to list of previous owners
    mapping(uint256 => address[]) private _previousOwners;
    
    /// @notice Mapping from address to number of cards owned
    mapping(address => uint256) private _ownedCount;
    
    /// @notice Address of the TradeMarket contract (authorized for transfers)
    address public tradeMarket;
    
    /// @notice Track which Pokémon have been minted (enforces 1 per Pokémon)
    mapping(uint256 => bool) private _pokemonMinted;

    // ==================== Events ====================
    
    /**
     * @notice Emitted when a new card is minted
     * @param owner Address receiving the card
     * @param tokenId Unique identifier of the card
     * @param pokemonId PokeAPI ID of the Pokémon
     * @param rarityTier Rarity tier of the card
     */
    event CardMinted(
        address indexed owner,
        uint256 indexed tokenId,
        uint256 pokemonId,
        uint8 rarityTier
    );
    
    /**
     * @notice Emitted when a card is transferred
     * @param tokenId Unique identifier of the card
     * @param from Previous owner
     * @param to New owner
     */
    event CardTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to
    );
    
    /**
     * @notice Emitted when a card's lock period is set/updated
     * @param tokenId Unique identifier of the card
     * @param until Timestamp until which the card is locked
     */
    event CardLocked(
        uint256 indexed tokenId,
        uint256 until
    );

    // ==================== Errors ====================
    
    /// @notice Thrown when trying to mint/receive beyond the 4-card limit
    error MaxCardsReached(address wallet, uint256 current);
    
    /// @notice Thrown when pokemonId is outside valid range (1-151)
    error InvalidPokemonId(uint256 pokemonId);
    
    /// @notice Thrown when trying to mint a Pokémon that was already minted
    error PokemonAlreadyMinted(uint256 pokemonId);
    
    /// @notice Thrown when trying to trade a locked card
    error CardIsLocked(uint256 tokenId, uint256 lockUntil);
    
    /// @notice Thrown when querying a non-existent token
    error TokenNotFound(uint256 tokenId);
    
    /// @notice Thrown when caller is not authorized
    error NotAuthorized(address caller);

    // ==================== Modifiers ====================
    
    /**
     * @notice Ensures the recipient won't exceed the card limit
     * @param to Address receiving the card
     */
    modifier checkLimit(address to) {
        if (_ownedCount[to] >= MAX_CARDS_PER_WALLET) {
            revert MaxCardsReached(to, _ownedCount[to]);
        }
        _;
    }
    
    /**
     * @notice Ensures the card is not locked
     * @param tokenId Token to check
     */
    modifier notLocked(uint256 tokenId) {
        if (block.timestamp < _cards[tokenId].lockUntil) {
            revert CardIsLocked(tokenId, _cards[tokenId].lockUntil);
        }
        _;
    }

    // ==================== Constructor ====================
    
    /**
     * @notice Initializes the contract with name and symbol
     */
    constructor() ERC721("PokemonCards", "PKMN") Ownable(msg.sender) {}

    // ==================== External Functions ====================
    
    /**
     * @notice Mints a new Pokémon card
     * @dev Caller must have fewer than 4 cards. Card is locked for 10 minutes.
     * @param pokemonId PokeAPI ID (1-151)
     * @param rarityTier Rarity tier (1-4)
     * @param value Calculated value
     * @param uri IPFS URI for metadata
     * @return tokenId The ID of the newly minted token
     */
    function mint(
        uint256 pokemonId,
        uint8 rarityTier,
        uint256 value,
        string calldata uri
    ) external checkLimit(msg.sender) returns (uint256 tokenId) {
        // Validate pokemonId
        if (pokemonId < MIN_POKEMON_ID || pokemonId > MAX_POKEMON_ID) {
            revert InvalidPokemonId(pokemonId);
        }
        
        // Check if this Pokémon has already been minted (enforces uniqueness!)
        if (_pokemonMinted[pokemonId]) {
            revert PokemonAlreadyMinted(pokemonId);
        }
        
        // Mark this Pokémon as minted
        _pokemonMinted[pokemonId] = true;
        
        // Generate token ID
        tokenId = _nextTokenId++;
        
        // Store metadata
        _cards[tokenId] = CardMeta({
            createdAt: block.timestamp,
            lastTransferAt: block.timestamp,
            lockUntil: block.timestamp + LOCK_DURATION,
            pokemonId: pokemonId,
            rarityTier: rarityTier,
            value: value
        });
        
        // Mint token
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Update count
        _ownedCount[msg.sender]++;
        
        emit CardMinted(msg.sender, tokenId, pokemonId, rarityTier);
        emit CardLocked(tokenId, block.timestamp + LOCK_DURATION);
    }
    
    /**
     * @notice Sets the authorized TradeMarket contract address
     * @dev Only owner can call. Required for TradeMarket to transfer cards.
     * @param _tradeMarket Address of the TradeMarket contract
     */
    function setTradeMarket(address _tradeMarket) external onlyOwner {
        tradeMarket = _tradeMarket;
    }

    // ==================== View Functions ====================
    
    /**
     * @notice Check if a Pokémon has already been minted
     * @param pokemonId The Pokémon ID to check (1-151)
     * @return True if this Pokémon has been minted, false otherwise
     */
    function isPokemonMinted(uint256 pokemonId) external view returns (bool) {
        return _pokemonMinted[pokemonId];
    }
    
    /**
     * @notice Returns the metadata for a card
     * @param tokenId Token to query
     * @return CardMeta struct with all metadata
     */
    function getCardMeta(uint256 tokenId) external view returns (CardMeta memory) {
        if (!_exists(tokenId)) revert TokenNotFound(tokenId);
        return _cards[tokenId];
    }
    
    /**
     * @notice Returns the list of previous owners for a card
     * @param tokenId Token to query
     * @return Array of addresses
     */
    function getPreviousOwners(uint256 tokenId) external view returns (address[] memory) {
        if (!_exists(tokenId)) revert TokenNotFound(tokenId);
        return _previousOwners[tokenId];
    }
    
    /**
     * @notice Checks if a card is currently locked
     * @param tokenId Token to check
     * @return True if locked, false otherwise
     */
    function isLocked(uint256 tokenId) external view returns (bool) {
        return block.timestamp < _cards[tokenId].lockUntil;
    }
    
    /**
     * @notice Returns the lock end timestamp for a card
     * @param tokenId Token to query
     * @return Timestamp when lock expires
     */
    function getLockUntil(uint256 tokenId) external view returns (uint256) {
        return _cards[tokenId].lockUntil;
    }
    
    /**
     * @notice Returns the number of cards owned by an address
     * @param owner Address to query
     * @return Number of cards
     */
    function getOwnedCount(address owner) external view returns (uint256) {
        return _ownedCount[owner];
    }
    
    /**
     * @notice Checks if token exists
     * @param tokenId Token to check
     * @return True if exists
     */
    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    // ==================== Internal Functions ====================
    
    /**
     * @notice Internal existence check
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
    
    /**
     * @notice Hook called before any token transfer
     * @dev Updates ownership counts, previous owners, and lock status
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address from) {
        from = _ownerOf(tokenId);
        
        // Skip for mints (from == address(0))
        if (from != address(0)) {
            // Check recipient limit
            if (to != address(0) && _ownedCount[to] >= MAX_CARDS_PER_WALLET) {
                revert MaxCardsReached(to, _ownedCount[to]);
            }
            
            // Update previous owners
            _previousOwners[tokenId].push(from);
            
            // Update metadata
            _cards[tokenId].lastTransferAt = block.timestamp;
            _cards[tokenId].lockUntil = block.timestamp + LOCK_DURATION;
            
            // Update counts
            _ownedCount[from]--;
            if (to != address(0)) {
                _ownedCount[to]++;
            }
            
            emit CardTransferred(tokenId, from, to);
            emit CardLocked(tokenId, _cards[tokenId].lockUntil);
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @notice Override required by Solidity for multiple inheritance
     */
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    /**
     * @notice Override required by Solidity for multiple inheritance
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @notice Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
