import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../abi/Voting.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const DELETED_KEY      = "votechain_deleted_candidates";

const P = {
  forestDark:    "#0D3B2E",
  forestMid:     "#155E43",
  forest:        "#1D7A56",
  gold:          "#D4AF37",
  goldDark:      "#B8962E",
  goldBorder:    "rgba(212,175,55,0.35)",
  bgPage:        "#F5F7F0",
  bgCard:        "#FFFFFF",
  bgMint:        "#EDFAF4",
  textPrimary:   "#1A2E1F",
  textSecondary: "#4B6357",
  textHint:      "#8FA899",
  border:        "#D6E8DC",
  success:       "#16A34A",
  successBg:     "#DCFCE7",
  error:         "#DC2626",
  info:          "#2563EB",
  infoBg:        "#EFF6FF",
};
const G = {
  primary: `linear-gradient(135deg, #0D3B2E, #155E43)`,
  gold:    `linear-gradient(135deg, #D4AF37, #B8962E)`,
};
const S   = { card: "0 4px 16px rgba(13,59,46,0.06)", btn: "0 6px 20px rgba(13,59,46,0.22)" };
const R   = { btn: "12px", card: "16px", cardLg: "24px", pill: "20px" };
const FONT = "'DM Sans','Segoe UI',sans-serif";

// Colour palette for bar chart bars
const BAR_COLORS = [
  "#D4AF37", "#1D7A56", "#2563EB", "#9333EA", "#DC2626",
  "#F97316", "#0891B2", "#BE185D", "#16A34A", "#78716C",
];

function getDeletedIds() {
  try { return JSON.parse(localStorage.getItem(DELETED_KEY) || "[]"); }
  catch { return []; }
}

export default function Results() {
  const navigate   = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [fetching, setFetching]     = useState(true);
  const [error, setError]           = useState("");
  const [loaded, setLoaded]         = useState(false);

  useEffect(() => {
    loadResults();
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const loadResults = async () => {
    setFetching(true);
    setError("");
    try {
      const provider   = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const contract   = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);
      const count      = await contract.getCandidatesCount();
      const deletedIds = getDeletedIds();
      const list       = [];

      for (let i = 0; i < Number(count); i++) {
        if (deletedIds.includes(i)) continue;
        const [name, voteCount] = await contract.getCandidate(i);
        list.push({ id: i, name, voteCount: Number(voteCount) });
      }

      // Sort descending by votes
      list.sort((a, b) => b.voteCount - a.voteCount);
      setCandidates(list);
    } catch (err) {
      console.error(err);
      setError("Could not connect to the blockchain. Make sure Hardhat is running on http://127.0.0.1:8545.");
    } finally {
      setFetching(false);
    }
  };

  const totalVotes = candidates.reduce((s, c) => s + c.voteCount, 0);
  const winner     = candidates[0];
  const maxVotes   = winner?.voteCount || 1;

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(145deg, #EEF5EC, ${P.bgPage})`, fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes barGrow { from { width:0%; } to { width:var(--w); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: P.forestDark, padding: "14px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
      }}>
        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: `linear-gradient(135deg, ${P.gold}, ${P.goldDark})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 14, color: P.forestDark,
          }}>V</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.3px" }}>VoteChain</span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[
            { label: "🏠 Home",      path: "/" },
            { label: "🗳️ Vote",      path: "/dashboard" },
            { label: "📊 Results",   path: "/results" },
          ].map((link) => {
            const isActive = link.path === "/results";
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  padding: "8px 16px", borderRadius: R.btn,
                  border: isActive ? "none" : "1px solid rgba(255,255,255,0.12)",
                  background: isActive
                    ? `linear-gradient(135deg, ${P.gold}, ${P.goldDark})`
                    : "rgba(255,255,255,0.06)",
                  color: isActive ? P.forestDark : "rgba(255,255,255,0.80)",
                  fontFamily: FONT, fontWeight: isActive ? 700 : 600, fontSize: 13,
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.14)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              >{link.label}</button>
            );
          })}

          <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)", margin: "0 6px" }} />

          <button
            onClick={loadResults}
            style={{
              padding: "8px 14px", borderRadius: R.btn,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.80)",
              fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >🔄 Refresh</button>
        </div>
      </nav>

      <main style={{
        maxWidth: 900, margin: "0 auto", padding: "40px 48px",
        opacity: loaded ? 1 : 0, transform: loaded ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(212,175,55,0.10)", border: `1px solid ${P.goldBorder}`,
            borderRadius: R.pill, padding: "4px 12px",
            fontSize: 11, fontWeight: 700, color: P.goldDark,
            letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 12,
          }}>📊 Live Results</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: P.forestDark, letterSpacing: "-0.7px", margin: 0, marginBottom: 6 }}>
            Election Results
          </h1>
          <p style={{ fontSize: 15, color: P.textSecondary, margin: 0 }}>
            Real-time vote counts fetched directly from the blockchain.
          </p>
        </div>

        {/* Loading */}
        {fetching && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <span style={{
              display: "inline-block", width: 36, height: 36,
              border: `4px solid ${P.border}`, borderTopColor: P.forest,
              borderRadius: "50%", animation: "spin 0.75s linear infinite",
              marginBottom: 18,
            }} />
            <p style={{ fontSize: 15, color: P.textSecondary, margin: 0 }}>Loading results from blockchain...</p>
          </div>
        )}

        {/* Error */}
        {!fetching && error && (
          <div style={{
            background: "#FEF2F2", border: "1px solid #FCA5A5",
            borderRadius: R.card, padding: "20px 24px",
            color: P.error, fontSize: 14, fontWeight: 500,
            display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>❌</span>
            <div>
              <p style={{ fontWeight: 700, margin: 0, marginBottom: 4 }}>Blockchain connection failed</p>
              <p style={{ margin: 0 }}>{error}</p>
            </div>
          </div>
        )}

        {/* No votes */}
        {!fetching && !error && candidates.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            background: P.bgCard, borderRadius: R.card, border: `1px solid ${P.border}`,
          }}>
            <p style={{ fontSize: 40, margin: 0 }}>🗳️</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: P.textPrimary, marginTop: 12, marginBottom: 0 }}>No candidates found</p>
            <p style={{ fontSize: 14, color: P.textSecondary, marginTop: 6, marginBottom: 0 }}>The admin hasn't added any candidates yet.</p>
          </div>
        )}

        {!fetching && !error && candidates.length > 0 && (
          <>
            {/* ── Summary stats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 14, marginBottom: 32 }}>
              {[
                { icon: "🗳️", label: "Total Votes Cast", value: totalVotes },
                { icon: "👤", label: "Candidates",       value: candidates.length },
                { icon: "🏆", label: "Current Leader",   value: winner?.name.split(" ")[0] || "—" },
                { icon: "📊", label: "Leading with",     value: totalVotes > 0 ? `${Math.round((winner.voteCount / totalVotes) * 100)}%` : "—" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: P.bgCard, borderRadius: R.card,
                  border: `1px solid ${P.border}`, padding: "18px 20px", boxShadow: S.card,
                  animation: "fadeUp 0.4s ease both",
                }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <p style={{
                    fontSize: 22, fontWeight: 800, margin: "8px 0 2px",
                    background: G.primary,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: P.textHint, fontWeight: 500, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* ── Winner spotlight ── */}
            {totalVotes > 0 && (
              <div style={{
                background: P.bgCard, borderRadius: R.cardLg,
                border: `2px solid ${P.gold}55`,
                padding: "28px 32px", marginBottom: 28,
                boxShadow: "0 8px 32px rgba(212,175,55,0.12)",
                display: "flex", alignItems: "center", gap: 24,
                animation: "fadeUp 0.5s ease both",
              }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: G.gold, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 22, color: P.forestDark,
                  boxShadow: "0 6px 20px rgba(212,175,55,0.35)",
                }}>
                  {winner.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "rgba(212,175,55,0.12)", border: `1px solid ${P.goldBorder}`,
                    borderRadius: R.pill, padding: "2px 10px",
                    fontSize: 10, fontWeight: 700, color: P.goldDark,
                    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8,
                  }}>🏆 Current Leader</div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: P.forestDark, margin: 0, marginBottom: 4 }}>{winner.name}</h2>
                  <p style={{ fontSize: 14, color: P.textSecondary, margin: 0 }}>
                    {winner.voteCount} vote{winner.voteCount !== 1 ? "s" : ""} — {Math.round((winner.voteCount / totalVotes) * 100)}% of total
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{
                    fontSize: 40, fontWeight: 800,
                    background: G.gold,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>{winner.voteCount}</span>
                  <p style={{ fontSize: 11, color: P.textHint, margin: "2px 0 0" }}>votes</p>
                </div>
              </div>
            )}

            {/* ── Bar chart ── */}
            <div style={{
              background: P.bgCard, borderRadius: R.cardLg,
              border: `1px solid ${P.border}`, padding: "28px 32px",
              boxShadow: S.card, marginBottom: 28,
              animation: "fadeUp 0.6s ease both",
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: P.forestDark, margin: 0, marginBottom: 24 }}>📊 Vote Distribution</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {candidates.map((c, i) => {
                  const pct    = totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100) : 0;
                  const relPct = maxVotes > 0 ? Math.round((c.voteCount / maxVotes) * 100) : 0;
                  const color  = BAR_COLORS[i % BAR_COLORS.length];

                  return (
                    <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      {/* Rank */}
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        background: i === 0 ? G.gold : `${P.forestMid}14`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 12,
                        color: i === 0 ? P.forestDark : P.forestMid,
                      }}>#{i + 1}</div>

                      {/* Name */}
                      <div style={{ width: 150, flexShrink: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: P.textPrimary, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: P.textHint, margin: 0, marginTop: 1 }}>{c.voteCount} vote{c.voteCount !== 1 ? "s" : ""}</p>
                      </div>

                      {/* Bar */}
                      <div style={{ flex: 1, height: 28, background: P.bgMint, borderRadius: 6, overflow: "hidden", border: `1px solid ${P.border}` }}>
                        <div style={{
                          height: "100%", borderRadius: 6,
                          background: i === 0 ? G.gold : `linear-gradient(90deg, ${color}CC, ${color})`,
                          width: `${relPct}%`,
                          transition: "width 1s ease",
                          minWidth: relPct > 0 ? 4 : 0,
                        }} />
                      </div>

                      {/* Pct label */}
                      <div style={{ width: 42, textAlign: "right", flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? P.goldDark : P.forestMid }}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalVotes === 0 && (
                <p style={{ textAlign: "center", fontSize: 14, color: P.textHint, marginTop: 20, fontStyle: "italic" }}>
                  No votes have been cast yet. Bars will fill in as votes are recorded.
                </p>
              )}
            </div>

            {/* ── Full leaderboard table ── */}
            <div style={{
              background: P.bgCard, borderRadius: R.cardLg,
              border: `1px solid ${P.border}`, overflow: "hidden",
              boxShadow: S.card, animation: "fadeUp 0.7s ease both",
            }}>
              <div style={{ padding: "20px 28px", borderBottom: `1px solid ${P.border}` }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: P.forestDark, margin: 0 }}>🏅 Full Leaderboard</h3>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: P.bgMint }}>
                    {["Rank", "Candidate", "Votes", "Share", "Status"].map((h) => (
                      <th key={h} style={{
                        padding: "12px 20px", textAlign: "left",
                        fontSize: 11, fontWeight: 700, color: P.textSecondary,
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        borderBottom: `1px solid ${P.border}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c, i) => {
                    const pct = totalVotes > 0 ? Math.round((c.voteCount / totalVotes) * 100) : 0;
                    const isLeader = i === 0 && totalVotes > 0;

                    return (
                      <tr key={c.id} style={{
                        background: isLeader ? "rgba(212,175,55,0.04)" : "transparent",
                        borderBottom: i < candidates.length - 1 ? `1px solid ${P.border}` : "none",
                        transition: "background 0.2s",
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = P.bgMint}
                        onMouseLeave={e => e.currentTarget.style.background = isLeader ? "rgba(212,175,55,0.04)" : "transparent"}
                      >
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: i === 0 ? G.gold : `${P.forestMid}14`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 800, fontSize: 12,
                            color: i === 0 ? P.forestDark : P.forestMid,
                          }}>#{i + 1}</div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: "50%",
                              background: i === 0 ? G.gold : G.primary,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontWeight: 800, fontSize: 12,
                              color: i === 0 ? P.forestDark : P.gold,
                              flexShrink: 0,
                            }}>
                              {c.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 700, fontSize: 14, color: P.textPrimary }}>{c.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: P.textPrimary }}>{c.voteCount}</span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 80, height: 6, background: P.bgMint, borderRadius: 3, border: `1px solid ${P.border}`, overflow: "hidden" }}>
                              <div style={{
                                height: "100%", borderRadius: 3,
                                background: i === 0 ? G.gold : G.primary,
                                width: `${pct}%`, transition: "width 1s ease",
                              }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? P.goldDark : P.forestMid }}>{pct}%</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          {isLeader ? (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              background: "rgba(212,175,55,0.12)", border: `1px solid ${P.goldBorder}`,
                              borderRadius: R.pill, padding: "3px 10px",
                              fontSize: 11, fontWeight: 700, color: P.goldDark,
                            }}>🏆 Leading</span>
                          ) : (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 5,
                              background: P.bgMint, border: `1px solid ${P.border}`,
                              borderRadius: R.pill, padding: "3px 10px",
                              fontSize: 11, fontWeight: 600, color: P.textSecondary,
                            }}>Running</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Blockchain footer */}
            <div style={{
              marginTop: 28, padding: "18px 24px",
              background: P.bgCard, borderRadius: R.card,
              border: `1px solid ${P.border}`, boxShadow: S.card,
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
              animation: "fadeUp 0.8s ease both",
            }}>
              <span style={{ fontSize: 20 }}>⛓️</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: P.textPrimary, margin: 0 }}>
                  Results are pulled live from the Ethereum smart contract
                </p>
                <p style={{ fontSize: 12, color: P.textSecondary, margin: 0, marginTop: 2 }}>
                  Contract: <code style={{ fontSize: 11 }}>{CONTRACT_ADDRESS}</code>
                </p>
              </div>
              <button
                onClick={loadResults}
                style={{
                  padding: "8px 18px", borderRadius: R.btn, border: `1px solid ${P.border}`,
                  background: P.bgCard, color: P.textSecondary,
                  fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}
              >🔄 Refresh</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}