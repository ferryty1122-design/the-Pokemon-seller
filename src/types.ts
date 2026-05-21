/**
 * Type declarations for the Pokémon TCG Auction System (PokéBid).
 */

export type CardType = "Grass" | "Fire" | "Water" | "Electric" | "Psychic" | "Colorless";
export type CardRarity = "SAR" | "UR" | "AR" | "SR";
export type CardCondition = "PSA10" | "NM" | "LP" | "MP";

export interface Auction {
  id: string;
  cardName: string;
  type: CardType;
  rarity: CardRarity;
  condition: CardCondition;
  startPrice: number;
  currentBid: number;
  buyoutPrice: number;
  bidCount: number;
  lastBidder: string | null;
  endTime: string;
  createdAt: string;
}

export interface BiddingRequest {
  bidAmount: number;
}
