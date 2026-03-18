import React, { useEffect, useMemo, useState } from "react";

type Hole = {
  id: number;
  name: string;
  venue: string;
  par: number;
  image?: string;
  color?: string;
};

type HoleScore = {
  drinks: number;
  penalty: number;
  bonus: number;
  notes: string;
};

type Scores = Record<string, Record<number, HoleScore>>;

type TabKey = "leaderboard" | "scorecard" | "players" | "holes";

const holeColors = [
  "linear-gradient(135deg, #f97316, #fb7185)",
  "linear-gradient(135deg, #22c55e, #14b8a6)",
  "linear-gradient(135deg, #3b82f6, #8b5cf6)",
  "linear-gradient(135deg, #eab308, #f97316)",
  "linear-gradient(135deg, #ef4444, #ec4899)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #84cc16, #22c55e)",
  "linear-gradient(135deg, #a855f7, #ec4899)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
];

const placeholderBarImages = [
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80",
];

const defaultHoles: Hole[] = Array.from({ length: 9 }, (_, index) => ({
  id: index + 1,
  name: `Hole ${index + 1}`,
  venue: `Bar ${index + 1}`,
  par: [3, 2, 4, 3, 2, 5, 3, 4, 6][index],
  image: placeholderBarImages[index],
  color: holeColors[index % holeColors.length],
}));

const defaultPlayers = ["Mads", "Jonas", "Emil"];

function makeInitialScores(players: string[], holes: Hole[]): Scores {
  const scores: Scores = {};
  players.forEach((player) => {
    scores[player] = {};
    holes.forEach((hole) => {
      scores[player][hole.id] = { drinks: 0, penalty: 0, bonus: 0, notes: "" };
    });
  });
  return scores;
}

function normalizeData(data: any) {
  const holes: Hole[] = Array.isArray(data?.holes) && data.holes.length
    ? data.holes.map((hole: Hole, index: number) => ({
        ...hole,
        image: hole.image || placeholderBarImages[index % placeholderBarImages.length],
        color: hole.color || holeColors[index % holeColors.length],
      }))
    : defaultHoles;
  const players: string[] = Array.isArray(data?.players) && data.players.length ? data.players : defaultPlayers;
  const scores: Scores = data?.scores || makeInitialScores(players, holes);

  players.forEach((player) => {
    if (!scores[player]) scores[player] = {};
    holes.forEach((hole) => {
      if (!scores[player][hole.id]) {
        scores[player][hole.id] = { drinks: 0, penalty: 0, bonus: 0, notes: "" };
      }
    });
  });

  return { holes, players, scores };
}

function shellStyle(): React.CSSProperties {
  return {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #1f2937, #0f172a 45%, #020617)",
    padding: 16,
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#e5e7eb",
  };
}

function cardStyle(dark = true): React.CSSProperties {
  return {
    background: dark ? "rgba(15, 23, 42, 0.78)" : "#ffffff",
    border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #e5e7eb",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
    backdropFilter: "blur(10px)",
  };
}

function buttonStyle(active = false): React.CSSProperties {
  return {
    border: active ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.12)",
    background: active ? "linear-gradient(135deg, #f97316, #ec4899)" : "rgba(255,255,255,0.06)",
    color: "#ffffff",
    borderRadius: 14,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  };
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    fontSize: 14,
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
  };
}

function chipStyle(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.08)",
    color: "#f8fafc",
    fontSize: 12,
    fontWeight: 700,
  };
}

export default function PubGolfScorecardApp() {
  const [players, setPlayers] = useState<string[]>(defaultPlayers);
  const [holes, setHoles] = useState<Hole[]>(defaultHoles);
  const [scores, setScores] = useState<Scores>(makeInitialScores(defaultPlayers, defaultHoles));
  const [newPlayer, setNewPlayer] = useState("");
  const [newVenue, setNewVenue] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(defaultPlayers[0]);
  const [activeTab, setActiveTab] = useState<TabKey>("leaderboard");

  useEffect(() => {
    const raw = localStorage.getItem("pubgolf-scorecard-v2");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizeData(parsed);
      setPlayers(normalized.players);
      setHoles(normalized.holes);
      setScores(normalized.scores);
      setSelectedPlayer(normalized.players[0] || "");
    } catch {
      // ignore bad local data
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pubgolf-scorecard-v2", JSON.stringify({ players, holes, scores }));
  }, [players, holes, scores]);

  const leaderboard = useMemo(() => {
    return players
      .map((player) => {
        const totalDrinks = holes.reduce((sum, hole) => sum + Number(scores[player]?.[hole.id]?.drinks || 0), 0);
        const totalPenalty = holes.reduce((sum, hole) => sum + Number(scores[player]?.[hole.id]?.penalty || 0), 0);
        const totalBonus = holes.reduce((sum, hole) => sum + Number(scores[player]?.[hole.id]?.bonus || 0), 0);
        const totalPar = holes.reduce((sum, hole) => sum + Number(hole.par || 0), 0);
        const gross = totalDrinks + totalPenalty - totalBonus;
        const netVsPar = gross - totalPar;
        return { player, totalDrinks, totalPenalty, totalBonus, gross, totalPar, netVsPar };
      })
      .sort((a, b) => a.gross - b.gross || a.player.localeCompare(b.player));
  }, [players, holes, scores]);

  const updateCell = (player: string, holeId: number, field: keyof HoleScore, value: string) => {
    setScores((prev) => ({
      ...prev,
      [player]: {
        ...prev[player],
        [holeId]: {
          ...prev[player][holeId],
          [field]: field === "notes" ? value : Math.max(0, Number(value) || 0),
        },
      },
    }));
  };

  const addPlayer = () => {
    const name = newPlayer.trim();
    if (!name || players.includes(name)) return;
    setPlayers((prev) => [...prev, name]);
    setScores((prev) => ({
      ...prev,
      [name]: holes.reduce((acc, hole) => {
        acc[hole.id] = { drinks: 0, penalty: 0, bonus: 0, notes: "" };
        return acc;
      }, {} as Record<number, HoleScore>),
    }));
    setSelectedPlayer(name);
    setNewPlayer("");
  };

  const removePlayer = (name: string) => {
    const nextPlayers = players.filter((p) => p !== name);
    const nextScores = { ...scores };
    delete nextScores[name];
    setPlayers(nextPlayers);
    setScores(nextScores);
    setSelectedPlayer(nextPlayers[0] || "");
  };

  const addHole = () => {
    const id = Date.now();
    const holeIndex = holes.length;
    const hole: Hole = {
      id,
      name: `Hole ${holeIndex + 1}`,
      venue: newVenue.trim() || `Bar ${holeIndex + 1}`,
      par: 3,
      image: placeholderBarImages[holeIndex % placeholderBarImages.length],
      color: holeColors[holeIndex % holeColors.length],
    };
    setHoles((prev) => [...prev, hole]);
    setScores((prev) => {
      const copy = { ...prev };
      players.forEach((player) => {
        copy[player] = { ...copy[player], [id]: { drinks: 0, penalty: 0, bonus: 0, notes: "" } };
      });
      return copy;
    });
    setNewVenue("");
  };

  const removeHole = (holeId: number) => {
    setHoles((prev) => prev.filter((h) => h.id !== holeId));
    setScores((prev) => {
      const copy = { ...prev };
      Object.keys(copy).forEach((player) => {
        const playerScores = { ...copy[player] };
        delete playerScores[holeId];
        copy[player] = playerScores;
      });
      return copy;
    });
  };

  const updateHole = (holeId: number, field: keyof Hole, value: string) => {
    setHoles((prev) => prev.map((hole) => (
      hole.id === holeId
        ? { ...hole, [field]: field === "par" ? Math.max(1, Number(value) || 1) : value }
        : hole
    )));
  };

  const resetAll = () => setScores(makeInitialScores(players, holes));

  const playerSummary = useMemo(() => {
    if (!selectedPlayer) return 0;
    return holes.reduce((sum, hole) => {
      const row = scores[selectedPlayer]?.[hole.id];
      return sum + Number(row?.drinks || 0) + Number(row?.penalty || 0) - Number(row?.bonus || 0);
    }, 0);
  }, [selectedPlayer, holes, scores]);

  const tabButton = (key: TabKey, label: string, emoji: string) => (
    <button type="button" onClick={() => setActiveTab(key)} style={buttonStyle(activeTab === key)}>
      <span style={{ marginRight: 8 }}>{emoji}</span>{label}
    </button>
  );

  return (
    <div style={shellStyle()}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gap: 16 }}>
        <div
          style={{
            ...cardStyle(),
            padding: 0,
            overflow: "hidden",
            background: "linear-gradient(135deg, rgba(249,115,22,0.95), rgba(236,72,153,0.88), rgba(59,130,246,0.82))",
          }}
        >
          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.05 }}>⛳🍻 Pubgolf </div>
                <div style={{ marginTop: 10, color: "rgba(255,255,255,0.92)", maxWidth: 700, lineHeight: 1.6 }}>
                  Hver í raun og veru er mesta fyllibyttan í hópnum?
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={chipStyle()}>🏁 {holes.length} holes</span>
                <span style={chipStyle()}>👥 {players.length} players</span>
                <span style={chipStyle()}>📱 mobile friendly</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {tabButton("leaderboard", "Leaderboard", "🏆")}
          {tabButton("scorecard", "Scorecard", "🍺")}
          {tabButton("players", "Players", "👥")}
          {tabButton("holes", "Holes", "📍")}
        </div>

        {activeTab === "leaderboard" && (
          <>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              <div style={cardStyle()}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>🏆 Ríkjandi drykkjukóngur</div>
                {leaderboard[0] ? (
                  <>
                    <div style={{ fontSize: 30, fontWeight: 900 }}>{leaderboard[0].player}</div>
                    <div style={{ marginTop: 8, color: "#cbd5e1" }}>Score: {leaderboard[0].gross}</div>
                    <div style={{ marginTop: 4, color: "#cbd5e1" }}>
                      {leaderboard[0].netVsPar === 0 ? "Even par" : leaderboard[0].netVsPar > 0 ? `+${leaderboard[0].netVsPar} vs par` : `${leaderboard[0].netVsPar} vs par`}
                    </div>
                  </>
                ) : (
                  <div style={{ color: "#cbd5e1" }}>No players yet.</div>
                )}
              </div>

              <div style={cardStyle()}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>🔥 Night status</div>
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ color: "#cbd5e1" }}>Total course par: <strong style={{ color: "#fff" }}>{holes.reduce((sum, hole) => sum + hole.par, 0)}</strong></div>
                  <div style={{ color: "#cbd5e1" }}>Current players: <strong style={{ color: "#fff" }}>{players.join(", ")}</strong></div>
                </div>
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>Live leaderboard</div>
                <button type="button" onClick={resetAll} style={buttonStyle(false)}>Reset scores</button>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {leaderboard.map((entry, index) => (
                  <div key={entry.player} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 16, background: "rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🍻"} #{index + 1} {entry.player}</div>
                        <div style={{ color: "#cbd5e1", marginTop: 6 }}>Drinks {entry.totalDrinks} · Penalties +{entry.totalPenalty} · Bonuses -{entry.totalBonus}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 30, fontWeight: 900 }}>{entry.gross}</div>
                        <div style={{ color: "#cbd5e1" }}>{entry.netVsPar > 0 ? `+${entry.netVsPar}` : entry.netVsPar} vs par</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {holes.map((hole, index) => (
                <div key={hole.id} style={{ ...cardStyle(), padding: 0, overflow: "hidden" }}>
                  <div style={{ height: 120, backgroundImage: `url(${hole.image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div style={{ background: hole.color, padding: "8px 14px", fontWeight: 800 }}>Hola {index + 1}</div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{hole.venue}</div>
                    <div style={{ color: "#cbd5e1", marginTop: 6 }}>{hole.name}</div>
                    <div style={{ marginTop: 10 }}><span style={chipStyle()}>Par {hole.par}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "scorecard" && (
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            <div style={{ ...cardStyle(), alignSelf: "start" }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Pick player</div>
              <div style={{ display: "grid", gap: 8 }}>
                {players.map((player) => (
                  <button key={player} type="button" onClick={() => setSelectedPlayer(player)} style={buttonStyle(selectedPlayer === player)}>{player}</button>
                ))}
              </div>
              <div style={{ marginTop: 16, color: "#cbd5e1" }}>Total: <strong style={{ color: "#fff" }}>{playerSummary}</strong></div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {holes.map((hole, index) => {
                const row = scores[selectedPlayer]?.[hole.id] || { drinks: 0, penalty: 0, bonus: 0, notes: "" };
                return (
                  <div key={hole.id} style={{ ...cardStyle(), padding: 0, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr" }}>
                      <div style={{ backgroundImage: `url(${hole.image})`, backgroundSize: "cover", backgroundPosition: "center", minHeight: 170 }} />
                      <div style={{ padding: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                          <div>
                            <div style={{ fontSize: 20, fontWeight: 800 }}>{index + 1}. {hole.venue}</div>
                            <div style={{ color: "#cbd5e1", marginTop: 4 }}>{hole.name}</div>
                          </div>
                          <div style={{ background: hole.color, padding: "7px 12px", borderRadius: 999, fontSize: 13, fontWeight: 800 }}>Par {hole.par}</div>
                        </div>

                        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>🍺 Drinks</div>
                            <input style={inputStyle()} type="number" min={0} value={row.drinks} onChange={(e) => updateCell(selectedPlayer, hole.id, "drinks", e.target.value)} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>🚨 Penalty</div>
                            <input style={inputStyle()} type="number" min={0} value={row.penalty} onChange={(e) => updateCell(selectedPlayer, hole.id, "penalty", e.target.value)} />
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>✨ Bonus</div>
                            <input style={inputStyle()} type="number" min={0} value={row.bonus} onChange={(e) => updateCell(selectedPlayer, hole.id, "bonus", e.target.value)} />
                          </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Notes / chaos log</div>
                          <input style={inputStyle()} value={row.notes} onChange={(e) => updateCell(selectedPlayer, hole.id, "notes", e.target.value)} placeholder="Example: finished without hands = -1 bonus" />
                        </div>
                        <div style={{ marginTop: 12, color: "#cbd5e1" }}>Hole total: {Number(row.drinks) + Number(row.penalty) - Number(row.bonus)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "players" && (
          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Fyllibyttur</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <input style={{ ...inputStyle(), flex: 1, minWidth: 220 }} value={newPlayer} onChange={(e) => setNewPlayer(e.target.value)} placeholder="Add player" onKeyDown={(e) => e.key === "Enter" && addPlayer()} />
              <button type="button" onClick={addPlayer} style={buttonStyle(false)}>Add Fyllibyttu</button>
            </div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {players.map((player) => (
                <div key={player} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.04)" }}>
                  <div style={{ fontWeight: 700 }}>{player}</div>
                  <button type="button" onClick={() => removePlayer(player)} style={buttonStyle(false)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "holes" && (
          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Course setup</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <input style={{ ...inputStyle(), flex: 1, minWidth: 220 }} value={newVenue} onChange={(e) => setNewVenue(e.target.value)} placeholder="Add a new venue/bar" onKeyDown={(e) => e.key === "Enter" && addHole()} />
              <button type="button" onClick={addHole} style={buttonStyle(false)}>Add hole</button>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {holes.map((hole, idx) => (
                <div key={hole.id} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 16, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", background: "rgba(255,255,255,0.04)" }}>
                  <input style={inputStyle()} value={hole.name} onChange={(e) => updateHole(hole.id, "name", e.target.value)} placeholder={`Hole ${idx + 1}`} />
                  <input style={inputStyle()} value={hole.venue} onChange={(e) => updateHole(hole.id, "venue", e.target.value)} placeholder="Venue name" />
                  <input style={inputStyle()} type="number" min={1} value={hole.par} onChange={(e) => updateHole(hole.id, "par", e.target.value)} />
                  <input style={inputStyle()} value={hole.image || ""} onChange={(e) => updateHole(hole.id, "image", e.target.value)} placeholder="Paste logo/photo URL" />
                  <button type="button" onClick={() => removeHole(hole.id)} style={buttonStyle(false)}>Remove</button>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, color: "#cbd5e1", lineHeight: 1.6 }}>
              Paste a direct image URL for each bar to show its logo or photo. Right now the app uses placeholder bar photos.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
