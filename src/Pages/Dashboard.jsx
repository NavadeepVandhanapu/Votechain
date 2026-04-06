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
  successBg:     "#F0FDF4",
  info:          "#2563EB",
  infoBg:        "#EFF6FF",
  error:         "#DC2626",
  errorBg:       "#FEF2F2",
};
const G = { primary: `linear-gradient(135deg, ${P.forestDark}, ${P.forestMid})` };
const S = { card: "0 4px 16px rgba(13,59,46,0.06)", btn: "0 6px 20px rgba(13,59,46,0.22)" };
const R = { card: 16, pill: 20, btn: 12 };
const FONT = "'DM Sans','Segoe UI',sans-serif";

function getDeletedIds() {
  try { return JSON.parse(localStorage.getItem(DELETED_KEY) || "[]"); }
  catch { return []; }
}

async function getReadContract() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);
}

async function getWriteContract() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
}

// ── CandidateCard (no manifesto) ──
function CandidateCard({ id, name, party, voteCount, totalVotes, onVote, hasVoted, votedFor, loading }) {
  const [hov, setHov] = useState(false);
  const isVotedFor    = votedFor === id;
  const pct           = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
  const initials      = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isVotedFor ? P.successBg : P.bgCard,
        borderRadius: R.card,
        border: `1.5px solid ${isVotedFor ? P.success + "88" : hov && !hasVoted ? P.forest + "55" : P.border}`,
        padding: "22px 20px",
        boxShadow: isVotedFor
          ? "0 8px 28px rgba(22,163,74,0.15)"
          : hov && !hasVoted ? "0 12px 32px rgba(13,59,46,0.13)" : S.card,
        transition: "all 0.25s ease",
        transform: hov && !hasVoted ? "translateY(-3px)" : "none",
        display: "flex", flexDirection: "column", gap: 14,
        position: "relative",
      }}
    >
      {/* ✓ Your Vote badge */}
      {isVotedFor && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: P.success, color: "#fff",
          borderRadius: R.pill, padding: "3px 10px",
          fontSize: 11, fontWeight: 700,
          boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
        }}>✓ Your Vote</div>
      )}

      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: "50%",
          background: isVotedFor ? `linear-gradient(135deg, ${P.success}, #15803D)` : G.primary,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 16, color: "#fff", flexShrink: 0,
          boxShadow: isVotedFor ? "0 4px 12px rgba(22,163,74,0.35)" : "none",
          transition: "all 0.3s",
        }}>{initials}</div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: P.textPrimary, margin: 0 }}>{name}</p>
          <p style={{ fontSize: 12, color: P.textSecondary, margin: 0 }}>{party || "Independent"}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: P.textSecondary, fontWeight: 500 }}>{voteCount} vote{voteCount !== 1 ? "s" : ""}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: isVotedFor ? P.success : P.forest }}>{pct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "#E5EDE8" }}>
          <div style={{
            height: "100%", borderRadius: 3,
            width: `${pct}%`,
            background: isVotedFor ? `linear-gradient(90deg, ${P.success}, #22C55E)` : G.primary,
            transition: "width 0.8s ease",
          }} />
        </div>
      </div>

      {/* Vote button */}
      {!hasVoted && (
        <button
          onClick={() => onVote(id, name)}
          disabled={loading}
          style={{
            padding: "11px 0", borderRadius: R.btn,
            border: `1.5px solid ${hov ? "transparent" : P.forest + "55"}`,
            background: hov ? G.primary : "transparent",
            color: hov ? P.gold : P.forest,
            fontFamily: FONT, fontWeight: 700, fontSize: 13,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}
        >
          {loading ? (
            <>
              <span style={{
                width: 14, height: 14, border: "2px solid rgba(29,122,86,0.3)",
                borderTopColor: P.forest, borderRadius: "50%",
                display: "inline-block", animation: "spin 0.75s linear infinite",
              }} />
              Processing...
            </>
          ) : "🗳️  Vote for this candidate"}
        </button>
      )}
    </div>
  );
}

// ── Navbar (inline) ──
function Navbar({ walletAddress, onConnectWallet, onLogoClick, onLogout, hasVoted }) {
  return (
    <nav style={{
      background: P.forestDark,
      padding: "14px 48px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
    }}>
      <div
        onClick={onLogoClick}
        title="Back to Home"
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

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Results nav link */}
        <button
          onClick={() => window.location.href = "/results"}
          style={{
            padding: "8px 16px", borderRadius: R.btn,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "rgba(255,255,255,0.80)",
            fontFamily: FONT, fontWeight: 600, fontSize: 13,
            cursor: "pointer", transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
        >📊 Results</button>

        <div style={{ width: 1, height: 22, background: "rgba(255,255,255,0.15)" }} />

        {walletAddress ? (
          <div style={{
            background: "rgba(212,175,55,0.12)", border: `1px solid ${P.goldBorder}`,
            borderRadius: R.pill, padding: "6px 14px",
            fontSize: 12, fontWeight: 600, color: P.gold,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: P.success, display: "inline-block" }} />
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        ) : (
          <button
            onClick={onConnectWallet}
            style={{
              padding: "8px 18px", borderRadius: R.btn, border: "none",
              background: `linear-gradient(135deg, ${P.gold}, ${P.goldDark})`,
              color: P.forestDark, fontFamily: FONT, fontWeight: 700, fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >🦊 Connect Wallet</button>
        )}

        {hasVoted && (
          <button
            onClick={onLogout}
            style={{
              padding: "8px 16px", borderRadius: R.btn,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.07)",
              color: "rgba(255,255,255,0.85)",
              fontFamily: FONT, fontWeight: 600, fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            }}
          >← Logout</button>
        )}
      </div>
    </nav>
  );
}

// ════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════
export default function Dashboard() {
  const navigate = useNavigate();

  const [candidates, setCandidates]               = useState([]);
  const [hasVoted, setHasVoted]                   = useState(false);
  const [votedFor, setVotedFor]                   = useState(null);
  const [txHash, setTxHash]                       = useState("");
  const [walletAddress, setWalletAddress]         = useState("");
  const [loaded, setLoaded]                       = useState(false);
  const [fetching, setFetching]                   = useState(true);
  const [voting, setVoting]                       = useState(false);
  const [toast, setToast]                         = useState(null);
  const [isVoterAuthorized, setIsVoterAuthorized] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) { navigate("/"); return; }

    const role = localStorage.getItem("userRole");
    if (role === "voter") {
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("txHash");
      localStorage.removeItem("votedFor");
    }

    const storedWallet = localStorage.getItem("walletAddress");
    const storedTx     = localStorage.getItem("txHash");
    const storedVoted  = localStorage.getItem("votedFor");

    if (storedWallet) setWalletAddress(storedWallet);
    if (storedTx)     setTxHash(storedTx);
    if (storedVoted)  { setHasVoted(true); setVotedFor(parseInt(storedVoted)); }

    setTimeout(() => setLoaded(true), 100);
    fetchCandidates(storedWallet);
  }, []);

  const fetchCandidates = async (wallet) => {
    setFetching(true);
    try {
      const contract   = await getReadContract();
      const count      = await contract.getCandidatesCount();
      const deletedIds = getDeletedIds();
      const list       = [];

      for (let i = 0; i < Number(count); i++) {
        if (deletedIds.includes(i)) continue; // skip soft-deleted
        const [name, voteCount] = await contract.getCandidate(i);
        list.push({ id: i, name, voteCount: Number(voteCount) });
      }
      setCandidates(list);

      if (wallet) {
        const authorized = await contract.voters(wallet);
        const voted      = await contract.hasVoted(wallet);
        setIsVoterAuthorized(authorized);
        if (voted) setHasVoted(true);
      }
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      showToast("❌ Could not connect to blockchain. Is Hardhat running?", "error");
    } finally {
      setFetching(false);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) { alert("Install MetaMask first!"); return; }

      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      const addr     = accounts[0];
      setWalletAddress(addr);
      localStorage.setItem("walletAddress", addr);

      const contract   = await getReadContract();
      const authorized = await contract.voters(addr);
      const voted      = await contract.hasVoted(addr);
      setIsVoterAuthorized(authorized);
      if (voted) setHasVoted(true);

      showToast("✅ Wallet connected!", "success");
    } catch (err) {
      console.error(err);
      showToast("❌ Wallet connection rejected.", "error");
    }
  };

  const handleVote = async (candidateIndex, candidateName) => {
    if (!walletAddress) {
      showToast("⚠️ Please connect your MetaMask wallet first.", "error");
      return;
    }
    if (!isVoterAuthorized) {
      showToast("❌ Your wallet is not authorized to vote. Ask the admin to whitelist you.", "error");
      return;
    }

    setVoting(true);
    try {
      const contract = await getWriteContract();
      showToast("⏳ Sending transaction to blockchain...", "info");
      const tx = await contract.vote(candidateIndex);
      await tx.wait();

      setCandidates(prev =>
        prev.map(c => c.id === candidateIndex ? { ...c, voteCount: c.voteCount + 1 } : c)
      );
      setHasVoted(true);
      setVotedFor(candidateIndex);
      setTxHash(tx.hash);
      localStorage.setItem("votedFor", candidateIndex);
      localStorage.setItem("txHash", tx.hash);

      showToast(`✅ Vote cast for ${candidateName}! Transaction confirmed.`, "success");
    } catch (err) {
      console.error(err);
      if (err.reason === "Not authorized")     showToast("❌ Your wallet is not whitelisted by the admin.", "error");
      else if (err.reason === "Already voted") showToast("❌ You have already voted in this election.", "error");
      else if (err.reason === "Invalid candidate") showToast("❌ Invalid candidate index.", "error");
      else showToast("❌ Transaction failed. Check MetaMask for details.", "error");
    } finally {
      setVoting(false);
    }
  };

  const totalVotes = candidates.reduce((s, c) => s + c.voteCount, 0);

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(145deg, #EEF5EC, ${P.bgPage})`, fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <Navbar
        walletAddress={walletAddress}
        onConnectWallet={connectWallet}
        hasVoted={hasVoted}
        onLogoClick={() => navigate("/")}
        onLogout={() => { localStorage.clear(); navigate("/"); }}
      />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 80, right: 24, zIndex: 999,
          background: toast.type === "success" ? P.successBg : toast.type === "info" ? P.infoBg : P.errorBg,
          border: `1px solid ${toast.type === "success" ? P.success : toast.type === "info" ? P.info : P.error}`,
          color: toast.type === "success" ? "#15803D" : toast.type === "info" ? P.info : P.error,
          borderRadius: R.card, padding: "14px 20px",
          fontSize: 14, fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          maxWidth: 380, animation: "slideIn 0.3s ease",
        }}>{toast.msg}</div>
      )}

      <main style={{
        maxWidth: 1100, margin: "0 auto", padding: "40px 48px",
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(212,175,55,0.10)", border: `1px solid ${P.goldBorder}`,
              borderRadius: R.pill, padding: "4px 12px",
              fontSize: 11, fontWeight: 700, color: P.goldDark, marginBottom: 12,
              letterSpacing: "0.05em", textTransform: "uppercase",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: P.success, display: "inline-block", animation: "pulse 2s infinite" }} />
              Election Live
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.7px", margin: 0, marginBottom: 6 }}>
              Student Council Election 2025
            </h1>
            <p style={{ fontSize: 15, color: P.textSecondary, margin: 0 }}>
              Cast your vote securely on the Ethereum blockchain.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Total Votes", value: fetching ? "—" : totalVotes },
              { label: "Candidates",  value: fetching ? "—" : candidates.length },
            ].map((s) => (
              <div key={s.label} style={{
                background: P.bgCard, borderRadius: R.card,
                border: `1px solid ${P.border}`,
                padding: "14px 20px", textAlign: "center",
                boxShadow: S.card, minWidth: 90,
              }}>
                <span style={{
                  display: "block", fontSize: 24, fontWeight: 800,
                  background: G.primary,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>{s.value}</span>
                <span style={{ fontSize: 11, color: P.textHint, fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wallet not connected warning */}
        {!walletAddress && (
          <div style={{
            background: "#FFFBEB", border: "1px solid #FCD34D",
            borderRadius: R.card, padding: "14px 20px",
            marginBottom: 24, fontSize: 14, fontWeight: 600, color: "#92400E",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            ⚠️ Connect your MetaMask wallet to vote. Click "Connect Wallet" in the top right.
          </div>
        )}

        {/* Not whitelisted warning */}
        {walletAddress && isVoterAuthorized === false && !hasVoted && (
          <div style={{
            background: P.errorBg, border: `1px solid ${P.error}55`,
            borderRadius: R.card, padding: "14px 20px",
            marginBottom: 24, fontSize: 14, fontWeight: 600, color: P.error,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            🚫 Your wallet (<code>{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</code>) is not whitelisted.
            Contact the admin to authorize your address before voting.
          </div>
        )}

        {/* Already voted banner */}
        {hasVoted && txHash && (
          <div style={{
            background: P.successBg, border: `1px solid ${P.success}55`,
            borderRadius: R.card, padding: "16px 20px",
            marginBottom: 28, display: "flex", alignItems: "flex-start", gap: 14,
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>✅</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#15803D", margin: 0, marginBottom: 4 }}>
                Your vote has been recorded on the blockchain!
              </p>
              <p style={{ fontSize: 12, color: "#166534", margin: 0 }}>
                Tx Hash:{" "}
                <span style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.06)", padding: "2px 6px", borderRadius: 4 }}>
                  {txHash}
                </span>
              </p>
            </div>
          </div>
        )}

        {hasVoted && !txHash && (
          <div style={{
            background: P.infoBg, border: `1px solid ${P.info}55`,
            borderRadius: R.card, padding: "14px 20px",
            marginBottom: 28, fontSize: 14, fontWeight: 600, color: P.info,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            ℹ️ You have already cast your vote in this election.
          </div>
        )}

        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: P.textPrimary, margin: 0 }}>
            {fetching ? "Loading candidates from blockchain..." : `Candidates (${candidates.length})`}
          </h2>
          {!hasVoted && !fetching && candidates.length > 0 && (
            <span style={{ fontSize: 13, color: P.textSecondary }}>Select a candidate to cast your vote</span>
          )}
        </div>

        {/* Loading skeleton */}
        {fetching && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: P.bgCard, borderRadius: R.card,
                border: `1px solid ${P.border}`, padding: "22px 20px", height: 160,
                animation: "pulse 1.5s infinite",
              }} />
            ))}
          </div>
        )}

        {/* No candidates */}
        {!fetching && candidates.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            background: P.bgCard, borderRadius: R.card,
            border: `1px solid ${P.border}`,
          }}>
            <p style={{ fontSize: 40, margin: 0, marginBottom: 12 }}>🗳️</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: P.textPrimary, margin: 0 }}>No candidates yet</p>
            <p style={{ fontSize: 14, color: P.textSecondary, marginTop: 6 }}>
              The admin hasn't added any candidates to the blockchain yet.
            </p>
          </div>
        )}

        {/* Candidate grid */}
        {!fetching && candidates.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {candidates.map((c) => (
              <CandidateCard
                key={c.id}
                id={c.id}
                name={c.name}
                party=""
                voteCount={c.voteCount}
                totalVotes={totalVotes}
                onVote={handleVote}
                hasVoted={hasVoted}
                votedFor={votedFor}
                loading={voting}
              />
            ))}
          </div>
        )}

        {/* Blockchain footer */}
        <div style={{
          marginTop: 40, padding: "20px 24px",
          background: P.bgCard, borderRadius: R.card,
          border: `1px solid ${P.border}`, boxShadow: S.card,
          display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 22 }}>⛓️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: P.textPrimary, margin: 0 }}>
              Votes are recorded on Ethereum (Hardhat Local Network)
            </p>
            <p style={{ fontSize: 12, color: P.textSecondary, margin: 0, marginTop: 3 }}>
              Contract: <code style={{ fontSize: 11 }}>{CONTRACT_ADDRESS}</code>
            </p>
          </div>
          <button
            onClick={() => fetchCandidates(walletAddress)}
            style={{
              padding: "9px 18px", borderRadius: R.btn, border: `1px solid ${P.border}`,
              background: P.bgCard, color: P.textSecondary,
              fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >🔄 Refresh</button>
        </div>

      </main>
    </div>
  );
}