import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../abi/Voting.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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
  borderInput:   "#D6E8DC",
  success:       "#16A34A",
  successBg:     "#F0FDF4",
  error:         "#DC2626",
  errorBg:       "#FEF2F2",
  info:          "#2563EB",
  infoBg:        "#EFF6FF",
};
const G  = { primary: `linear-gradient(135deg, ${P.forestDark}, ${P.forestMid})` };
const S  = { card: "0 4px 16px rgba(13,59,46,0.06)", btn: "0 6px 20px rgba(13,59,46,0.22)" };
const R  = { card: 16, pill: 20, btn: 12 };
const FONT = "'DM Sans','Segoe UI',sans-serif";

// ── Get a write-enabled contract (needs MetaMask) ──
async function getWriteContract() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);
}

async function getReadContract() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, provider);
}

// ════════════════════════════════════════════
//  ADMIN PANEL
// ════════════════════════════════════════════
export default function Admin() {
  const navigate = useNavigate();

  const [walletAddress, setWalletAddress]   = useState("");
  const [isAdmin, setIsAdmin]               = useState(null); // null=checking, true/false
  const [candidates, setCandidates]         = useState([]);
  const [loaded, setLoaded]                 = useState(false);
  const [toast, setToast]                   = useState(null);

  // Add Candidate form
  const [candidateName, setCandidateName]     = useState("");
  const [manifesto, setManifesto]             = useState("");
  const [addingCandidate, setAddingCandidate] = useState(false);

  // Add Voter form
  const [voterAddress, setVoterAddress]     = useState("");
  const [addingVoter, setAddingVoter]       = useState(false);

  // ── Auth guard ──
  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) { navigate("/"); return; }
    if (localStorage.getItem("userRole") !== "admin") { navigate("/dashboard"); return; }

    const stored = localStorage.getItem("walletAddress");
    if (stored) {
      setWalletAddress(stored);
      verifyAdmin(stored);
    }

    setTimeout(() => setLoaded(true), 100);
  }, []);

  // ── Verify the connected wallet is the contract admin ──
  const verifyAdmin = async (wallet) => {
    try {
      const contract     = await getReadContract();
      const contractAdmin = await contract.admin();
      setIsAdmin(contractAdmin.toLowerCase() === wallet.toLowerCase());
      fetchCandidates(contract);
    } catch (err) {
      console.error(err);
      showToast("❌ Could not connect to blockchain. Is Hardhat running?", "error");
      setIsAdmin(false);
    }
  };

  const fetchCandidates = async (contract) => {
    try {
      const count = await contract.getCandidatesCount();
      const list  = [];
      for (let i = 0; i < Number(count); i++) {
        const [name, voteCount] = await contract.getCandidate(i);
        list.push({ id: i, name, voteCount: Number(voteCount) });
      }
      setCandidates(list);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  // ── Connect MetaMask ──
  const connectWallet = async () => {
    try {
      if (!window.ethereum) { alert("Install MetaMask!"); return; }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr     = accounts[0];
      setWalletAddress(addr);
      localStorage.setItem("walletAddress", addr);
      verifyAdmin(addr);
    } catch (err) {
      showToast("❌ Wallet connection rejected.", "error");
    }
  };

  // ── Add Candidate ──
  const handleAddCandidate = async () => {
    if (!candidateName.trim()) {
      showToast("⚠️ Enter a candidate name.", "error"); return;
    }
    setAddingCandidate(true);
    try {
      const contract = await getWriteContract();
      showToast("⏳ Sending transaction...", "info");
      const tx = await contract.addCandidate(candidateName.trim());
      await tx.wait();

      // Save manifesto to localStorage keyed by candidate name
      if (manifesto.trim()) {
        const stored = JSON.parse(localStorage.getItem("manifestos") || "{}");
        stored[candidateName.trim()] = manifesto.trim();
        localStorage.setItem("manifestos", JSON.stringify(stored));
      }

      setCandidateName("");
      setManifesto("");
      showToast(`✅ "${candidateName.trim()}" added as a candidate!`, "success");
      // Refresh candidate list
      const rc = await getReadContract();
      fetchCandidates(rc);
    } catch (err) {
      console.error(err);
      if (err.reason === "Not admin") showToast("❌ Your wallet is not the contract admin.", "error");
      else showToast("❌ Transaction failed.", "error");
    } finally {
      setAddingCandidate(false);
    }
  };

  // ── Add Voter ──
  const handleAddVoter = async () => {
    if (!voterAddress.trim()) {
      showToast("⚠️ Enter a voter wallet address.", "error"); return;
    }
    if (!ethers.isAddress(voterAddress.trim())) {
      showToast("⚠️ Invalid Ethereum address format.", "error"); return;
    }
    setAddingVoter(true);
    try {
      const contract = await getWriteContract();
      showToast("⏳ Whitelisting voter...", "info");
      const tx = await contract.addVoter(voterAddress.trim());
      await tx.wait();
      showToast(`✅ Voter ${voterAddress.trim().slice(0,10)}... is now whitelisted!`, "success");
      setVoterAddress("");
    } catch (err) {
      console.error(err);
      if (err.reason === "Not admin") showToast("❌ Your wallet is not the contract admin.", "error");
      else showToast("❌ Transaction failed.", "error");
    } finally {
      setAddingVoter(false);
    }
  };

  // ── Input style helper ──
  const inp = (val) => ({
    flex: 1, padding: "12px 16px", borderRadius: R.btn,
    border: `1.5px solid ${P.borderInput}`,
    fontSize: 14, color: P.textPrimary,
    background: P.bgCard, outline: "none",
    fontFamily: FONT,
    boxSizing: "border-box",
  });

  // ── Render ──
  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(145deg, #EEF5EC, ${P.bgPage})`, fontFamily: FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: P.forestDark, padding: "14px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
      }}>
        {/* Clickable logo → landing page */}
        <div
          onClick={() => navigate("/")}
          title="Back to Home"
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: `linear-gradient(135deg, ${P.gold}, ${P.goldDark})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: 14, color: P.forestDark,
            transition: "transform 0.2s",
          }}>V</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#fff" }}>VoteChain</span>
          <span style={{
            background: "rgba(212,175,55,0.15)", border: `1px solid ${P.goldBorder}`,
            borderRadius: R.pill, padding: "3px 10px",
            fontSize: 11, fontWeight: 700, color: P.gold, marginLeft: 8,
          }}>Admin Panel</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
            <button onClick={connectWallet} style={{
              padding: "8px 18px", borderRadius: R.btn, border: "none",
              background: `linear-gradient(135deg, ${P.gold}, ${P.goldDark})`,
              color: P.forestDark, fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>🦊 Connect Wallet</button>
          )}
          <button
            onClick={() => { localStorage.clear(); navigate("/"); }}
            style={{
              padding: "8px 14px", borderRadius: R.btn,
              border: `1px solid rgba(255,255,255,0.15)`,
              background: "transparent", color: "rgba(255,255,255,0.6)",
              fontFamily: FONT, fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}
          >Logout</button>
        </div>
      </nav>

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
          maxWidth: 400, animation: "slideIn 0.3s ease",
        }}>{toast.msg}</div>
      )}

      <main style={{
        maxWidth: 900, margin: "0 auto", padding: "40px 48px",
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

        {/* Page header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: P.textPrimary, letterSpacing: "-0.7px", margin: 0, marginBottom: 6 }}>
            🛡️ Admin Control Panel
          </h1>
          <p style={{ fontSize: 15, color: P.textSecondary, margin: 0 }}>
            Manage candidates and authorize voters on the blockchain.
          </p>
        </div>

        {/* Wallet not connected */}
        {!walletAddress && (
          <div style={{
            background: "#FFFBEB", border: "1px solid #FCD34D",
            borderRadius: R.card, padding: "20px 24px", marginBottom: 28,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
          }}>
            <div>
              <p style={{ fontWeight: 700, color: "#92400E", margin: 0 }}>⚠️ Wallet not connected</p>
              <p style={{ fontSize: 13, color: "#92400E", margin: 0, marginTop: 4, opacity: 0.8 }}>
                Connect your MetaMask wallet to perform admin actions.
              </p>
            </div>
            <button onClick={connectWallet} style={{
              padding: "10px 20px", borderRadius: R.btn, border: "none",
              background: G.primary, color: P.gold,
              fontFamily: FONT, fontWeight: 700, fontSize: 13, cursor: "pointer",
              flexShrink: 0,
            }}>🦊 Connect Wallet</button>
          </div>
        )}

        {/* Not admin warning */}
        {walletAddress && isAdmin === false && (
          <div style={{
            background: P.errorBg, border: `1px solid ${P.error}55`,
            borderRadius: R.card, padding: "20px 24px", marginBottom: 28,
          }}>
            <p style={{ fontWeight: 700, color: P.error, margin: 0 }}>🚫 Access Denied</p>
            <p style={{ fontSize: 13, color: P.error, margin: 0, marginTop: 6, opacity: 0.85 }}>
              Your connected wallet (<code>{walletAddress}</code>) is not the contract admin.
              The admin is the account that deployed the contract on Hardhat (usually Account #0).
            </p>
          </div>
        )}

        {/* Admin verified badge */}
        {walletAddress && isAdmin === true && (
          <div style={{
            background: P.successBg, border: `1px solid ${P.success}55`,
            borderRadius: R.card, padding: "14px 20px", marginBottom: 28,
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 14, fontWeight: 600, color: "#15803D",
          }}>
            ✅ Admin verified — your wallet matches the contract deployer address.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* ── Add Candidate Card ── */}
          <div style={{
            background: P.bgCard, borderRadius: R.card,
            border: `1px solid ${P.border}`, padding: "28px 24px",
            boxShadow: S.card,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>🧑‍🤝‍🧑</span>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: P.textPrimary, margin: 0 }}>Add Candidate</h2>
            </div>
            <p style={{ fontSize: 13, color: P.textSecondary, marginBottom: 20, marginTop: 4, lineHeight: 1.5 }}>
              Add a candidate to the blockchain. This calls <code>addCandidate()</code> on the contract.
            </p>

            <input
              type="text"
              placeholder="Candidate full name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              style={inp(candidateName)}
            />

            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.textSecondary, marginBottom: 6 }}>
                Manifesto <span style={{ fontWeight: 400, color: P.textHint }}>(optional — shown to voters)</span>
              </label>
              <textarea
                placeholder="What does this candidate stand for? Key promises, goals, vision..."
                value={manifesto}
                onChange={(e) => setManifesto(e.target.value)}
                maxLength={400}
                rows={4}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  border: `1.5px solid ${P.borderInput}`,
                  fontSize: 13, color: P.textPrimary,
                  fontFamily: FONT, resize: "vertical",
                  outline: "none", boxSizing: "border-box",
                  lineHeight: 1.6,
                }}
              />
              <p style={{ fontSize: 11, color: P.textHint, textAlign: "right", margin: "4px 0 0" }}>
                {manifesto.length}/400
              </p>
            </div>

            <button
              onClick={handleAddCandidate}
              disabled={addingCandidate || isAdmin !== true}
              style={{
                width: "100%", marginTop: 12,
                padding: "12px 0", borderRadius: R.btn, border: "none",
                background: isAdmin === true ? G.primary : "#E5E7EB",
                color: isAdmin === true ? P.gold : "#9CA3AF",
                fontFamily: FONT, fontWeight: 700, fontSize: 14,
                cursor: isAdmin === true && !addingCandidate ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}
            >
              {addingCandidate ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: "2px solid rgba(212,175,55,0.4)",
                    borderTopColor: P.gold, borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.75s linear infinite",
                  }} />
                  Adding to blockchain...
                </>
              ) : "+ Add Candidate"}
            </button>
          </div>

          {/* ── Whitelist Voter Card ── */}
          <div style={{
            background: P.bgCard, borderRadius: R.card,
            border: `1px solid ${P.border}`, padding: "28px 24px",
            boxShadow: S.card,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: P.textPrimary, margin: 0 }}>Whitelist Voter</h2>
            </div>
            <p style={{ fontSize: 13, color: P.textSecondary, marginBottom: 20, marginTop: 4, lineHeight: 1.5 }}>
              Authorize a wallet address to vote. Calls <code>addVoter(address)</code> on the contract.
            </p>

            <input
              type="text"
              placeholder="0x... voter wallet address"
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddVoter()}
              style={{ ...inp(voterAddress), width: "100%", display: "block", boxSizing: "border-box" }}
            />
            <button
              onClick={handleAddVoter}
              disabled={addingVoter || isAdmin !== true}
              style={{
                width: "100%", marginTop: 12,
                padding: "12px 0", borderRadius: R.btn, border: "none",
                background: isAdmin === true ? G.primary : "#E5E7EB",
                color: isAdmin === true ? P.gold : "#9CA3AF",
                fontFamily: FONT, fontWeight: 700, fontSize: 14,
                cursor: isAdmin === true && !addingVoter ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}
            >
              {addingVoter ? (
                <>
                  <span style={{
                    width: 16, height: 16, border: "2px solid rgba(212,175,55,0.4)",
                    borderTopColor: P.gold, borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.75s linear infinite",
                  }} />
                  Whitelisting...
                </>
              ) : "🔓 Authorize Voter"}
            </button>
          </div>
        </div>

        {/* ── Current Candidates Table ── */}
        <div style={{
          marginTop: 28, background: P.bgCard, borderRadius: R.card,
          border: `1px solid ${P.border}`, padding: "24px",
          boxShadow: S.card,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: P.textPrimary, margin: 0 }}>
              📋 Candidates on Blockchain ({candidates.length})
            </h2>
            <button
              onClick={async () => { const rc = await getReadContract(); fetchCandidates(rc); }}
              style={{
                padding: "7px 14px", borderRadius: R.btn,
                border: `1px solid ${P.border}`, background: P.bgCard,
                color: P.textSecondary, fontFamily: FONT,
                fontWeight: 600, fontSize: 12, cursor: "pointer",
              }}
            >🔄 Refresh</button>
          </div>

          {candidates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: P.textHint, fontSize: 14 }}>
              No candidates added yet. Use the form above to add some.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${P.border}` }}>
                  {["#", "Name", "Manifesto", "Votes"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "10px 14px",
                      fontSize: 12, fontWeight: 700,
                      color: P.textHint, textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} style={{ borderBottom: `1px solid ${P.border}` }}>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: P.textHint, fontWeight: 600 }}>
                      {c.id}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 700, color: P.textPrimary }}>
                      {c.name}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: P.textSecondary, maxWidth: 200 }}>
                      {(() => {
                        const m = JSON.parse(localStorage.getItem("manifestos") || "{}")[c.name];
                        return m
                          ? <span title={m}>{m.length > 60 ? m.slice(0, 60) + "…" : m}</span>
                          : <span style={{ color: P.textHint, fontStyle: "italic" }}>No manifesto</span>;
                      })()}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{
                        background: P.bgMint, color: P.forest,
                        borderRadius: R.pill, padding: "3px 10px",
                        fontSize: 12, fontWeight: 700,
                      }}>{c.voteCount} votes</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* How it works */}
        <div style={{
          marginTop: 24, padding: "20px 24px",
          background: P.infoBg, borderRadius: R.card,
          border: `1px solid ${P.info}22`,
        }}>
          <p style={{ fontWeight: 700, color: P.info, margin: 0, marginBottom: 10, fontSize: 14 }}>
            ℹ️ How the admin flow works
          </p>
          <div style={{ fontSize: 13, color: P.textSecondary, lineHeight: 1.8 }}>
            <p style={{ margin: 0 }}>
              <strong>1.</strong> Connect with the <strong>first Hardhat account</strong> (Account #0) — this is the contract admin (deployer).
            </p>
            <p style={{ margin: 0 }}>
              <strong>2.</strong> Add candidates using "Add Candidate" — each is stored on-chain with index 0, 1, 2…
            </p>
            <p style={{ margin: 0 }}>
              <strong>3.</strong> Whitelist voter wallets using "Authorize Voter" — paste the voter's MetaMask address.
            </p>
            <p style={{ margin: 0 }}>
              <strong>4.</strong> Voters can now go to the Dashboard and cast their vote with their whitelisted wallet.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}