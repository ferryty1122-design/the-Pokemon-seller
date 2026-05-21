import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Auction } from "./types";
import StatsBar from "./components/StatsBar";
import FilterSection from "./components/FilterSection";
import AuctionCard from "./components/AuctionCard";
import AuctionFormModal from "./components/AuctionFormModal";
import BidModal from "./components/BidModal";
import { Sparkles, PlusCircle, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";

export default function App() {
  // State definitions
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warn" | "info" } | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedRarity, setSelectedRarity] = useState<string>("ALL");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("TIME_ASC");

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);

  const [isBidOpen, setIsBidOpen] = useState<boolean>(false);
  const [biddingAuction, setBiddingAuction] = useState<Auction | null>(null);

  // Trigger custom toast notification
  const showNotification = useCallback((message: string, type: "success" | "error" | "warn" | "info" = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  }, []);

  // Fetch all listings from server
  const loadAuctions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auctions");
      if (!res.ok) throw new Error("ดึงข้อมูลการประมูลล้มเหลว");
      const data = await res.json();
      setAuctions(data);
    } catch (err: any) {
      showNotification(err.message || "เกิดข้อผิดพลาดในการดึงข้อมูล", "error");
    } finally {
      setLoading(false);
    }
  };

  // Run on first load and periodically
  useEffect(() => {
    loadAuctions();
    const timer = setInterval(() => {
      // Quiet background refresh to keep prices synced
      fetch("/api/auctions")
        .then(res => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then(data => setAuctions(data))
        .catch(() => {});
    }, 10000);

    return () => clearInterval(timer);
  }, [showNotification]);

  // handle additions (POST) / updates (PUT)
  const handleFormSubmit = async (formData: Record<string, any>) => {
    try {
      if (editingAuction) {
        // PUT UPDATE
        const res = await fetch(`/api/auctions/${editingAuction.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "แก้ไขข้อมูลล้มเหลว");
        
        showNotification("อัปเดตรายละเอียดการประมูลสำเร็จเรียบร้อยแล้ว!", "success");
      } else {
        // POST CREATE
        const res = await fetch("/api/auctions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "สร้างประกาศล้มเหลว");

        showNotification("ลงประกาศประมูลการ์ดโปเกมอนแสนรักเรียบร้อยแล้ว!", "success");
      }
      
      setIsFormOpen(false);
      setEditingAuction(null);
      loadAuctions();
    } catch (err: any) {
      alert(err.message);
      showNotification(err.message, "error");
    }
  };

  // handle deletion (DELETE)
  const handleDeleteClick = async (id: string) => {
    const item = auctions.find(a => a.id === id);
    if (!item) return;

    if (item.bidCount > 0) {
      showNotification("ไม่สามารถลบใบประมูลที่มีการสู้ราคาแล้วได้ เพื่อความซื่อสัตย์ของระบบ!", "error");
      return;
    }

    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบและยกเลิกบัตรประมูล "${item.cardName}" แบบถาวร?`)) {
      try {
        const res = await fetch(`/api/auctions/${id}`, { method: "DELETE" });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "การลบล้มเหลว");

        showNotification("ลบประกาศประมูลเรียบร้อยแล้ว!", "success");
        loadAuctions();
      } catch (err: any) {
        showNotification(err.message, "error");
      }
    }
  };

  // handle buyout (POST to buyout)
  const handleBuyoutClick = async (auction: Auction) => {
    if (auction.buyoutPrice <= 0) return;

    if (window.confirm(`คุณยินยอมที่จะใช้สิทธิ์ซื้อทันทีการ์ด "${auction.cardName}" ในราคา ฿${auction.buyoutPrice.toLocaleString()} เลยใช่หรือไม่? ระบบจะทำการปิดประมูลให้ท่านทันที`)) {
      try {
        const res = await fetch(`/api/auctions/${auction.id}/buyout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bidderName: "VVIP_Collector" })
        });

        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || "ทำรายการซื้อทันทีล้มเหลว");

        showNotification(`แสดงความยินดีด้วย! คุณได้รับรางวัลการ์ดทันทีในสิทธิ์ ซื้อด่วน`, "success");
        loadAuctions();
      } catch (err: any) {
        showNotification(err.message, "error");
      }
    }
  };

  // handle bidding action (POST to bid)
  const handleBidSubmit = async (bidAmount: number, bidderName: string) => {
    if (!biddingAuction) return;

    try {
      const res = await fetch(`/api/auctions/${biddingAuction.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidAmount, bidderName })
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "เสนอราคาไม่สำเร็จ");

      showNotification(`คุณดันราคาสำเร็จที่ ฿${bidAmount.toLocaleString()} โดยชื่อ @${bidderName}!`, "success");
      setIsBidOpen(false);
      setBiddingAuction(null);
      loadAuctions();
    } catch (err: any) {
      alert(err.message);
      showNotification(err.message, "error");
    }
  };

  // Force seed data reset
  const handleDatabaseReset = async () => {
    if (window.confirm("คุณแน่ใจว่าต้องการล้างฐานข้อมูล และกลับไปใช้รายการการ์ดโปเกมอนเริ่มต้น (Seed Data) หรือไม่?")) {
      try {
        const res = await fetch("/api/auctions/reset", { method: "POST" });
        if (!res.ok) throw new Error("การรีเซ็ตฐานข้อมูลล้มเหลว");
        showNotification("รีเซ็ตระบบกลับเป็นฐานข้อมูลเริ่มต้นสำเร็จเรียบร้อยแล้ว!", "success");
        loadAuctions();
      } catch (err: any) {
        showNotification(err.message, "error");
      }
    }
  };

  const openAddModal = () => {
    setEditingAuction(null);
    setIsFormOpen(true);
  };

  const openEditModal = (auction: Auction) => {
    setEditingAuction(auction);
    setIsFormOpen(true);
  };

  const openBiddingModal = (auction: Auction) => {
    setBiddingAuction(auction);
    setIsBidOpen(true);
  };

  // Filter application algorithms
  const filteredAndSortedAuctions = useMemo(() => {
    let list = [...auctions];
    const query = searchQuery.toLowerCase().trim();

    // 1. Text Query Filter
    if (query) {
      list = list.filter(item => item.cardName.toLowerCase().includes(query));
    }

    // 2. Element Type Match Filter
    if (selectedType !== "ALL") {
      list = list.filter(item => item.type === selectedType);
    }

    // 3. Rarity Match Filter
    if (selectedRarity !== "ALL") {
      list = list.filter(item => item.rarity === selectedRarity);
    }

    // 4. Clean Condition Match Filter
    if (selectedCondition !== "ALL") {
      list = list.filter(item => item.condition === selectedCondition);
    }

    // 5. Apply Sorter
    if (sortBy === "TIME_ASC") {
      // Active goes before ended, then ascending endTime
      list.sort((a, b) => {
        const aEnded = new Date(a.endTime) < new Date();
        const bEnded = new Date(b.endTime) < new Date();
        if (aEnded && !bEnded) return 1;
        if (!aEnded && bEnded) return -1;
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      });
    } else if (sortBy === "PRICE_DESC") {
      list.sort((a, b) => b.currentBid - a.currentBid);
    } else if (sortBy === "PRICE_ASC") {
      list.sort((a, b) => a.currentBid - b.currentBid);
    } else if (sortBy === "NEWEST") {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [auctions, searchQuery, selectedType, selectedRarity, selectedCondition, sortBy]);

  return (
    <div className="relative min-h-screen p-3 md:p-6 text-slate-100 font-sans transition-all duration-300">
      
      {/* Absolute Overlays for Toast Notifiers */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-auto">
          <div className={`flex items-start gap-3.5 p-4 rounded-xl shadow-2xl backdrop-blur-md border-l-4 transition-all duration-300 transform translate-y-0 opacity-100 bg-slate-900/95 border-slate-800 ${
            toast.type === "success" ? "border-l-emerald-500 text-emerald-400" :
            toast.type === "error" ? "border-l-red-500 text-red-400" :
            toast.type === "warn" ? "border-l-amber-500 text-amber-400" :
            "border-l-cyan-500 text-cyan-400"
          }`}>
            <div className="flex-1 text-sm font-semibold pr-2 leading-relaxed">
              {toast.message}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* PREMIUM TITLE HEADER DISPLAY */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse fill-yellow-400/20" /> PokéBid
            </h1>
            <p className="text-slate-400 mt-1.5 text-xs md:text-sm font-medium">
              ศูนย์กลางการประมูลการ์ดสะสมโปเกมอนพรีเมียม (Pokémon TCG Interactive Full-Stack System)
            </p>
          </div>
          <div className="flex gap-2.5 w-full md:w-auto">
            <button
              onClick={openAddModal}
              className="flex-1 md:flex-none px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              id="add-card-trigger"
            >
              <PlusCircle className="w-4 h-4" /> ลงขายการ์ดของคุณ
            </button>
            <button
              onClick={handleDatabaseReset}
              className="px-4 py-3 bg-slate-900/80 hover:bg-slate-800/80 text-slate-300 hover:text-white font-medium rounded-xl border border-white/5 transition flex items-center justify-center"
              title="รีเซ็ตฐานข้อมูลเริ่มต้นใหม่"
              id="db-reset-trigger"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* METRICS STATS SUMMARY */}
        <StatsBar auctions={auctions} />

        {/* INPUT FILTERS CONTROLS */}
        <FilterSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedRarity={selectedRarity}
          onRarityChange={setSelectedRarity}
          selectedCondition={selectedCondition}
          onConditionChange={setSelectedCondition}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        {/* CENTRAL CATALOG LISTINGS GRID */}
        <main className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-lg font-extrabold flex items-center gap-2">
              <span className="w-2.5 h-6 bg-indigo-500 rounded-full" /> 
              การ์ดสะสมที่เปิดอยู่ในคลังประมูล
              <span className="text-xs bg-slate-900 text-slate-400 px-3 py-1 rounded-full border border-white/5 ml-1">
                {filteredAndSortedAuctions.length} ใบประมูล
              </span>
            </h3>
          </div>

          {loading && auctions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
              <p className="text-slate-400 text-sm">กำลังติดต่อเซิร์ฟเวอร์ และเปิดคลังการ์ดโปเกมอน...</p>
            </div>
          ) : filteredAndSortedAuctions.length === 0 ? (
            <div className="p-14 text-center bg-slate-900/20 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-slate-600 mb-4" />
              <h4 className="text-base font-bold text-slate-300">ไม่พบใบประมูลที่ตรงกับเงื่อนไขการกรองของท่าน</h4>
              <p className="text-slate-500 text-xs mt-1">ลองพิมพ์ชื่อค้นหาแบบอื่น หรือใช้วิธีล้างตัวกรองทั้งหมด</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("ALL");
                  setSelectedRarity("ALL");
                  setSelectedCondition("ALL");
                }}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
              >
                ล้างเครื่องมือกรองทั้งหมด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAndSortedAuctions.map(item => (
                <AuctionCard
                  key={item.id}
                  auction={item}
                  onBidClick={openBiddingModal}
                  onBuyoutClick={handleBuyoutClick}
                  onEditClick={openEditModal}
                  onDeleteClick={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* REACTIVE FORMS MODAL CONTROLLER */}
      {isFormOpen && (
        <AuctionFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingAuction(null);
          }}
          onSubmit={handleFormSubmit}
          editingAuction={editingAuction}
        />
      )}

      {/* REACTIVE BIDDING POPUP ACTION CONTROLLER */}
      {isBidOpen && (
        <BidModal
          isOpen={isBidOpen}
          onClose={() => {
            setIsBidOpen(false);
            setBiddingAuction(null);
          }}
          auction={biddingAuction}
          onSubmit={handleBidSubmit}
        />
      )}

    </div>
  );
}
