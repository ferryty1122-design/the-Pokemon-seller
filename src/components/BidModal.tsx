import React, { useState, useEffect } from "react";
import { Auction } from "../types";
import { Gavel, Star, X, User } from "lucide-react";

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  auction: Auction | null;
  onSubmit: (bidAmount: number, bidderName: string) => void;
}

export default function BidModal({ isOpen, onClose, auction, onSubmit }: BidModalProps) {
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidderName, setBidderName] = useState<string>(() => {
    return localStorage.getItem("pokebid_bidder_name") || "TrainerRed";
  });

  const [minRequired, setMinRequired] = useState<number>(0);
  const [minIncrement, setMinIncrement] = useState<number>(0);

  useEffect(() => {
    if (auction) {
      const inc = Math.max(50, Math.round(auction.currentBid * 0.05));
      const req = auction.currentBid + inc;
      setMinIncrement(inc);
      setMinRequired(req);
      setBidAmount(req);
    }
  }, [auction, isOpen]);

  if (!isOpen || !auction) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (bidAmount < minRequired) {
      alert(`จำนวนเงินเสนอราคาต้องไม่ต่ำกว่า ฿${minRequired.toLocaleString()}`);
      return;
    }

    const nameToSubmit = bidderName.trim() || "TrainerAnon";
    localStorage.setItem("pokebid_bidder_name", nameToSubmit);
    onSubmit(bidAmount, nameToSubmit);
  };

  const addQuickBid = (amt: number) => {
    setBidAmount(prev => prev + amt);
  };

  // Icon symbol and theme based on element type
  let typeColor = "bg-indigo-950/80 text-white";
  let sym = "⭐";
  if (auction.type === "Fire") {
    typeColor = "bg-red-950/80 text-amber-500 border-red-900/40";
    sym = "🔥";
  } else if (auction.type === "Water") {
    typeColor = "bg-blue-950/80 text-blue-400 border-blue-900/40";
    sym = "💧";
  } else if (auction.type === "Grass") {
    typeColor = "bg-green-950/80 text-emerald-400 border-green-900/40";
    sym = "🌿";
  } else if (auction.type === "Electric") {
    typeColor = "bg-yellow-950/80 text-yellow-400 border-yellow-900/40";
    sym = "⚡";
  } else if (auction.type === "Psychic") {
    typeColor = "bg-fuchsia-950/80 text-fuchsia-400 border-fuchsia-900/40";
    sym = "🔮";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="pb-3 border-b border-white/5 mb-4">
          <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-400 animate-pulse" /> ร่วมประมูลเสนอราคา
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            ระบุจำนวนเงินที่ท่านประสงค์จะใช้เพื่อสู้รับสิทธิ์ครอบครองการ์ดใบนี้
          </p>
        </div>

        {/* Card short info summary label */}
        <div className="flex items-center gap-4 p-3.5 bg-slate-950/60 border border-white/5 rounded-2xl mb-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border ${typeColor}`}>
            {sym}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-sm text-slate-100 truncate">{auction.cardName}</h4>
            <div className="flex gap-1.5 mt-1">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-900 text-purple-400 border border-purple-500/20 uppercase">
                {auction.rarity}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                {auction.condition}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic info breakdown */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/40 rounded-xl mb-4 border border-white/5">
          <div>
            <span className="text-[10px] text-slate-400 font-sans block uppercase">ราคาปัจจุบัน</span>
            <span className="text-2xl font-black text-amber-400">
              ฿{auction.currentBid.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 block font-semibold uppercase">เสนอขั้นต่ำใหม่</span>
            <span className="text-xl font-black text-emerald-400">
              ฿{minRequired.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Form panel body */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* Trainer / Name box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" /> ชื่อของคุณ (Trainer Username) *
            </label>
            <input
              type="text"
              required
              value={bidderName}
              onChange={(e) => setBidderName(e.target.value)}
              placeholder="เช่น TrainerRed / Sparky"
              className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-100 placeholder-slate-600 transition"
            />
          </div>

          {/* Bid Cash input element */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">ระบุยอดเสนอราคาของคุณ (บาท) *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-black text-base">
                ฿
              </span>
              <input
                type="number"
                required
                value={bidAmount || ""}
                min={minRequired}
                onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-white/10 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none text-slate-100 font-extrabold text-xl shadow-inner"
              />
            </div>
          </div>

          {/* Increments hotkeys button row */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => addQuickBid(100)}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-755 hover:text-white text-slate-300 rounded-lg text-xs font-bold border border-white/5 transition active:bg-slate-900"
            >
              + ฿100
            </button>
            <button
              type="button"
              onClick={() => addQuickBid(500)}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-755 hover:text-white text-slate-300 rounded-lg text-xs font-bold border border-white/5 transition active:bg-slate-900"
            >
              + ฿500
            </button>
            <button
              type="button"
              onClick={() => addQuickBid(1000)}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-755 hover:text-white text-slate-300 rounded-lg text-xs font-bold border border-white/5 transition active:bg-slate-900"
            >
              + ฿1,000
            </button>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-xl transition-all"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/10 active:scale-97"
            >
              ยืนยันการเสนอราคา
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
