"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, TrendingUp, Target, Award, AlertTriangle, Brain, Play, Trophy, Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import { Trade, TradeInput, EmotionalState } from "./lib/types"; // Will create types

// Enhanced types inline for self-contained complete app
interface Trade {
  id: string;
  pair: string;
  market: string;
  direction: "LONG" | "SHORT";
  entryTime: string;
  exitTime?: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskPercent: number;
  positionSize: number;
  leverage: number;
  session: string;
  setupType?: string;
  marketStructure?: string;
  liquidityConcepts?: string;
  confirmationModel?: string;
  timeframeAlignment?: string;
  biasReasoning?: string;
  confidenceLevel: number;
  emotionalState: EmotionalState;
  disciplineScore: number;
  fomoDetected: boolean;
  revengeTrade: boolean;
  patienceRating: number;
  pnl: number;
  rrAchieved: number;
  exitReason?: string;
  notes?: string;
  media?: string[]; // base64 images
  createdAt: string;
}

type EmotionalState = "CALM" | "FOCUSED" | "ANXIOUS" | "FOMO" | "REVENGE" | "OVERCONFIDENT" | "TIRED" | "DISTRACTED";

// Seed data
const seedTrades: Trade[] = [
  {
    id: "t1", pair: "XAUUSD", market: "COMMODITIES", direction: "LONG",
    entryTime: "2026-05-20T09:15:00Z", exitTime: "2026-05-20T11:45:00Z",
    entryPrice: 2384.5, stopLoss: 2378.2, takeProfit: 2397.8,
    riskPercent: 0.5, positionSize: 2.5, leverage: 30, session: "LONDON",
    setupType: "Order Block + FVG", marketStructure: "BOS + CHoCH",
    liquidityConcepts: "Equal Highs sweep", confirmationModel: "Candle close",
    timeframeAlignment: "15m structure | 5m entry", biasReasoning: "Bullish displacement after liquidity grab",
    confidenceLevel: 8, emotionalState: "FOCUSED", disciplineScore: 9,
    fomoDetected: false, revengeTrade: false, patienceRating: 8,
    pnl: 168.5, rrAchieved: 2.1, exitReason: "TP hit cleanly",
    notes: "Perfect execution.", media: [], createdAt: "2026-05-20T09:16:00Z"
  },
  {
    id: "t2", pair: "BTCUSDT", market: "CRYPTO", direction: "SHORT",
    entryTime: "2026-05-21T14:30:00Z", exitTime: "2026-05-21T16:10:00Z",
    entryPrice: 67240, stopLoss: 67580, takeProfit: 66500,
    riskPercent: 0.75, positionSize: 0.08, leverage: 20, session: "NEW_YORK",
    setupType: "Liquidity + FVG", marketStructure: "CHoCH into discount",
    liquidityConcepts: "NY low sweep", confirmationModel: "Strong rejection",
    timeframeAlignment: "5m entry", biasReasoning: "Bearish order flow after fakeout",
    confidenceLevel: 7, emotionalState: "CALM", disciplineScore: 8,
    fomoDetected: false, revengeTrade: false, patienceRating: 7,
    pnl: -42.3, rrAchieved: 0.8, exitReason: "SL hit - good risk management",
    notes: "Acceptable loss. Followed process.", media: [], createdAt: "2026-05-21T14:31:00Z"
  }
];

export default function TradeVaultFull() {
  const [trades, setTrades] = useState<Trade[]>(seedTrades);
  const [currentView, setCurrentView] = useState<"dashboard" | "log" | "analytics" | "coach" | "replay" | "gamification">("dashboard");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [replayTrade, setReplayTrade] = useState<Trade | null>(null);
  const [replayStep, setReplayStep] = useState(0);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem("tradevault_full_trades");
    if (saved) setTrades(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tradevault_full_trades", JSON.stringify(trades));
  }, [trades]);

  // Calculations
  const metrics = React.useMemo(() => {
    if (trades.length === 0) return { totalTrades: 0, winRate: 0, profitFactor: 0, expectancy: 0, currentStreak: 0, bestStreak: 0, maxDrawdown: 0, avgDiscipline: 0 };
    
    let wins = 0, totalWin = 0, totalLoss = 0, peak = 0, maxDD = 0, running = 0;
    let currentStreak = 0, bestStreak = 0;
    let lastWin: boolean | null = null;

    const sorted = [...trades].sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());

    sorted.forEach(t => {
      running += t.pnl;
      if (running > peak) peak = running;
      const dd = peak - running;
      if (dd > maxDD) maxDD = dd;

      if (t.pnl > 0) {
        wins++;
        totalWin += t.pnl;
        if (lastWin === true) currentStreak++; else currentStreak = 1;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
        lastWin = true;
      } else {
        totalLoss += Math.abs(t.pnl);
        if (lastWin === false) currentStreak++; else currentStreak = 1;
        lastWin = false;
      }
    });

    const winRate = (wins / trades.length) * 100;
    const profitFactor = totalLoss > 0 ? totalWin / totalLoss : totalWin > 0 ? 999 : 0;
    const avgWin = wins > 0 ? totalWin / wins : 0;
    const avgLoss = totalLoss > 0 ? totalLoss / (trades.length - wins) : 0;
    const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;
    const avgDiscipline = trades.reduce((sum, t) => sum + t.disciplineScore, 0) / trades.length;

    return {
      totalTrades: trades.length,
      winRate: Math.round(winRate * 10) / 10,
      profitFactor: Math.round(profitFactor * 100) / 100,
      expectancy: Math.round(expectancy * 100) / 100,
      currentStreak,
      bestStreak,
      maxDrawdown: Math.round(maxDD * 100) / 100,
      avgDiscipline: Math.round(avgDiscipline * 10) / 10
    };
  }, [trades]);

  // Equity curve data for Recharts
  const equityData = React.useMemo(() => {
    let running = 100000; // Starting capital demo
    return trades
      .sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime())
      .map((t, i) => {
        running += t.pnl;
        return { trade: i + 1, equity: Math.round(running) };
      });
  }, [trades]);

  // Add trade with media support
  const addTrade = (input: any) => {
    const newTrade: Trade = {
      ...input,
      id: "t" + Date.now(),
      createdAt: new Date().toISOString(),
      pnl: calculatePnL(input),
      rrAchieved: calculateRR(input),
      media: input.media || []
    };
    setTrades(prev => [newTrade, ...prev]);
    setIsFormOpen(false);
    toast.success("Trade logged", { description: `${input.pair} • R:R ${newTrade.rrAchieved}` });
    setCurrentView("dashboard");
  };

  function calculatePnL(input: any) {
    const riskAmount = (input.riskPercent / 100) * 100000;
    const rr = calculateRR(input);
    return input.direction === "LONG" ? riskAmount * rr : -riskAmount * rr;
  }
  function calculateRR(input: any) {
    const risk = Math.abs(input.entryPrice - input.stopLoss);
    const reward = Math.abs(input.takeProfit - input.entryPrice);
    return risk > 0 ? Math.round((reward / risk) * 10) / 10 : 0;
  }

  // AI Coach - Enhanced
  const getAIInsights = () => {
    const insights: string[] = [];
    if (metrics.winRate < 50) insights.push("Win rate below 50%. Reduce frequency and focus only on A+ setups.");
    if (metrics.expectancy < 0) insights.push("Negative expectancy. Your average winner is smaller than loser. Fix R:R or win rate.");
    if (metrics.currentStreak >= 4) insights.push("Hot streak! Reduce position size 20% for next 5 trades to protect psychology.");
    const fomoCount = trades.filter(t => t.fomoDetected).length;
    if (fomoCount > 1) insights.push(`${fomoCount} FOMO trades found. This is your biggest leak. Add mandatory 10-min rule before entry.`);
    if (insights.length === 0) insights.push("Execution is disciplined. Keep the detailed journaling — your edge is compounding fast.");
    return insights;
  };

  const aiInsights = getAIInsights();

  // Gamification
  const gamification = React.useMemo(() => {
    const level = Math.floor((metrics.totalTrades * 0.3) + (metrics.currentStreak * 0.8) + (metrics.avgDiscipline * 0.5)) + 1;
    const consistency = Math.min(100, Math.round((metrics.winRate * 0.6) + (metrics.avgDiscipline * 4)));
    const badges = [];
    if (metrics.currentStreak >= 5) badges.push("Streak Master");
    if (metrics.winRate > 60) badges.push("High Probability Trader");
    if (metrics.avgDiscipline > 8) badges.push("Discipline King");
    if (metrics.totalTrades > 50) badges.push("Journal Veteran");
    return { level: Math.min(level, 50), consistency, badges };
  }, [metrics, trades.length]);

  // Export
  const exportTrades = () => {
    const csv = [
      ["Pair", "Direction", "Entry", "PnL", "R:R", "Emotion", "Discipline"].join(","),
      ...trades.map(t => [t.pair, t.direction, t.entryTime, t.pnl, t.rrAchieved, t.emotionalState, t.disciplineScore].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tradevault-export.csv";
    a.click();
    toast.success("Exported to CSV");
  };

  // Replay functions
  const startReplay = (trade: Trade) => {
    setReplayTrade(trade);
    setReplayStep(0);
    setCurrentView("replay");
  };

  const nextReplayStep = () => setReplayStep(s => Math.min(s + 1, 5));

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A]">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#1F1F1F] bg-[#0A0A0A] flex flex-col">
        <div className="p-6 border-b border-[#1F1F1F]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <span className="text-[#0A0A0A] font-bold text-xl">TV</span>
            </div>
            <div>
              <div className="font-semibold text-xl tracking-[-0.5px]">TradeVault</div>
              <div className="text-[10px] text-[#A1A1AA] -mt-1">FULL v1.0 • ALL PHASES</div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-3 text-sm">
          {[
            { id: "dashboard", label: "Dashboard", icon: Target },
            { id: "log", label: "Log Trade", icon: Plus },
            { id: "analytics", label: "Analytics", icon: TrendingUp },
            { id: "coach", label: "AI Coach", icon: Brain },
            { id: "replay", label: "Replay System", icon: Play },
            { id: "gamification", label: "Gamification", icon: Trophy }
          ].map(item => {
            const Icon = item.icon;
            const active = currentView === item.id;
            return (
              <button key={item.id} onClick={() => setCurrentView(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 transition-all ${active ? "bg-[#111] text-white border border-[#1F1F1F]" : "text-[#A1A1AA] hover:bg-[#111] hover:text-white"}`}>
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-[#1F1F1F]">
          <div className="text-xs text-[#A1A1AA] px-3">Timon • Prop Trader</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-16 border-b border-[#1F1F1F] flex items-center justify-between px-8 bg-[#0A0A0A]/95 backdrop-blur">
          <div className="text-sm text-[#A1A1AA]">Monday, 25 May 2026 • All Phases Complete</div>
          <div className="flex items-center gap-3">
            <button onClick={exportTrades} className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-2xl text-sm">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={() => { setIsFormOpen(true); setCurrentView("log"); }} className="btn-primary flex items-center gap-2 px-5 py-2 rounded-2xl text-sm">
              <Plus size={16} /> LOG TRADE
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-8">
          <AnimatePresence mode="wait">
            {/* DASHBOARD */}
            {currentView === "dashboard" && (
              <div className="space-y-8">
                <div>
                  <div className="text-4xl font-semibold tracking-[-1.5px]">Welcome back, Timon.</div>
                  <div className="text-[#A1A1AA]">Your complete evolution system is live. {metrics.totalTrades} trades logged.</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[ 
                    { label: "WIN RATE", value: `${metrics.winRate}%` },
                    { label: "EXPECTANCY", value: `$${metrics.expectancy}` },
                    { label: "PROFIT FACTOR", value: metrics.profitFactor },
                    { label: "CURRENT STREAK", value: metrics.currentStreak }
                  ].map((kpi, i) => (
                    <div key={i} className="card rounded-3xl p-6">
                      <div className="text-xs tracking-[1px] text-[#A1A1AA]">{kpi.label}</div>
                      <div className="text-4xl font-semibold tracking-[-1px] mt-3 metric-value">{kpi.value}</div>
                    </div>
                  ))}
                </div>

                <div className="card rounded-3xl p-6">
                  <div className="font-semibold mb-4">Recent Trades</div>
                  <div className="space-y-2">
                    {trades.slice(0, 5).map(t => (
                      <div key={t.id} className="flex justify-between items-center p-3 rounded-2xl bg-[#0A0A0A] border border-[#1F1F1F]">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs rounded-xl ${t.direction === "LONG" ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"}`}>{t.direction}</span>
                          <span className="font-medium">{t.pair}</span>
                        </div>
                        <div className={`font-mono ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{t.pnl >= 0 ? "+" : ""}${t.pnl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LOG TRADE - Complete Form with Media */}
            {currentView === "log" && (
              <div className="max-w-3xl mx-auto">
                <div className="text-3xl font-semibold tracking-[-1px] mb-6">Log New Execution</div>
                <TradeForm onSubmit={addTrade} onCancel={() => setCurrentView("dashboard")} />
              </div>
            )}

            {/* ANALYTICS with Recharts */}
            {currentView === "analytics" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div className="text-3xl font-semibold tracking-[-1px]">Performance Intelligence</div>
                  <button onClick={exportTrades} className="btn-ghost px-4 py-2 rounded-2xl text-sm flex items-center gap-2"><Download size={16} /> Export</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="card rounded-3xl p-6"><div className="text-xs text-[#A1A1AA]">WIN RATE</div><div className="text-5xl font-semibold mt-2">{metrics.winRate}%</div></div>
                  <div className="card rounded-3xl p-6"><div className="text-xs text-[#A1A1AA]">EXPECTANCY</div><div className="text-5xl font-semibold mt-2">${metrics.expectancy}</div></div>
                  <div className="card rounded-3xl p-6"><div className="text-xs text-[#A1A1AA]">PROFIT FACTOR</div><div className="text-5xl font-semibold mt-2">{metrics.profitFactor}</div></div>
                </div>

                <div className="card rounded-3xl p-6 mb-6">
                  <div className="font-semibold mb-4">Equity Curve</div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={equityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" />
                        <XAxis dataKey="trade" stroke="#A1A1AA" />
                        <YAxis stroke="#A1A1AA" />
                        <Tooltip contentStyle={{ backgroundColor: "#111", border: "none" }} />
                        <Line type="monotone" dataKey="equity" stroke="#10B981" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card rounded-3xl p-6">
                  <div className="font-semibold mb-4">All Trades ({trades.length})</div>
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-[#1F1F1F] text-left text-xs text-[#A1A1AA]"><th className="py-3">PAIR</th><th>DIRECTION</th><th>PnL</th><th>R:R</th><th>EMOTION</th></tr></thead>
                    <tbody>
                      {trades.map(t => (
                        <tr key={t.id} className="border-b border-[#1F1F1F] last:border-0">
                          <td className="py-3 font-medium">{t.pair}</td>
                          <td><span className={`px-2 py-px text-xs rounded ${t.direction === "LONG" ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"}`}>{t.direction}</span></td>
                          <td className={`font-mono ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{t.pnl}</td>
                          <td>{t.rrAchieved}</td>
                          <td className="text-xs">{t.emotionalState}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AI COACH */}
            {currentView === "coach" && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <Brain className="text-emerald-500" size={36} />
                  <div><div className="text-3xl font-semibold tracking-[-1px]">AI Trade Coach</div><div className="text-[#A1A1AA]">Brutally honest. Data-driven.</div></div>
                </div>
                <div className="space-y-4">
                  {aiInsights.map((insight, i) => (
                    <div key={i} className="glass rounded-3xl p-6 border-l-4 border-emerald-500 flex gap-4">
                      <AlertTriangle className="text-emerald-500 mt-1" size={20} />
                      <p>{insight}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8 text-xs text-[#A1A1AA] text-center">Phase 2 ready: Plug real OpenAI key in /api/coach for GPT-4o powered coaching.</div>
              </div>
            )}

            {/* REPLAY SYSTEM */}
            {currentView === "replay" && (
              <div>
                <div className="text-3xl font-semibold tracking-[-1px] mb-6">Trade Replay System</div>
                {!replayTrade ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {trades.map(trade => (
                      <div key={trade.id} onClick={() => startReplay(trade)} className="card rounded-3xl p-6 cursor-pointer hover:border-emerald-500/50">
                        <div className="flex justify-between">
                          <div>
                            <div className="font-medium">{trade.pair} • {trade.direction}</div>
                            <div className="text-xs text-[#A1A1AA]">{format(new Date(trade.entryTime), "dd MMM yyyy HH:mm")}</div>
                          </div>
                          <div className={`font-mono text-lg ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{trade.pnl}</div>
                        </div>
                        <div className="mt-4 text-xs text-emerald-500 flex items-center gap-1"><Play size={14} /> CLICK TO REPLAY</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto card rounded-3xl p-8">
                    <div className="flex justify-between mb-6">
                      <div>
                        <div className="text-2xl font-semibold">{replayTrade.pair} {replayTrade.direction}</div>
                        <div className="text-sm text-[#A1A1AA]">{format(new Date(replayTrade.entryTime), "EEEE, dd MMM yyyy")}</div>
                      </div>
                      <button onClick={() => { setReplayTrade(null); setCurrentView("replay"); }} className="text-sm">Close</button>
                    </div>

                    <div className="space-y-6 text-sm">
                      {[ 
                        { step: 0, label: "Setup & Bias", content: replayTrade.biasReasoning || "No bias noted" },
                        { step: 1, label: "Entry Execution", content: `Entry: ${replayTrade.entryPrice} | SL: ${replayTrade.stopLoss} | TP: ${replayTrade.takeProfit}` },
                        { step: 2, label: "Psychology Check", content: `Emotion: ${replayTrade.emotionalState} | Discipline: ${replayTrade.disciplineScore}/10 | FOMO: ${replayTrade.fomoDetected ? "Yes" : "No"}` },
                        { step: 3, label: "Management & Exit", content: replayTrade.exitReason || "No exit note" },
                        { step: 4, label: "Outcome & Lesson", content: `PnL: ${replayTrade.pnl} | R:R ${replayTrade.rrAchieved} | Notes: ${replayTrade.notes || "None"}` }
                      ].map((item, idx) => (
                        <div key={idx} className={`p-4 rounded-2xl border ${replayStep >= idx ? "border-emerald-500 bg-emerald-950/20" : "border-[#1F1F1F]"}`}>
                          <div className="font-medium text-emerald-400 mb-1">STEP {idx + 1}: {item.label}</div>
                          <div>{item.content}</div>
                        </div>
                      ))}
                    </div>

                    <button onClick={nextReplayStep} className="mt-8 w-full btn-primary py-3 rounded-2xl">Next Step →</button>
                  </div>
                )}
              </div>
            )}

            {/* GAMIFICATION */}
            {currentView === "gamification" && (
              <div className="max-w-2xl mx-auto">
                <div className="text-3xl font-semibold tracking-[-1px] mb-8 flex items-center gap-3"><Trophy className="text-emerald-500" /> Trader Evolution</div>

                <div className="card rounded-3xl p-8 text-center mb-6">
                  <div className="text-8xl font-bold tracking-[-4px] text-emerald-500">{gamification.level}</div>
                  <div className="text-xl mt-2">CURRENT LEVEL</div>
                  <div className="text-[#A1A1AA] mt-1">Consistency Score: {gamification.consistency}%</div>
                </div>

                <div className="card rounded-3xl p-8">
                  <div className="font-semibold mb-4">Earned Badges</div>
                  {gamification.badges.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {gamification.badges.map((badge, i) => (
                        <div key={i} className="px-5 py-2 bg-emerald-950 text-emerald-400 rounded-2xl text-sm border border-emerald-800">{badge}</div>
                      ))}
                    </div>
                  ) : <div className="text-[#A1A1AA]">Keep trading and journaling to unlock badges.</div>}
                </div>

                <div className="mt-6 text-xs text-[#A1A1AA] text-center">Level up by improving win rate, discipline, and consistency. Your data drives your growth.</div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Trade Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6" onClick={() => setIsFormOpen(false)}>
            <motion.div initial={{opacity:0, scale:0.96}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.96}} className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
              <div className="card rounded-3xl p-8">
                <TradeForm onSubmit={addTrade} onCancel={() => setIsFormOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Complete Trade Form Component with Media Upload
function TradeForm({ onSubmit, onCancel }: { onSubmit: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState<any>({
    pair: "XAUUSD", market: "COMMODITIES", direction: "LONG", entryTime: new Date().toISOString().slice(0,16),
    entryPrice: 0, stopLoss: 0, takeProfit: 0, riskPercent: 0.5, positionSize: 1, leverage: 30, session: "LONDON",
    setupType: "", marketStructure: "", liquidityConcepts: "", confirmationModel: "", timeframeAlignment: "", biasReasoning: "",
    confidenceLevel: 7, emotionalState: "FOCUSED", disciplineScore: 8, fomoDetected: false, revengeTrade: false, patienceRating: 8,
    notes: "", media: [] as string[]
  });

  const handleMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev: any) => ({ ...prev, media: [...(prev.media || []), ev.target?.result as string] }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.pair || !form.entryPrice || !form.stopLoss || !form.takeProfit) {
      toast.error("Fill required fields"); return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-2xl font-semibold tracking-tight">New Trade Entry</div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <input value={form.pair} onChange={e => setForm({...form, pair: e.target.value.toUpperCase()})} placeholder="Pair" className="rounded-2xl px-4 py-3 text-sm" required />
        <select value={form.direction} onChange={e => setForm({...form, direction: e.target.value})} className="rounded-2xl px-4 py-3 text-sm">
          <option>LONG</option><option>SHORT</option>
        </select>
        <input type="number" value={form.entryPrice} onChange={e => setForm({...form, entryPrice: parseFloat(e.target.value)})} placeholder="Entry Price" className="rounded-2xl px-4 py-3 text-sm font-mono" required />
        <input type="number" value={form.stopLoss} onChange={e => setForm({...form, stopLoss: parseFloat(e.target.value)})} placeholder="Stop Loss" className="rounded-2xl px-4 py-3 text-sm font-mono" required />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <input type="number" value={form.takeProfit} onChange={e => setForm({...form, takeProfit: parseFloat(e.target.value)})} placeholder="Take Profit" className="rounded-2xl px-4 py-3 text-sm font-mono" required />
        <input type="number" step="0.1" value={form.riskPercent} onChange={e => setForm({...form, riskPercent: parseFloat(e.target.value)})} placeholder="Risk %" className="rounded-2xl px-4 py-3 text-sm" />
        <input type="number" value={form.leverage} onChange={e => setForm({...form, leverage: parseInt(e.target.value)})} placeholder="Leverage" className="rounded-2xl px-4 py-3 text-sm" />
        <select value={form.session} onChange={e => setForm({...form, session: e.target.value})} className="rounded-2xl px-4 py-3 text-sm">
          <option>LONDON</option><option>NEW_YORK</option><option>ASIAN</option><option>OVERLAP</option>
        </select>
      </div>

      <div>
        <div className="text-xs text-[#A1A1AA] mb-2">ICT / STRATEGY</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={form.setupType} onChange={e => setForm({...form, setupType: e.target.value})} placeholder="Setup Type (e.g. Order Block + FVG)" className="rounded-2xl px-4 py-3 text-sm" />
          <input value={form.marketStructure} onChange={e => setForm({...form, marketStructure: e.target.value})} placeholder="Market Structure" className="rounded-2xl px-4 py-3 text-sm" />
          <input value={form.liquidityConcepts} onChange={e => setForm({...form, liquidityConcepts: e.target.value})} placeholder="Liquidity Concepts" className="rounded-2xl px-4 py-3 text-sm" />
          <textarea value={form.biasReasoning} onChange={e => setForm({...form, biasReasoning: e.target.value})} placeholder="Bias Reasoning" className="rounded-3xl px-4 py-3 text-sm h-20" />
        </div>
      </div>

      <div>
        <div className="text-xs text-[#A1A1AA] mb-2">PSYCHOLOGY</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div><label className="text-xs">Confidence</label><input type="number" min="1" max="10" value={form.confidenceLevel} onChange={e => setForm({...form, confidenceLevel: parseInt(e.target.value)})} className="w-full rounded-2xl px-4 py-3 text-sm" /></div>
          <div><label className="text-xs">Discipline</label><input type="number" min="1" max="10" value={form.disciplineScore} onChange={e => setForm({...form, disciplineScore: parseInt(e.target.value)})} className="w-full rounded-2xl px-4 py-3 text-sm" /></div>
          <div><label className="text-xs">Emotion</label>
            <select value={form.emotionalState} onChange={e => setForm({...form, emotionalState: e.target.value})} className="w-full rounded-2xl px-4 py-3 text-sm">
              {["CALM","FOCUSED","ANXIOUS","FOMO","REVENGE","OVERCONFIDENT"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.fomoDetected} onChange={e => setForm({...form, fomoDetected: e.target.checked})} /> FOMO</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.revengeTrade} onChange={e => setForm({...form, revengeTrade: e.target.checked})} /> Revenge</label>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-[#A1A1AA]">NOTES</label>
        <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="What went well? Lessons?" className="w-full rounded-3xl px-4 py-3 text-sm h-20" />
      </div>

      <div>
        <label className="text-xs text-[#A1A1AA] mb-2 block">ATTACH SCREENSHOT (Demo - stored locally)</label>
        <input type="file" accept="image/*" onChange={handleMedia} className="text-sm" />
        {form.media?.length > 0 && <div className="text-xs text-emerald-500 mt-1">{form.media.length} image(s) attached</div>}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="btn-ghost px-8 py-3 rounded-2xl">Cancel</button>
        <button type="submit" className="btn-primary px-10 py-3 rounded-2xl font-semibold">SAVE TO JOURNAL</button>
      </div>
    </form>
  );
}
