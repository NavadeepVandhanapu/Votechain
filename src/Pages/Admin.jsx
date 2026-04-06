import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../abi/Voting.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const P = {
  forestDark:"#0D3B2E", forestMid:"#155E43", forest:"#1D7A56",
  gold:"#D4AF37", goldDark:"#B8962E", goldBorder:"rgba(212,175,55,0.35)",
  bgPage:"#F5F7F0", bgCard:"#FFFFFF", bgMint:"#EDFAF4",
  textPrimary:"#1A2E1F", textSecondary:"#4B6357", textHint:"#8FA899",
  border:"#D6E8DC", borderInput:"#D6E8DC",
  success:"#16A34A", successBg:"#F0FDF4",
  error:"#DC2626", errorBg:"#FEF2F2",
  info:"#2563EB", infoBg:"#EFF6FF",
};
const G    = { primary:`linear-gradient(135deg, ${P.forestDark}, ${P.forestMid})` };
const S    = { card:"0 4px 16px rgba(13,59,46,0.06)", btn:"0 6px 20px rgba(13,59,46,0.22)" };
const R    = { card:16, pill:20, btn:12 };
const FONT = "'DM Sans','Segoe UI',sans-serif";

function useWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

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

export default function Admin() {
  const navigate = useNavigate();
  const w = useWidth();
  const isMobile = w < 768;
  const isTablet = w < 1024;

  const [walletAddress, setWalletAddress]     = useState("");
  const [isAdmin, setIsAdmin]                 = useState(null);
  const [candidates, setCandidates]           = useState([]);
  const [loaded, setLoaded]                   = useState(false);
  const [toast, setToast]                     = useState(null);
  const [candidateName, setCandidateName]     = useState("");
  const [manifesto, setManifesto]             = useState("");
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [voterAddress, setVoterAddress]       = useState("");
  const [addingVoter, setAddingVoter]         = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("loggedIn"))            { navigate("/"); return; }
    if (localStorage.getItem("userRole") !== "admin") { navigate("/dashboard"); return; }
    const stored = localStorage.getItem("walletAddress");
    if (stored) { setWalletAddress(stored); verifyAdmin(stored); }
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const verifyAdmin = async (wallet) => {
    try {
      const contract      = await getReadContract();
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
        list.push({ id:i, name, voteCount:Number(voteCount) });
      }
      setCandidates(list);
    } catch (err) { console.error(err); }
  };

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) { alert("Install MetaMask!"); return; }
      await window.ethereum.request({ method:"wallet_requestPermissions", params:[{ eth_accounts:{} }] });
      const accounts = await window.ethereum.request({ method:"eth_accounts" });
      if (!accounts[0]) return;
      const addr = accounts[0];
      setWalletAddress(addr);
      localStorage.setItem("walletAddress", addr);
      verifyAdmin(addr);
    } catch (err) { showToast("❌ Wallet connection rejected.", "error"); }
  };

  const handleAddCandidate = async () => {
    if (!candidateName.trim()) { showToast("⚠️ Enter a candidate name.", "error"); return; }
    setAddingCandidate(true);
    try {
      const contract = await getWriteContract();
      showToast("⏳ Sending transaction...", "info");
      const tx = await contract.addCandidate(candidateName.trim());
      await tx.wait();
      if (manifesto.trim()) {
        const stored = JSON.parse(localStorage.getItem("manifestos") || "{}");
        stored[candidateName.trim()] = manifesto.trim();
        localStorage.setItem("manifestos", JSON.stringify(stored));
      }
      setCandidateName(""); setManifesto("");
      showToast(`✅ "${candidateName.trim()}" added!`, "success");
      const rc = await getReadContract(); fetchCandidates(rc);
    } catch (err) {
      console.error(err);
      if (err.reason==="Not admin") showToast("❌ Your wallet is not the contract admin.", "error");
      else showToast("❌ Transaction failed.", "error");
    } finally { setAddingCandidate(false); }
  };

  const handleAddVoter = async () => {
    if (!voterAddress.trim()) { showToast("⚠️ Enter a voter wallet address.", "error"); return; }
    if (!ethers.isAddress(voterAddress.trim())) { showToast("⚠️ Invalid Ethereum address.", "error"); return; }
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
      if (err.reason==="Not admin") showToast("❌ Your wallet is not the contract admin.", "error");
      else showToast("❌ Transaction failed.", "error");
    } finally { setAddingVoter(false); }
  };

  const inp = () => ({
    width:"100%", padding:"12px 14px", borderRadius:R.btn,
    border:`1.5px solid ${P.borderInput}`,
    fontSize:14, color:P.textPrimary, background:P.bgCard, outline:"none",
    fontFamily:FONT, boxSizing:"border-box",
    // touch-friendly minimum height
    minHeight:44,
  });

  const px = isMobile ? "16px" : isTablet ? "28px" : "48px";

  return (
    <div style={{ minHeight:"100vh", background:`linear-gradient(145deg,#EEF5EC,${P.bgPage})`, fontFamily:FONT }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing:border-box; }
        @keyframes slideIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background:P.forestDark,
        padding: isMobile ? "12px 16px" : `14px ${px}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:"0 2px 16px rgba(0,0,0,0.15)",
        position:"sticky", top:0, zIndex:100,
        flexWrap:"wrap", gap:10,
      }}>
        <div onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
          <div style={{
            width:32, height:32, borderRadius:"50%",
            background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:800, fontSize:13, color:P.forestDark, flexShrink:0,
          }}>V</div>
          <span style={{ fontWeight:800, fontSize: isMobile?16:18, color:"#fff" }}>VoteChain</span>
          {!isMobile && (
            <span style={{
              background:"rgba(212,175,55,0.15)", border:`1px solid ${P.goldBorder}`,
              borderRadius:R.pill, padding:"3px 10px",
              fontSize:11, fontWeight:700, color:P.gold, marginLeft:6,
            }}>Admin Panel</span>
          )}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          {walletAddress ? (
            <div style={{
              background:"rgba(212,175,55,0.12)", border:`1px solid ${P.goldBorder}`,
              borderRadius:R.pill, padding:"5px 12px",
              fontSize:11, fontWeight:600, color:P.gold,
              display:"flex", alignItems:"center", gap:5,
            }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:P.success,display:"inline-block" }} />
              {isMobile ? `${walletAddress.slice(0,4)}...${walletAddress.slice(-3)}` : `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}`}
            </div>
          ) : (
            <button onClick={connectWallet} style={{
              padding: isMobile?"7px 12px":"8px 18px", borderRadius:R.btn, border:"none",
              background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
              color:P.forestDark, fontFamily:FONT, fontWeight:700, fontSize: isMobile?12:13, cursor:"pointer",
            }}>{isMobile?"Connect":"🦊 Connect Wallet"}</button>
          )}
          <button onClick={() => { localStorage.clear(); navigate("/"); }} style={{
            padding: isMobile?"7px 10px":"8px 14px", borderRadius:R.btn,
            border:"1px solid rgba(255,255,255,0.15)",
            background:"transparent", color:"rgba(255,255,255,0.6)",
            fontFamily:FONT, fontWeight:600, fontSize: isMobile?12:13, cursor:"pointer",
          }}>Logout</button>
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top: isMobile?70:80, right:isMobile?12:24, left:isMobile?12:"auto",
          zIndex:999,
          background: toast.type==="success" ? P.successBg : toast.type==="info" ? P.infoBg : P.errorBg,
          border:`1px solid ${toast.type==="success" ? P.success : toast.type==="info" ? P.info : P.error}`,
          color: toast.type==="success" ? "#15803D" : toast.type==="info" ? P.info : P.error,
          borderRadius:R.card, padding:"12px 16px",
          fontSize:13, fontWeight:600, boxShadow:"0 8px 24px rgba(0,0,0,0.12)",
          animation:"slideIn 0.3s ease",
        }}>{toast.msg}</div>
      )}

      <main style={{
        maxWidth:900, margin:"0 auto",
        padding: isMobile?"24px 16px":isTablet?"32px 28px":"40px 48px",
        opacity: loaded?1:0, transform: loaded?"translateY(0)":"translateY(20px)",
        transition:"opacity 0.5s ease, transform 0.5s ease",
      }}>

        {/* Page header */}
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize: isMobile?24:28, fontWeight:800, color:P.textPrimary, letterSpacing:"-0.7px", margin:0, marginBottom:4 }}>
            🛡️ Admin Control Panel
          </h1>
          <p style={{ fontSize:14, color:P.textSecondary, margin:0 }}>Manage candidates and authorize voters on the blockchain.</p>
        </div>

        {/* Wallet not connected */}
        {!walletAddress && (
          <div style={{
            background:"#FFFBEB", border:"1px solid #FCD34D",
            borderRadius:R.card, padding:"16px 20px", marginBottom:24,
            display:"flex", alignItems: isMobile?"flex-start":"center",
            justifyContent:"space-between", gap:12, flexDirection: isMobile?"column":"row",
          }}>
            <div>
              <p style={{ fontWeight:700, color:"#92400E", margin:0 }}>⚠️ Wallet not connected</p>
              <p style={{ fontSize:13, color:"#92400E", margin:0, marginTop:3, opacity:0.8 }}>Connect your admin wallet to perform actions.</p>
            </div>
            <button onClick={connectWallet} style={{
              padding:"10px 18px", borderRadius:R.btn, border:"none",
              background:G.primary, color:P.gold,
              fontFamily:FONT, fontWeight:700, fontSize:13, cursor:"pointer",
              flexShrink:0, alignSelf: isMobile?"flex-start":"auto",
            }}>🦊 Connect Wallet</button>
          </div>
        )}

        {/* Not admin warning */}
        {walletAddress && isAdmin===false && (
          <div style={{
            background:P.errorBg, border:`1px solid ${P.error}55`,
            borderRadius:R.card, padding:"16px 20px", marginBottom:24,
          }}>
            <p style={{ fontWeight:700, color:P.error, margin:0 }}>🚫 Access Denied</p>
            <p style={{ fontSize:13, color:P.error, margin:"6px 0 0", opacity:0.85, wordBreak:"break-all" }}>
              Your wallet (<code style={{ fontSize:11 }}>{walletAddress}</code>) is not the contract admin.
            </p>
          </div>
        )}

        {/* Admin verified */}
        {walletAddress && isAdmin===true && (
          <div style={{
            background:P.successBg, border:`1px solid ${P.success}55`,
            borderRadius:R.card, padding:"12px 18px", marginBottom:24,
            display:"flex", alignItems:"center", gap:8,
            fontSize:13, fontWeight:600, color:"#15803D",
          }}>
            ✅ Admin verified — your wallet matches the contract deployer.
          </div>
        )}

        {/* 2-col → 1-col grid */}
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap:20,
        }}>
          {/* Add Candidate */}
          <div style={{ background:P.bgCard, borderRadius:R.card, border:`1px solid ${P.border}`, padding:"24px 20px", boxShadow:S.card }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <span style={{ fontSize:20 }}>🧑‍🤝‍🧑</span>
              <h2 style={{ fontSize:16, fontWeight:800, color:P.textPrimary, margin:0 }}>Add Candidate</h2>
            </div>
            <p style={{ fontSize:12, color:P.textSecondary, marginBottom:16, marginTop:4, lineHeight:1.5 }}>
              Calls <code>addCandidate()</code> on the contract.
            </p>
            <input type="text" placeholder="Candidate full name" value={candidateName}
              onChange={e => setCandidateName(e.target.value)}
              onKeyDown={e => e.key==="Enter" && handleAddCandidate()}
              style={inp()} />
            <div style={{ marginTop:10 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:P.textSecondary, marginBottom:5 }}>
                Manifesto <span style={{ fontWeight:400, color:P.textHint }}>(optional)</span>
              </label>
              <textarea placeholder="What does this candidate stand for?"
                value={manifesto} onChange={e => setManifesto(e.target.value)} maxLength={400} rows={3}
                style={{
                  width:"100%", padding:"10px 12px", borderRadius:10,
                  border:`1.5px solid ${P.borderInput}`,
                  fontSize:13, color:P.textPrimary, fontFamily:FONT,
                  resize:"vertical", outline:"none", boxSizing:"border-box", lineHeight:1.6,
                }} />
              <p style={{ fontSize:11, color:P.textHint, textAlign:"right", margin:"3px 0 0" }}>{manifesto.length}/400</p>
            </div>
            <button onClick={handleAddCandidate} disabled={addingCandidate || isAdmin!==true} style={{
              width:"100%", marginTop:10, padding:"13px 0", borderRadius:R.btn, border:"none",
              background: isAdmin===true ? G.primary : "#E5E7EB",
              color: isAdmin===true ? P.gold : "#9CA3AF",
              fontFamily:FONT, fontWeight:700, fontSize:14,
              cursor: isAdmin===true&&!addingCandidate ? "pointer" : "not-allowed",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s",
              minHeight:46,
            }}>
              {addingCandidate ? (
                <><span style={{ width:16,height:16,border:"2px solid rgba(212,175,55,0.4)",borderTopColor:P.gold,borderRadius:"50%",display:"inline-block",animation:"spin 0.75s linear infinite" }} /> Adding...</>
              ) : "+ Add Candidate"}
            </button>
          </div>

          {/* Whitelist Voter */}
          <div style={{ background:P.bgCard, borderRadius:R.card, border:`1px solid ${P.border}`, padding:"24px 20px", boxShadow:S.card }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <span style={{ fontSize:20 }}>✅</span>
              <h2 style={{ fontSize:16, fontWeight:800, color:P.textPrimary, margin:0 }}>Whitelist Voter</h2>
            </div>
            <p style={{ fontSize:12, color:P.textSecondary, marginBottom:16, marginTop:4, lineHeight:1.5 }}>
              Calls <code>addVoter(address)</code> on the contract.
            </p>
            <input type="text" placeholder="0x... voter wallet address" value={voterAddress}
              onChange={e => setVoterAddress(e.target.value)}
              onKeyDown={e => e.key==="Enter" && handleAddVoter()}
              style={{ ...inp(), fontFamily:"monospace", fontSize:13 }} />
            <button onClick={handleAddVoter} disabled={addingVoter || isAdmin!==true} style={{
              width:"100%", marginTop:12, padding:"13px 0", borderRadius:R.btn, border:"none",
              background: isAdmin===true ? G.primary : "#E5E7EB",
              color: isAdmin===true ? P.gold : "#9CA3AF",
              fontFamily:FONT, fontWeight:700, fontSize:14,
              cursor: isAdmin===true&&!addingVoter ? "pointer" : "not-allowed",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s",
              minHeight:46,
            }}>
              {addingVoter ? (
                <><span style={{ width:16,height:16,border:"2px solid rgba(212,175,55,0.4)",borderTopColor:P.gold,borderRadius:"50%",display:"inline-block",animation:"spin 0.75s linear infinite" }} /> Whitelisting...</>
              ) : "🔓 Authorize Voter"}
            </button>
          </div>
        </div>

        {/* Candidates Table — scrollable on mobile */}
        <div style={{ marginTop:24, background:P.bgCard, borderRadius:R.card, border:`1px solid ${P.border}`, padding: isMobile?"16px":"24px", boxShadow:S.card }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <h2 style={{ fontSize: isMobile?15:17, fontWeight:800, color:P.textPrimary, margin:0 }}>
              📋 Candidates ({candidates.length})
            </h2>
            <button onClick={async () => { const rc = await getReadContract(); fetchCandidates(rc); }} style={{
              padding:"6px 12px", borderRadius:R.btn, border:`1px solid ${P.border}`, background:P.bgCard,
              color:P.textSecondary, fontFamily:FONT, fontWeight:600, fontSize:12, cursor:"pointer",
            }}>🔄 Refresh</button>
          </div>

          {candidates.length===0 ? (
            <div style={{ textAlign:"center", padding:"28px 0", color:P.textHint, fontSize:14 }}>No candidates added yet.</div>
          ) : (
            /* Horizontal scroll wrapper for mobile */
            <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth: isMobile?420:0 }}>
                <thead>
                  <tr style={{ borderBottom:`2px solid ${P.border}` }}>
                    {["#","Name","Manifesto","Votes"].map(h => (
                      <th key={h} style={{
                        textAlign:"left", padding:"10px 12px",
                        fontSize:11, fontWeight:700, color:P.textHint,
                        textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c.id} style={{ borderBottom:`1px solid ${P.border}` }}>
                      <td style={{ padding:"12px", fontSize:13, color:P.textHint, fontWeight:600 }}>{c.id}</td>
                      <td style={{ padding:"12px", fontSize:13, fontWeight:700, color:P.textPrimary, whiteSpace:"nowrap" }}>{c.name}</td>
                      <td style={{ padding:"12px", fontSize:12, color:P.textSecondary, maxWidth:180 }}>
                        {(() => {
                          const m = JSON.parse(localStorage.getItem("manifestos")||"{}")[c.name];
                          return m
                            ? <span title={m}>{m.length>50 ? m.slice(0,50)+"…" : m}</span>
                            : <span style={{ color:P.textHint, fontStyle:"italic" }}>No manifesto</span>;
                        })()}
                      </td>
                      <td style={{ padding:"12px" }}>
                        <span style={{
                          background:P.bgMint, color:P.forest,
                          borderRadius:R.pill, padding:"3px 10px",
                          fontSize:12, fontWeight:700, whiteSpace:"nowrap",
                        }}>{c.voteCount} votes</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* How it works */}
        <div style={{ marginTop:20, padding: isMobile?"16px":"20px 24px", background:P.infoBg, borderRadius:R.card, border:`1px solid ${P.info}22` }}>
          <p style={{ fontWeight:700, color:P.info, margin:0, marginBottom:8, fontSize:14 }}>ℹ️ How the admin flow works</p>
          <div style={{ fontSize:13, color:P.textSecondary, lineHeight:1.8 }}>
            <p style={{ margin:0 }}><strong>1.</strong> Connect with the <strong>Hardhat Account #0</strong> (deployer = contract admin).</p>
            <p style={{ margin:0 }}><strong>2.</strong> Add candidates — each stored on-chain with index 0, 1, 2…</p>
            <p style={{ margin:0 }}><strong>3.</strong> Whitelist voter wallets — paste the voter's MetaMask address.</p>
            <p style={{ margin:0 }}><strong>4.</strong> Voters go to Dashboard, connect their whitelisted wallet, and cast their vote.</p>
          </div>
        </div>

      </main>
    </div>
  );
}