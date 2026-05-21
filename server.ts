import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Auction, CardType, CardRarity, CardCondition } from "./src/types";

// Setup our storage file to persist across server development cycles
const DB_FILE_PATH = path.join(process.cwd(), "auctions-db.json");

const DEFAULT_AUCTIONS: Auction[] = [
  {
    id: "pk-101",
    cardName: "Charizard ex SAR (ลิซาดอน)",
    type: "Fire",
    rarity: "SAR",
    condition: "PSA10",
    startPrice: 2500,
    currentBid: 5600,
    buyoutPrice: 15000,
    bidCount: 14,
    lastBidder: "TrainerRed",
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 3.5).toISOString(), // Ends in 3.5 hours
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: "pk-102",
    cardName: "Pikachu AR (พิคาชู)",
    type: "Electric",
    rarity: "AR",
    condition: "NM",
    startPrice: 1200,
    currentBid: 1800,
    buyoutPrice: 3500,
    bidCount: 5,
    lastBidder: "AshKetchum",
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 18.2).toISOString(), // Ends in 18.2 hours
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: "pk-103",
    cardName: "Mew ex UR (มิว)",
    type: "Psychic",
    rarity: "UR",
    condition: "PSA10",
    startPrice: 3000,
    currentBid: 3000,
    buyoutPrice: 7500,
    bidCount: 0,
    lastBidder: null,
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(), // Ends in 25 hours
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: "pk-104",
    cardName: "Gyarados Base Set SR (เกียราดอส)",
    type: "Water",
    rarity: "SR",
    condition: "LP",
    startPrice: 800,
    currentBid: 950,
    buyoutPrice: 2000,
    bidCount: 2,
    lastBidder: "Misty_Water_Gym",
    endTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // Ended 10 mins ago
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  }
];

// Helper to read database
function readDatabase(): Auction[] {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (error) {
    console.error("Error reading db file, falling back to seed structure:", error);
  }
  return DEFAULT_AUCTIONS;
}

// Helper to write database
function writeDatabase(data: Auction[]) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing db file:", error);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Global parsing middleware
  app.use(express.json());

  // Log incoming API calls
  app.use((req, res, next) => {
    console.log(`[API] ${req.method} ${req.url}`);
    next();
  });

  // 1. GET /api/auctions - Retrieve all auction listings
  app.get("/api/auctions", (req, res) => {
    const data = readDatabase();
    res.json(data);
  });

  // 2. POST /api/auctions - Put a new card for auction
  app.post("/api/auctions", (req, res) => {
    try {
      const { cardName, type, rarity, condition, startPrice, buyoutPrice, endTime } = req.body;

      // Backend verification
      if (!cardName || !type || !rarity || !condition || startPrice === undefined || !endTime) {
        return res.status(400).json({ error: "โปรดระบุข้อมูลที่จำเป็นให้ครบถ้วน" });
      }

      const parsedStartPrice = Number(startPrice);
      const parsedBuyoutPrice = Number(buyoutPrice || 0);

      if (parsedStartPrice <= 0) {
        return res.status(400).json({ error: "ราคาเริ่มต้นต้องมากกว่า 0 บาท" });
      }

      if (parsedBuyoutPrice > 0 && parsedBuyoutPrice <= parsedStartPrice) {
        return res.status(400).json({ error: "ราคาซื้อทันที (Buy Now) ต้องมีค่ามากกว่าราคาเริ่มต้น" });
      }

      const parsedEndTime = new Date(endTime);
      if (isNaN(parsedEndTime.getTime()) || parsedEndTime <= new Date()) {
        return res.status(400).json({ error: "เวลาสิ้นสุดการประมูลต้องเป็นเวลาในอนาคตเท่านั้น" });
      }

      const data = readDatabase();
      
      const newAuction: Auction = {
        id: "pk-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 10),
        cardName: String(cardName).trim(),
        type: type as CardType,
        rarity: rarity as CardRarity,
        condition: condition as CardCondition,
        startPrice: parsedStartPrice,
        currentBid: parsedStartPrice, // starting bid is start price
        buyoutPrice: parsedBuyoutPrice,
        bidCount: 0,
        lastBidder: null,
        endTime: parsedEndTime.toISOString(),
        createdAt: new Date().toISOString()
      };

      data.unshift(newAuction);
      writeDatabase(data);

      res.status(201).json(newAuction);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    }
  });

  // 3. PUT /api/auctions/:id - Edit an auction listing (strictly validated to prevent editing if bids were placed)
  app.put("/api/auctions/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { cardName, type, rarity, condition, startPrice, buyoutPrice, endTime } = req.body;

      const data = readDatabase();
      const index = data.findIndex(a => a.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "ไม่พบรายการประมูลที่ต้องการแก้ไข" });
      }

      const currentAuction = data[index];

      // Safeguard: Reject editing of cards which already has active bids placed.
      if (currentAuction.bidCount > 0) {
        return res.status(400).json({ error: "ไม่สามารถแก้ไขรายการประมูลที่เริ่มมีการสู้ราคาไปแล้วได้ เพื่อความยุติธรรมของระบบ" });
      }

      const parsedStartPrice = Number(startPrice);
      const parsedBuyoutPrice = Number(buyoutPrice || 0);

      if (parsedStartPrice <= 0) {
        return res.status(400).json({ error: "ราคาเริ่มต้นต้องมากกว่า 0 บาท" });
      }

      if (parsedBuyoutPrice > 0 && parsedBuyoutPrice <= parsedStartPrice) {
        return res.status(400).json({ error: "ราคาซื้อทันที (Buy Now) ต้องมีค่ามากกว่าราคาเริ่มต้น" });
      }

      const parsedEndTime = new Date(endTime);
      if (isNaN(parsedEndTime.getTime()) || parsedEndTime <= new Date()) {
        return res.status(400).json({ error: "เวลาสิ้นสุดการประมูลต้องเป็นเวลาในอนาคตเท่านั้น" });
      }

      // Update fields
      data[index] = {
        ...currentAuction,
        cardName: String(cardName).trim(),
        type: type as CardType,
        rarity: rarity as CardRarity,
        condition: condition as CardCondition,
        startPrice: parsedStartPrice,
        currentBid: parsedStartPrice, // Restart current bid as starting price
        buyoutPrice: parsedBuyoutPrice,
        endTime: parsedEndTime.toISOString()
      };

      writeDatabase(data);
      res.json(data[index]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล" });
    }
  });

  // 4. DELETE /api/auctions/:id - Delete an auction listing (only if no bids exist)
  app.delete("/api/auctions/:id", (req, res) => {
    try {
      const { id } = req.params;
      const data = readDatabase();
      const target = data.find(a => a.id === id);

      if (!target) {
        return res.status(404).json({ error: "ไม่พบรายการประมูลที่ต้องการลบ" });
      }

      // Safeguard: Prevent deleting with live participation
      if (target.bidCount > 0) {
        return res.status(400).json({ error: "ไม่สามารถลบรายการประมูลที่เริ่มเสนอราคาไปแล้วได้" });
      }

      const filtered = data.filter(a => a.id !== id);
      writeDatabase(filtered);

      res.json({ success: true, message: "ลบประกาศประมูลเรียบร้อยแล้ว" });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการลบข้อมูล" });
    }
  });

  // 5. POST /api/auctions/:id/bid - Place a bid on a live card
  app.post("/api/auctions/:id/bid", (req, res) => {
    try {
      const { id } = req.params;
      const { bidAmount, bidderName } = req.body;

      const data = readDatabase();
      const index = data.findIndex(a => a.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "ไม่พบรายการประมูลนี้" });
      }

      const auction = data[index];
      const now = new Date();

      if (new Date(auction.endTime) <= now) {
        return res.status(400).json({ error: "ไม่สามารถประมูลได้เนื่องจากหมดเวลาประมูลแล้ว" });
      }

      const parsedBidAmount = Number(bidAmount);
      if (isNaN(parsedBidAmount)) {
        return res.status(400).json({ error: "รูปแบบจำนวนเงินประมูลไม่ถูกต้อง" });
      }

      // Bid increment rules: Bid must be strictly higher than the current bid + 5% or 50 THB increment
      const minIncrement = Math.max(50, Math.round(auction.currentBid * 0.05));
      const requiredBid = auction.currentBid + minIncrement;

      if (parsedBidAmount < requiredBid) {
        return res.status(400).json({ 
          error: `จำนวนเงินเสนอราคาต้องสะกดไม่ต่ำกว่า ฿${requiredBid.toLocaleString()} (ราคาปัจจุบัน ฿${auction.currentBid.toLocaleString()} + ขั้นต่ำ ฿${minIncrement.toLocaleString()})`
        });
      }

      // Record bidder name (or generate random trainer if none is provided)
      const trainerPool = ["MasterRed", "LanceChamp", "Misty_Water", "GaryOak", "CynthiaSinnoh", "StevenStone", "TrainerLeaf"];
      const resolvedBidder = bidderName ? String(bidderName).trim() : trainerPool[Math.floor(Math.random() * trainerPool.length)];

      data[index] = {
        ...auction,
        currentBid: parsedBidAmount,
        bidCount: auction.bidCount + 1,
        lastBidder: resolvedBidder
      };

      writeDatabase(data);
      res.json(data[index]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการเพิ่มยอดประมูล" });
    }
  });

  // 6. POST /api/auctions/:id/buyout - Instantly buyout and terminate the auction
  app.post("/api/auctions/:id/buyout", (req, res) => {
    try {
      const { id } = req.params;
      const { bidderName } = req.body;
      
      const data = readDatabase();
      const index = data.findIndex(a => a.id === id);

      if (index === -1) {
        return res.status(404).json({ error: "ไม่พบรายการประมูลนี้" });
      }

      const auction = data[index];
      const now = new Date();

      if (new Date(auction.endTime) <= now) {
        return res.status(400).json({ error: "ไม่สามารถดำเนินการได้เนื่องจากสิ้นสุดการประมูลไปแล้ว" });
      }

      if (!auction.buyoutPrice || auction.buyoutPrice <= 0) {
        return res.status(400).json({ error: "การ์ดใบนี้ไม่ได้เปิดราคาซื้อทันทีไว้" });
      }

      const resolvedBidder = bidderName ? String(bidderName).trim() : "Premium_Collector_⚡";

      // Finalize auction immediately: Set bid amount to buyout price and set endTime to now
      data[index] = {
        ...auction,
        currentBid: auction.buyoutPrice,
        bidCount: auction.bidCount + 1,
        lastBidder: resolvedBidder + " (ซื้อทันที)",
        endTime: new Date().toISOString()
      };

      writeDatabase(data);
      res.json(data[index]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "เกิดข้อผิดพลาดในการทำรายการซื้อทันที" });
    }
  });

  // 7. POST /api/auctions/reset - Reset Database to original hardcoded PokéBid cards
  app.post("/api/auctions/reset", (req, res) => {
    try {
      // Regenerate dynamic timestamps for the default auctions so timers are real
      const freshSeed: Auction[] = [
        {
          id: "pk-101",
          cardName: "Charizard ex SAR (ลิซาดอน)",
          type: "Fire",
          rarity: "SAR",
          condition: "PSA10",
          startPrice: 2500,
          currentBid: 5600,
          buyoutPrice: 15000,
          bidCount: 14,
          lastBidder: "TrainerRed",
          endTime: new Date(Date.now() + 1000 * 60 * 60 * 3.5).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
        },
        {
          id: "pk-102",
          cardName: "Pikachu AR (พิคาชู)",
          type: "Electric",
          rarity: "AR",
          condition: "NM",
          startPrice: 1200,
          currentBid: 1800,
          buyoutPrice: 3500,
          bidCount: 5,
          lastBidder: "AshKetchum",
          endTime: new Date(Date.now() + 1000 * 60 * 60 * 18.2).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
        },
        {
          id: "pk-103",
          cardName: "Mew ex UR (มิว)",
          type: "Psychic",
          rarity: "UR",
          condition: "PSA10",
          startPrice: 3000,
          currentBid: 3000,
          buyoutPrice: 7500,
          bidCount: 0,
          lastBidder: null,
          endTime: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
        },
        {
          id: "pk-104",
          cardName: "Gyarados Base Set SR (เกียราดอส)",
          type: "Water",
          rarity: "SR",
          condition: "LP",
          startPrice: 800,
          currentBid: 950,
          buyoutPrice: 2000,
          bidCount: 2,
          lastBidder: "Misty_Water_Gym",
          endTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
        }
      ];

      writeDatabase(freshSeed);
      res.json({ success: true, count: freshSeed.length });
    } catch (err: any) {
      res.status(500).json({ error: "ไม่สามารถรีเซ็ตข้อมูลได้" });
    }
  });


  // VITE DEV / PROD ASSET SERVING MIDDLEWARE
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PokéBid Server] running beautifully on http://0.0.0.0:${PORT}`);
  });
}

startServer();
