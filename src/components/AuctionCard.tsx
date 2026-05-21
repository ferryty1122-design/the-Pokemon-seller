import React, { useEffect, useState } from "react";
import { Auction } from "../types";
import { Gavel, Star, Trash2, Edit3, Shield, Clock, HelpCircle } from "lucide-react";

interface AuctionCardProps {
  auction: Auction;
  onBidClick: (auction: Auction) => void;
  onBuyoutClick: (auction: Auction) => any;
  onEditClick: (auction: Auction) => void;
  onDeleteClick: (id: string) => any;
}

const conditionLabelMap: Record<string, string> = {
  PSA10: "PSA 10 (Gem Mint)",
  NM: "Near Mint (สภาพดี)",
  LP: "Lightly Played (มีรอยบาง)",
  MP: "Moderately Played (ตำหนิ)"
};

// Return a styled element vector visual with beautiful colors based on element element type
const getCardGraphic = (type: string, cardName: string) => {
  let colorFrom = "from-indigo-600";
  let colorTo = "to-indigo-950/90";
  let symbol = "⭐";
  let glowStyle = "shadow-indigo-500/20";

  switch (type) {
    case "Fire":
      colorFrom = "from-amber-500";
      colorTo = "to-red-950/90";
      symbol = "🔥";
      glowStyle = "group-hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]";
      break;
    case "Water":
      colorFrom = "from-blue-500";
      colorTo = "to-sky-950/90";
      symbol = "💧";
      glowStyle = "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]";
      break;
    case "Electric":
      colorFrom = "from-yellow-400";
      colorTo = "to-amber-950/90";
      symbol = "⚡";
      glowStyle = "group-hover:shadow-[0_0_20px_rgba(234,179,8,0.4)]";
      break;
    case "Grass":
      colorFrom = "from-emerald-500";
      colorTo = "to-green-950/90";
      symbol = "🌿";
      glowStyle = "group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]";
      break;
    case "Psychic":
      colorFrom = "from-fuchsia-500";
      colorTo = "to-purple-950/90";
      symbol = "🔮";
      glowStyle = "group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]";
      break;
    default:
      colorFrom = "from-slate-400";
      colorTo = "to-slate-900/95";
      symbol = "⭐";
      glowStyle = "group-hover:shadow-[0_0_20px_rgba(148,163,184,0.2)]";
  }

  return (
    <div className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-b ${colorFrom} ${colorTo} flex flex-col justify-between p-3 border border-white/10 shadow-lg transition-transform duration-500 group-hover:scale-103 ${glowStyle}`}>
      {/* Sparkles background effect for collectible charm */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none" 
        style={{
          backgroundImage: "radial-gradient(white 1px, transparent 1px)",
          backgroundSize: "10px 10px"
        }}
      />
      
      {/* HP Title details */}
      <div className="flex justify-between items-center z-10">
        <span className="text-[10px] tracking-widest font-black uppercase text-white bg-black/40 px-1.5 py-0.5 rounded backdrop-blur border border-white/5">
          COLLECTIBLE
        </span>
        <span className="text-sm bg-black/30 w-6 h-6 rounded-full flex items-center justify-center filter drop-shadow">
          {symbol}
        </span>
      </div>
      
      {/* Holographic Center Art */}
      <div className="flex-1 my-2 rounded-lg bg-black/35 border border-white/5 flex flex-col items-center justify-center relative p-2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 via-purple-500/10 to-transparent mix-blend-overlay" />
        <div className="text-5xl filter drop-shadow-[0_5px_12px_rgba(0,0,0,0.6)] transform group-hover:rotate-6 group-hover:scale-110 transition duration-500">
          {symbol}
        </div>
        <div className="text-[10px] mt-2 font-mono text-slate-300 text-center uppercase tracking-tighter truncate max-w-full">
          {cardName.split(' ')[0] || "POKEMON"}
        </div>
      </div>

      <div className="z-10 flex justify-between items-end">
        <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-tight italic select-none">
          PokéBid Edition
        </span>
        <div className="flex gap-0.5 text-[8px]">
          <Star className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
          <Star className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
          <Star className="w-2.5 h-2.5 fill-yellow-300 text-yellow-300" />
        </div>
      </div>
    </div>
  );
};

export default function AuctionCard({
  auction,
  onBidClick,
  onBuyoutClick,
  onEditClick,
  onDeleteClick
}: AuctionCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("กำลังคำนวณ...");
  const [isEnded, setIsEnded] = useState<boolean>(false);

  // Re-run timer logic on custom interval
  useEffect(() => {
    const calculateTime = () => {
      const endTime = new Date(auction.endTime);
      const now = new Date();
      const distance = endTime.getTime() - now.getTime();

      if (distance <= 0) {
        setTimeLeft("การประมูลสิ้นสุดแล้ว");
        setIsEnded(true);
      } else {
        setIsEnded(false);
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        let resultStr = "";
        if (days > 0) resultStr += `${days}วัน `;
        resultStr += `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        setTimeLeft(resultStr);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [auction.endTime]);

  // Styling custom rarity colors
  let rarityBadgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
  if (auction.rarity === "SAR") {
    rarityBadgeColor = "bg-rose-500/15 text-rose-400 border-rose-500/30";
  } else if (auction.rarity === "UR") {
    rarityBadgeColor = "bg-amber-500/15 text-amber-400 border-amber-500/30";
  } else if (auction.rarity === "AR") {
    rarityBadgeColor = "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
  }

  // Safety edit permissions rule
  const canManage = auction.bidCount === 0;

  return (
    <div className={`glass-card rounded-2xl p-4 flex flex-col justify-between hover:border-violet-500/30 shadow-md transition-all duration-300 group reflect-card ${isEnded ? "opacity-75" : ""}`} id={`auction-card-${auction.id}`}>
      
      {/* Render Artwork Vector Cover */}
      <div className="mb-4">
        {getCardGraphic(auction.type, auction.cardName)}
      </div>

      {/* Rarity + Info stats */}
      <div className="space-y-3">
        <div>
          <h4 className="font-extrabold text-base text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1" title={auction.cardName}>
            {auction.cardName}
          </h4>
        </div>

        {/* Categories labels */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase ${rarityBadgeColor}`}>
            {auction.rarity}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
            {conditionLabelMap[auction.condition] || auction.condition}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-indigo-400 border border-slate-800">
            {auction.type}
          </span>
        </div>

        {/* Pricing specs */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-end">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">ราคาปัจจุบัน</span>
            <span className="text-xl font-black text-amber-400">
              ฿{auction.currentBid.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">{auction.bidCount} ครั้งเสนอราคา</span>
            {auction.lastBidder ? (
              <span className="text-xs font-semibold text-slate-300 block truncate max-w-[110px]" title={`@${auction.lastBidder}`}>
                @{auction.lastBidder}
              </span>
            ) : (
              <span className="text-xs text-slate-500 block">ไร้คู่แข่ง</span>
            )}
          </div>
        </div>

        {/* Buyout instant price details */}
        <div className="text-xs">
          {auction.buyoutPrice > 0 ? (
            <span className="text-slate-400">
              ซื้อทันที (Buy Now): <span className="text-cyan-400 font-extrabold">฿{auction.buyoutPrice.toLocaleString()}</span>
            </span>
          ) : (
            <span className="text-slate-500 italic">ไม่มีราคาซื้อทันที</span>
          )}
        </div>

        {/* Real-time Counter status bar */}
        <div className="py-1.5 px-3 rounded-xl bg-slate-900/80 flex items-center justify-between border border-white/5 shadow-inner">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-400" /> เวลาที่เหลือ:
          </span>
          <span className={`font-mono text-xs font-extrabold tracking-tight ${isEnded ? "text-red-500" : "text-emerald-400 animate-pulse"}`}>
            {timeLeft}
          </span>
        </div>

        {/* CRUD Manager bar (Only visible if security conditions passed) */}
        {canManage ? (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEditClick(auction)}
              className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center justify-center gap-1.5"
              title="แก้ไขรายละเอียดการ์ดชิ้นนี้ (ใช้ได้ตอนไม่มียอดประมูลเสนอเข้ามา)"
            >
              <Edit3 className="w-3.5 h-3.5" /> แก้ไข
            </button>
            <button
              onClick={() => onDeleteClick(auction.id)}
              className="flex-1 py-1.5 bg-slate-800/40 hover:bg-red-950/80 text-slate-400 hover:text-red-400 text-xs font-semibold rounded-lg border border-slate-800 hover:border-red-900/50 transition flex items-center justify-center gap-1.5"
              title="ถอนประกาศประมูลนี้"
            >
              <Trash2 className="w-3.5 h-3.5" /> ลบออก
            </button>
          </div>
        ) : (
          <div className="py-1 bg-slate-900/40 text-slate-500 text-[10px] font-sans text-center rounded-lg border border-slate-900 flex items-center justify-center gap-1 select-none">
            <Shield className="w-3 h-3 text-slate-500" /> ข้อมูลถูกล็อก (เริ่มสู้ราคาแล้ว)
          </div>
        )}

        {/* Action Controls for End User */}
        <div className="pt-1.5">
          {isEnded ? (
            <div className="w-full py-2.5 bg-slate-800 text-slate-400 text-center rounded-xl font-bold text-xs border border-white/5 select-none hover:bg-slate-750">
              🏆 จบประมูลแล้ว ({auction.lastBidder ? `ผู้ชนะ: ${auction.lastBidder}` : "ไม่มีผู้ประมูล"})
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onBidClick(auction)}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-97 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-2"
              >
                <Gavel className="w-4 h-4 fill-slate-950" /> ร่วมเสนอราคา
              </button>
              {auction.buyoutPrice > 0 && (
                <button
                  onClick={() => onBuyoutClick(auction)}
                  className="px-3.5 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:scale-97 text-white font-extrabold text-sm rounded-xl transition-all flex items-center justify-center shadow-md shadow-cyan-500/10"
                  title="ซิื้อทันทีใบนี้ด่วน (Buy Now)"
                >
                  ชิงซื้อ
                </button>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
