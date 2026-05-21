import React, { useEffect, useState } from "react";
import { Auction, CardType, CardRarity, CardCondition } from "../types";
import { PlusCircle, Edit3, X } from "lucide-react";

interface AuctionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Record<string, any>) => void;
  editingAuction?: Auction | null;
}

export default function AuctionFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingAuction
}: AuctionFormModalProps) {
  const [cardName, setCardName] = useState<string>("");
  const [cardType, setCardType] = useState<CardType>("Fire");
  const [cardRarity, setCardRarity] = useState<CardRarity>("SAR");
  const [cardCondition, setCardCondition] = useState<CardCondition>("PSA10");
  const [startPrice, setStartPrice] = useState<number>(0);
  const [buyoutPrice, setBuyoutPrice] = useState<number>(0);
  const [endTime, setEndTime] = useState<string>("");

  // Populate data when editing
  useEffect(() => {
    if (editingAuction) {
      setCardName(editingAuction.cardName);
      setCardType(editingAuction.type);
      setCardRarity(editingAuction.rarity);
      setCardCondition(editingAuction.condition);
      setStartPrice(editingAuction.startPrice);
      setBuyoutPrice(editingAuction.buyoutPrice);
      
      const tzOffset = new Date(editingAuction.endTime).getTimezoneOffset() * 60000;
      const localISO = new Date(new Date(editingAuction.endTime).getTime() - tzOffset).toISOString().slice(0, 16);
      setEndTime(localISO);
    } else {
      // Setup future date as default ending timestamp (e.g., exactly 24 hours in the future)
      setCardName("");
      setCardType("Fire");
      setCardRarity("SAR");
      setCardCondition("PSA10");
      setStartPrice(100);
      setBuyoutPrice(0);

      const defaultEnd = new Date();
      defaultEnd.setHours(defaultEnd.getHours() + 24);
      const tzOffset = defaultEnd.getTimezoneOffset() * 60000;
      const localISO = new Date(defaultEnd.getTime() - tzOffset).toISOString().slice(0, 16);
      setEndTime(localISO);
    }
  }, [editingAuction, isOpen]);

  // Form submit intercept
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ─── Frontend Validation Checks ───
    if (!cardName.trim()) {
      alert("กรุณาระบุชื่อการ์ดโปรแกรมอน");
      return;
    }

    if (startPrice <= 0) {
      alert("ราคาเริ่มต้นต้องมีค่ามากกว่า 0 บาท");
      return;
    }

    if (buyoutPrice > 0 && buyoutPrice <= startPrice) {
      alert("ราคาซื้อด่วน (Buy Now) ต้องมีราคาสูงกว่าราคาตั้งต้นประมูล!");
      return;
    }

    const parsedEndTime = new Date(endTime);
    if (parsedEndTime <= new Date()) {
      alert("เวลาสิ้นสุดการประมูลต้องเป็นเวลาในอนาคตเท่านั้น!");
      return;
    }

    /* 
      📢 อธิบายการทำงานตามที่ชุดคำสั่งระบุ:
      ในส่วนนี้เราจะนำข้อมูลทั้งหมดจาก State ของฟอร์ม React ประกอบกลับไปเป็น
      ข้อมูล Object เพื่อทำความสะอาดและพร้อมจะทำการแปลงรูปเป็น JSON (ด้วย JSON.stringify) 
      และนำไปยิง Fetch ไปยังเครื่องเซิร์ฟเวอร์ Backend (GET, POST, PUT, DELETE) 
    */
    onSubmit({
      cardName: cardName.trim(),
      type: cardType,
      rarity: cardRarity,
      condition: cardCondition,
      startPrice,
      buyoutPrice: buyoutPrice || 0,
      endTime: parsedEndTime.toISOString() // แปลงเป็น ISO String มาตรฐานสากล
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        
        {/* Close trigger button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Label header */}
        <div className="pb-3 border-b border-white/5 mb-4">
          <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
            {editingAuction ? <Edit3 className="w-5 h-5 text-indigo-400" /> : <PlusCircle className="w-5 h-5 text-emerald-400" />}
            {editingAuction ? "แก้ไขรายละเอียดการ์ดของท่าน" : "ลงขายการ์ดโปเกมอนใหม่"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            ระบุรายละเอียดใบประมูลเพื่อให้เหล่านักสะสมเข้ามาประชันราคาอย่างถ้วนหน้า
          </p>
        </div>

        {/* Body forms controls */}
        <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-slate-200">
          
          {/* Card name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">ชื่อการ์ดโปเกมอน *</label>
            <input
              type="text"
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="เช่น Charizard ex SAR (ลิซาดอนร่าง 3)"
              className="w-full px-3.5 py-2 bg-slate-950/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-100 placeholder-slate-600 transition"
            />
          </div>

          {/* Cards attributes type / rarity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">ธาตุ / ประเภทธาตุ *</label>
              <select
                value={cardType}
                onChange={(e) => setCardType(e.target.value as CardType)}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-200"
              >
                <option value="Grass">Grass 🌿</option>
                <option value="Fire">Fire 🔥</option>
                <option value="Water">Water 💧</option>
                <option value="Electric">Electric ⚡</option>
                <option value="Psychic">Psychic 🔮</option>
                <option value="Colorless">Colorless ⭐</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">ระดับความหายาก *</label>
              <select
                value={cardRarity}
                onChange={(e) => setCardRarity(e.target.value as CardRarity)}
                className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-200"
              >
                <option value="SAR">SAR (Special Art Rare)</option>
                <option value="UR">UR (Ultra Rare)</option>
                <option value="AR">AR (Art Rare)</option>
                <option value="SR">SR (Super Rare)</option>
              </select>
            </div>
          </div>

          {/* Condition options details */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">สภาพการ์ด (Condition) *</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2.5 p-3 bg-slate-950/60 border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition">
                <input
                  type="radio"
                  name="cardCondition"
                  value="PSA10"
                  checked={cardCondition === "PSA10"}
                  onChange={() => setCardCondition("PSA10")}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-xs text-slate-200">PSA 10 (Gem Mint)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-slate-950/60 border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition">
                <input
                  type="radio"
                  name="cardCondition"
                  value="NM"
                  checked={cardCondition === "NM"}
                  onChange={() => setCardCondition("NM")}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-xs text-slate-200">Near Mint (ใกล้สวย)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-slate-950/60 border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition">
                <input
                  type="radio"
                  name="cardCondition"
                  value="LP"
                  checked={cardCondition === "LP"}
                  onChange={() => setCardCondition("LP")}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-xs text-slate-200">Lightly Played (รอยเบา)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-slate-950/60 border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition">
                <input
                  type="radio"
                  name="cardCondition"
                  value="MP"
                  checked={cardCondition === "MP"}
                  onChange={() => setCardCondition("MP")}
                  className="w-4 h-4 accent-indigo-500"
                />
                <span className="text-xs text-slate-200">Moderately Played (ตำหนิ)</span>
              </label>
            </div>
          </div>

          {/* Pricing fields input */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1.5">ราคาเริ่มต้น (บาท) *</label>
              <input
                type="number"
                required
                min={1}
                value={startPrice || ""}
                onChange={(e) => setStartPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 bg-slate-950/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-100 placeholder-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-cyan-400 mb-1.5">ราคาซื้อด่วน (Buy Now)</label>
              <input
                type="number"
                min={0}
                placeholder="ระบุ 0 หรือเว้นว่างหากไม่มี"
                value={buyoutPrice || ""}
                onChange={(e) => setBuyoutPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 bg-slate-950/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-100 placeholder-slate-700"
              />
            </div>
          </div>

          {/* Countdown Limit Picker form */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">กำหนดเวลาสิ้นสุดประมูลสากล *</label>
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950/90 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-200"
            />
          </div>

          {/* Confirm panel panel layout */}
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
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-500/10"
            >
              บันทึกข้อมูลและลงขาย
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
