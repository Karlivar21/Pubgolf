import React, { useEffect, useMemo, useState } from "react";

type Hole = {
  id: number;
  name: string;
  venue: string;
  par: number;
  image?: string;
  color?: string;
  rules: string;
};

type HoleScore = {
  score: number;
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
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiSCEP6Ja8_hC6cQ1vG0S7RayZwCq-WMqIaQ&s",
  "https://alfredprod.imgix.net/logo/is-7a49d41a-ce46-4127-8d53-e5ac5b34b7b8.jpeg?w=256&q=75&auto=format",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJIkliMDw-dzPm8g4lkfy5678oOVL4HP0cPQ&s",
  "https://theirishmanpub.is/wp-content/uploads/2019/04/logo-cropped.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-6StmSGUc35LuomgsNpBgaJLWIFJlu17ODg&s",
  "https://islenskibarinn.is/wp-content/uploads/2024/11/cropped-cropped-Untitled-2.jpg",
  "https://danski.enhance.nextdigital.is/wp-content/uploads/2019/02/DenDanskeKro_Logo_512x512_transparent.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpmLL2q6SA4x6zkA-O8mgNdHgkLDfEudYxKQ&s",
  "https://www.ninabar.is/_next/image?url=%2Fservietta.png&w=3840&q=75&dpl=dpl_EgFwn8i4rwGR2iJ2L1rVjpznmaS7",
];

const barNames = [
  "English",
  "Dubliner",
  "American",
  "Irishman",
  "Lebowski",
  "Íslenski",
  "Danski",
  "Petersen",
  "Nína",
];


const holeRules = [
  "Par 3: 1 Bjór fyrir par, 1 bjór + skot fyrir birdy, 3 bjórar fyrir hole-in-one.",
  "Par 2: 1 bjór fyrir par, 2 bjórar fyrir hole-in-one",
  "Par 4: 2 bjórar fyrir par, 2 bjórar + jagerbomb fyrir birdy",
  "Par 4: Allir í hjólið, bara hægt að fá par, þarf að drekka það sem þú færð í hjólinu",
  "Par 3: 1 bjór fyrir par, 2 bjórar fyrir birdy, 2 bjórar og skot fyrir hole-in-one.",
  "Par 3: 1 bjór fyrir par, 2 bjórar fyrir birdy, 2 bjórar og skot fyrir hole-in-one.",
  "Par 3: 1 drykkur fyrir par, 2 drykkir fyrir birdy, 2 drykkir og skot fyrir hole-in-one.",
  "Par 2: 1 drykkir fyrir par, 2 drykkir fyrir hole-in-one.",
  "Par 6: 1 drykkur fyrir par, 2 drykkir fyrir birdy, 3 drykkir fyrir eagle, 4 drykkir fyrir albatross, 5 drykkir fyrir condor, hole-in-one 6 drykkir.",
];

const defaultHoles: Hole[] = Array.from({ length: 9 }, (_, index) => ({
  id: index + 1,
  name: `Hole ${index + 1}`,
  venue: barNames[index % barNames.length],
  par: [3, 2, 4, 4, 3, 3, 3, 2, 6][index],
  image: placeholderBarImages[index],
  color: holeColors[index % holeColors.length],
  rules: holeRules[index],
}));

const defaultPlayers = ["Kalli", "Júlli", "Jonny", "Ronni", "Görn", "Gylfi", "Tommy", "Bjössi"];

function makeInitialScores(players: string[], holes: Hole[]): Scores {
  const scores: Scores = {};
  players.forEach((player) => {
    scores[player] = {};
    holes.forEach((hole) => {
      scores[player][hole.id] = { score: 0, notes: "" };
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
        rules: hole.rules || holeRules[index % holeRules.length],
      }))
    : defaultHoles;
  const players: string[] = Array.isArray(data?.players) && data.players.length ? data.players : defaultPlayers;
  const scores: Scores = data?.scores || makeInitialScores(players, holes);

  players.forEach((player) => {
    if (!scores[player]) scores[player] = {};
    holes.forEach((hole) => {
    if (!scores[player][hole.id]) {
      scores[player][hole.id] = { score: 0, notes: "" };
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
      const totalScore = holes.reduce(
        (sum, hole) => sum + Number(scores[player]?.[hole.id]?.score || 0),
        0
      );
      const totalPar = holes.reduce((sum, hole) => sum + Number(hole.par || 0), 0);
      const netVsPar = totalScore - totalPar;
      return { player, totalScore, totalPar, netVsPar };
    })
    .sort((a, b) => a.totalScore - b.totalScore || a.player.localeCompare(b.player));
}, [players, holes, scores]);

  const updateCell = (player: string, holeId: number, field: keyof HoleScore, value: string) => {
  setScores((prev) => ({
    ...prev,
    [player]: {
      ...(prev[player] || {}),
      [holeId]: {
        ...(prev[player]?.[holeId] || { score: 0, notes: "" }),
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
        acc[hole.id] = { score: 0, notes: "" };
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



  const playerSummary = useMemo(() => {
  if (!selectedPlayer) return 0;
  return holes.reduce((sum, hole) => {
    const row = scores[selectedPlayer]?.[hole.id];
    return sum + Number(row?.score || 0);
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
            background: "none",
          }}
        >
          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.05 }}>⛳🍻 Pubgolf</div>
                <div style={{ marginTop: 10, color: "rgba(255,255,255,0.92)", maxWidth: 700, lineHeight: 1.6 }}>
                  Hver í raun og veru er mesta fyllibyttan í hópnum?
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={chipStyle()}>🏁 {holes.length} holes</span>
                <span style={chipStyle()}>👥 {players.length} players</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {tabButton("leaderboard", "Leaderboard", "🏆")}
          {tabButton("scorecard", "Scorecard", "🍺")}
          {tabButton("players", "Players", "👥")}
          {tabButton("holes", "Rules", "📍")}
        </div>

        {activeTab === "leaderboard" && (
          <>
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              <div style={cardStyle()}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>🏆 Ríkjandi drykkjukóngur</div>
                {leaderboard[0] ? (
                  <>
                    <div style={{ fontSize: 30, fontWeight: 900 }}>{leaderboard[0].player}</div>
                    <div style={{ marginTop: 8, color: "#cbd5e1" }}>Score: {leaderboard[0].totalScore}</div>
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
                <div style={{ fontSize: 22, fontWeight: 800 }}>Staðan</div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {leaderboard.map((entry, index) => (
                  <div key={entry.player} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: 16, background: "rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>{index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🍻"} #{index + 1} {entry.player}</div>
                        <div style={{ color: "#cbd5e1", marginTop: 6 }}> Total score: {entry.totalScore}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 30, fontWeight: 900 }}>Skor: {entry.totalScore}</div>
                        
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {holes.map((hole, index) => (
                <div key={hole.id} style={{ ...cardStyle(), padding: 0, overflow: "hidden" }}>
                  <img
                    src={hole.image}
                    alt={hole.venue}
                    style={{ width: "100%", height: 140, objectFit: "contain", background: "#fff", display: "block", padding: 10 }}
                    onError={(e) => {
                      e.currentTarget.src = placeholderBarImages[index % placeholderBarImages.length];
                    }}
                  />
                  <div style={{ background: hole.color, padding: "8px 14px", fontWeight: 800 }}>Hole {index + 1}</div>
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
                  <button
                    key={player}
                    type="button"
                    onClick={() => setSelectedPlayer(player)}
                    style={buttonStyle(selectedPlayer === player)}
                  >
                    {player}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 16, color: "#cbd5e1" }}>
                Total: <strong style={{ color: "#fff" }}>{playerSummary}</strong>
              </div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {holes.map((hole, index) => {
                const row = scores[selectedPlayer]?.[hole.id] || { score: 0, notes: "" };

                return (
                  <div key={hole.id} style={{ ...cardStyle(), padding: 0, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr" }}>
                      <img
                        src={hole.image}
                        alt={hole.venue}
                        style={{
                          width: "100%",
                          minHeight: 170,
                          objectFit: "contain",
                          background: "#fff",
                          display: "block",
                          padding: 8,
                        }}
                        onError={(e) => {
                          e.currentTarget.src = placeholderBarImages[index % placeholderBarImages.length];
                        }}
                      />

                      <div style={{ padding: 16 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            alignItems: "flex-start",
                            marginBottom: 14,
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 20, fontWeight: 800 }}>
                              {index + 1}. {hole.venue}
                            </div>
                            <div style={{ color: "#cbd5e1", marginTop: 4 }}>{hole.name}</div>
                          </div>
                          <div
                            style={{
                              background: hole.color,
                              padding: "7px 12px",
                              borderRadius: 999,
                              fontSize: 13,
                              fontWeight: 800,
                            }}
                          >
                            Par {hole.par}
                          </div>
                        </div>

                        <div style={{ marginBottom: 14, color: "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                          <strong style={{ color: "#fff" }}>Rules:</strong> {hole.rules}
                        </div>

                        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>⛳ Score</div>
                            <input
                              style={inputStyle()}
                              type="number"
                              min={0}
                              value={row.score}
                              onChange={(e) => updateCell(selectedPlayer, hole.id, "score", e.target.value)}
                            />
                          </div>
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Notes / chaos log</div>
                          <input
                            style={inputStyle()}
                            value={row.notes}
                            onChange={(e) => updateCell(selectedPlayer, hole.id, "notes", e.target.value)}
                            placeholder="Optional notes"
                          />
                        </div>

                        <div style={{ marginTop: 12, color: "#cbd5e1" }}>
                          Hole total: {Number(row.score)}
                        </div>
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
          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            {holes.map((hole, idx) => (
              <div key={hole.id} style={{ ...cardStyle(), padding: 0, overflow: "hidden" }}>
                <img
                  src={hole.image}
                  alt={hole.venue}
                  style={{ width: "100%", height: 220, objectFit: "contain", background: "#fff", display: "block", padding: 14 }}
                  onError={(e) => {
                    e.currentTarget.src = placeholderBarImages[idx % placeholderBarImages.length];
                  }}
                />
                <div style={{ background: hole.color, padding: "10px 16px", fontWeight: 800, color: "#fff" }}>
                  Hole {idx + 1} · {hole.venue}
                </div>
                <div style={{ padding: 16, display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>{hole.name}</div>
                    <span style={chipStyle()}>Par {hole.par}</span>
                  </div>
                  <div style={{ color: "#cbd5e1", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    <strong style={{ color: "#fff" }}>Rules:</strong> {hole.rules}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
