import { SlidersHorizontal, Search } from "lucide-react";

interface FilterSectionProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedType: string;
  onTypeChange: (val: string) => void;
  selectedRarity: string;
  onRarityChange: (val: string) => void;
  selectedCondition: string;
  onConditionChange: (val: string) => void;
  sortBy: string;
  onSortByChange: (val: string) => void;
}

export default function FilterSection({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedRarity,
  onRarityChange,
  selectedCondition,
  onConditionChange,
  sortBy,
  onSortByChange
}: FilterSectionProps) {
  return (
    <section className="p-5 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 space-y-4 shadow-xl">
      {/* Label and Section Title */}
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
        <h2 className="font-bold text-lg text-slate-200">ค้นหาและกรองการ์ดชั้นสูง</h2>
      </div>

      {/* Grid container with beautiful inputs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search TextBox */}
        <div className="relative md:col-span-4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="พิมพ์ค้นหาชื่อการ์ดโปเกมอน..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:outline-none text-slate-100 placeholder-slate-500 transition-all font-sans"
          />
        </div>

        {/* Dropdown element type */}
        <div className="md:col-span-2">
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:outline-none text-slate-200 transition-all font-sans cursor-pointer"
          >
            <option value="ALL">ทุกธาตุ / ประเภท</option>
            <option value="Grass">Grass 🌿</option>
            <option value="Fire">Fire 🔥</option>
            <option value="Water">Water 💧</option>
            <option value="Electric">Electric ⚡</option>
            <option value="Psychic">Psychic 🔮</option>
            <option value="Colorless">Colorless ⭐</option>
          </select>
        </div>

        {/* Dropdown Rarity */}
        <div className="md:col-span-2">
          <select
            value={selectedRarity}
            onChange={(e) => onRarityChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:outline-none text-slate-200 transition-all font-sans cursor-pointer"
          >
            <option value="ALL">ทุกความหายาก</option>
            <option value="SAR">SAR (Special Art Rare)</option>
            <option value="UR">UR (Ultra Rare)</option>
            <option value="AR">AR (Art Rare)</option>
            <option value="SR">SR (Super Rare)</option>
          </select>
        </div>

        {/* Dropdown Card condition */}
        <div className="md:col-span-2">
          <select
            value={selectedCondition}
            onChange={(e) => onConditionChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:outline-none text-slate-200 transition-all font-sans cursor-pointer"
          >
            <option value="ALL">ทุกสภาพการ์ด</option>
            <option value="PSA10">PSA 10 (Gem Mint)</option>
            <option value="NM">Near Mint (ใกล้สวย)</option>
            <option value="LP">Lightly Played (มีตำหนิบดบาง)</option>
            <option value="MP">Moderately Played (มีแผลชัด)</option>
          </select>
        </div>

        {/* Filters Sorting engine */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-950/80 border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent focus:outline-none text-slate-200 transition-all font-sans cursor-pointer"
          >
            <option value="TIME_ASC">เวลาเหลือน้อยสุดก่อน</option>
            <option value="PRICE_DESC">ราคาสูงสุดก่อน</option>
            <option value="PRICE_ASC">ราคาต่ำสุดก่อน</option>
            <option value="NEWEST">ลงขายล่าสุด</option>
          </select>
        </div>

      </div>
    </section>
  );
}
