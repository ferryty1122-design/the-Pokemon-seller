import { useMemo } from "react";
import { Auction } from "../types";
import { Crown, Gavel, Flame, Trophy } from "lucide-react";

interface StatsBarProps {
  auctions: Auction[];
}

export default function StatsBar({ auctions }: StatsBarProps) {
  const stats = useMemo(() => {
    const total = auctions.length;
    const now = new Date();
    
    const active = auctions.filter(a => new Date(a.endTime) > now).length;
    const ended = total - active;
    
    const highestActiveBid = auctions.reduce((max, a) => {
      const isActive = new Date(a.endTime) > now;
      if (isActive && a.currentBid > max) {
        return a.currentBid;
      }
      return max;
    }, 0);

    return { total, active, ended, highestActiveBid };
  }, [auctions]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="stats-section">
      {/* Total Auctions */}
      <div className="p-4 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 flex items-center gap-4 shadow-sm transition-all hover:border-violet-500/20">
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
          <Gavel className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="text-2xl font-extrabold tracking-tight text-white">{stats.total}</div>
          <div className="text-xs text-slate-400 font-medium">การประมูลทั้งหมด</div>
        </div>
      </div>

      {/* Active Auctions */}
      <div className="p-4 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 flex items-center gap-4 shadow-sm transition-all hover:border-emerald-500/20">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
          <Flame className="w-6 h-6 text-emerald-400 animate-bounce" style={{ animationDuration: '3s' }} />
        </div>
        <div>
          <div className="text-2xl font-extrabold tracking-tight text-emerald-400">{stats.active}</div>
          <div className="text-xs text-slate-400 font-medium">กำลังดำเนินการ</div>
        </div>
      </div>

      {/* Highest Active Current Bid */}
      <div className="p-4 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 flex items-center gap-4 shadow-sm transition-all hover:border-amber-500/20">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
          <Crown className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-extrabold tracking-tight text-amber-400">
            ฿{stats.highestActiveBid.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 font-medium">ราคาสูงสุดขณะนี้</div>
        </div>
      </div>

      {/* Ended Auctions */}
      <div className="p-4 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-white/5 flex items-center gap-4 shadow-sm transition-all hover:border-cyan-500/20">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
          <Trophy className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <div className="text-2xl font-extrabold tracking-tight text-cyan-400">{stats.ended}</div>
          <div className="text-xs text-slate-400 font-medium font-sans">จบการประมูลแล้ว</div>
        </div>
      </div>
    </div>
  );
}
