import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

const P = {
  forestDark:"#0D3B2E", forestMid:"#155E43", forest:"#1D7A56",
  gold:"#D4AF37", goldDark:"#B8962E", goldBorder:"rgba(212,175,55,0.35)",
  bgPage:"#F5F7F0", bgCard:"#FFFFFF", bgMint:"#EDFAF4",
  textPrimary:"#1A2E1F", textSecondary:"#4B6357", textHint:"#8FA899",
  border:"#D6E8DC", borderInput:"#D6E8DC",
  success:"#16A34A", error:"#DC2626",
};

function useWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

export default function Login() {
  const navigate = useNavigate();
  const w = useWidth();
  const isMobile = w < 768;

  const [tab, setTab]           = useState("voter");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(null);
  const [errors, setErrors]     = useState({});
  const [loaded, setLoaded]     = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters required";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userRole", tab);
      navigate(tab === "admin" ? "/admin" : "/dashboard");
    }, 1600);
  };

  const handleMetaMask = async () => {
    try {
      if (!window.ethereum) { alert("MetaMask not found! Please install the MetaMask extension."); return; }
      await window.ethereum.request({ method:"wallet_requestPermissions", params:[{ eth_accounts:{} }] });
      const accounts = await window.ethereum.request({ method:"eth_accounts" });
      if (accounts[0]) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userRole", "voter");
        localStorage.setItem("walletAddress", accounts[0]);
        navigate("/dashboard");
      }
    } catch (err) { console.error(err); alert("MetaMask connection rejected."); }
  };

  const inp = (field) => ({
    width:"100%", padding:"12px 16px", borderRadius:10,
    border:`1.5px solid ${errors[field] ? P.error : focused===field ? P.forest : P.borderInput}`,
    fontSize:14, color:P.textPrimary,
    background: focused===field ? "#F2FAF5" : P.bgCard,
    outline:"none", transition:"all 0.2s",
    boxShadow: focused===field ? "0 0 0 3px rgba(29,122,86,0.12)" : "none",
    fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box",
  });

  return (
    <div style={{
      minHeight:"100vh",
      background:`linear-gradient(145deg, #EEF5EC, ${P.bgPage}, #E8F2E8)`,
      display:"flex", fontFamily:"'DM Sans','Segoe UI',sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── LEFT PANEL — hidden on mobile ── */}
      {!isMobile && (
        <div style={{
          flex:"0 0 42%", background:P.forestDark,
          display:"flex", flexDirection:"column", justifyContent:"space-between",
          padding:"40px 44px", position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:-80, right:-80, width:280, height:280, borderRadius:"50%", background:"rgba(212,175,55,0.06)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-60, left:-60, width:220, height:220, borderRadius:"50%", background:"rgba(212,175,55,0.05)", pointerEvents:"none" }} />

          <div onClick={() => navigate("/")} style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }}>
            <div style={{
              width:38, height:38, borderRadius:"50%",
              background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:800, fontSize:16, color:P.forestDark,
            }}>V</div>
            <span style={{ fontWeight:800, fontSize:21, color:"#fff" }}>VoteChain</span>
          </div>

          <div>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:7,
              background:"rgba(212,175,55,0.12)", border:`1px solid ${P.goldBorder}`,
              borderRadius:20, padding:"5px 14px",
              fontSize:12, fontWeight:700, color:P.gold, marginBottom:22,
            }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:P.success, display:"inline-block" }} />
              Blockchain-Secured Voting System
            </div>
            <h1 style={{ fontSize:36, fontWeight:800, color:"#fff", lineHeight:1.15, letterSpacing:"-1px", marginBottom:14 }}>
              Your vote is your<br />
              <span style={{ color:P.gold }}>voice. Use it.</span>
            </h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.5)", lineHeight:1.75, maxWidth:300, marginBottom:32 }}>
              Cast your ballot with confidence. Every vote is encrypted, immutable, and transparently recorded on Ethereum.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { icon:"🔒", text:"End-to-end encrypted sessions" },
                { icon:"⛓️", text:"On-chain vote verification" },
                { icon:"🛡️", text:"One vote per verified voter" },
              ].map(b => (
                <div key={b.text} style={{
                  display:"flex", alignItems:"center", gap:12,
                  background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:10, padding:"10px 14px",
                }}>
                  <span style={{ fontSize:15 }}>{b.icon}</span>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)", fontWeight:500 }}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>© 2025 VoteChain · Built on Ethereum</p>
        </div>
      )}

      {/* ── RIGHT PANEL / Full-page on mobile ── */}
      <div style={{
        flex:1, display:"flex", alignItems:"center", justifyContent:"center",
        padding: isMobile ? "24px 20px" : "40px 32px",
        overflowY:"auto",
      }}>
        <div style={{
          width:"100%", maxWidth: isMobile ? "100%" : 420,
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition:"opacity 0.5s ease, transform 0.5s ease",
        }}>
          {/* Mobile logo header */}
          {isMobile && (
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div onClick={() => navigate("/")} style={{ display:"inline-flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:8 }}>
                <div style={{
                  width:36, height:36, borderRadius:"50%",
                  background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:800, fontSize:15, color:P.forestDark,
                }}>V</div>
                <span style={{ fontWeight:800, fontSize:20, color:P.forestDark }}>VoteChain</span>
              </div>
            </div>
          )}

          {!isMobile && (
            <button onClick={() => navigate("/")} style={{
              background:"none", border:"none", cursor:"pointer",
              fontSize:13, fontWeight:600, color:P.textSecondary,
              display:"flex", alignItems:"center", gap:6,
              marginBottom:24, padding:0, fontFamily:"'DM Sans',sans-serif",
            }}>← Back to Home</button>
          )}

          <h2 style={{ fontSize: isMobile?26:30, fontWeight:800, color:P.textPrimary, letterSpacing:"-0.7px", marginBottom:6 }}>
            Welcome back 👋
          </h2>
          <p style={{ fontSize:14, color:P.textSecondary, marginBottom:24, lineHeight:1.6 }}>
            Sign in to access the{" "}
            <span style={{ color:P.forest, fontWeight:700 }}>{tab === "voter" ? "Voter" : "Admin"} Portal</span>
          </p>

          {/* Tab switcher */}
          <div style={{ display:"flex", gap:4, background:P.bgMint, borderRadius:12, padding:4, marginBottom:24 }}>
            {[{key:"voter",label:"🗳️  Voter"},{key:"admin",label:"🛡️  Admin"}].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setErrors({}); }} style={{
                flex:1, padding:"10px 0", borderRadius:10, border:"none",
                fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer",
                transition:"all 0.22s ease",
                background: tab===t.key ? `linear-gradient(135deg,${P.forestDark},${P.forestMid})` : "transparent",
                color: tab===t.key ? P.gold : P.textSecondary,
                boxShadow: tab===t.key ? "0 4px 14px rgba(13,59,46,0.25)" : "none",
              }}>{t.label}</button>
            ))}
          </div>

          {/* Email */}
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:P.textPrimary, marginBottom:6 }}>Email address</label>
            <input type="email" placeholder="you@university.edu" value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p=>({...p,email:null})); }}
              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
              style={inp("email")} />
            {errors.email && <p style={{ fontSize:12, color:P.error, marginTop:4, fontWeight:500 }}>⚠ {errors.email}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom:10 }}>
            <label style={{ display:"block", fontSize:13, fontWeight:600, color:P.textPrimary, marginBottom:6 }}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPass?"text":"password"} placeholder="Enter your password" value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p=>({...p,password:null})); }}
                onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                style={{ ...inp("password"), paddingRight:44 }} />
              <button onClick={() => setShowPass(!showPass)} style={{
                position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", fontSize:16, color:P.textSecondary, padding:0,
              }}>{showPass ? "🙈" : "👁️"}</button>
            </div>
            {errors.password && <p style={{ fontSize:12, color:P.error, marginTop:4, fontWeight:500 }}>⚠ {errors.password}</p>}
          </div>

          {/* Remember + Forgot */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <label style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:P.textSecondary, cursor:"pointer", fontWeight:500 }}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                style={{ accentColor:P.forest, width:14, height:14 }} />
              Remember me
            </label>
            <span style={{ fontSize:13, color:P.forest, fontWeight:700, cursor:"pointer" }}>Forgot password?</span>
          </div>

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width:"100%", padding:"14px 0", borderRadius:12, border:"none",
            background:`linear-gradient(135deg,${P.forestDark},${P.forestMid})`,
            color:P.gold, fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:15,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow:"0 6px 18px rgba(13,59,46,0.2)",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:14,
            transition:"all 0.22s ease",
          }}>
            {loading ? (
              <>
                <span style={{ width:18, height:18, border:"2.5px solid rgba(212,175,55,0.4)", borderTopColor:P.gold, borderRadius:"50%", display:"inline-block", animation:"spin 0.75s linear infinite" }} />
                Authenticating...
              </>
            ) : `Sign in as ${tab==="voter"?"Voter":"Admin"} →`}
          </button>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, height:1, background:P.borderInput }} />
            <span style={{ fontSize:12, color:P.textHint, fontWeight:500 }}>or continue with</span>
            <div style={{ flex:1, height:1, background:P.borderInput }} />
          </div>

          {/* MetaMask */}
          <button onClick={handleMetaMask} style={{
            width:"100%", padding:"12px 0", borderRadius:12,
            border:`1.5px solid ${P.border}`, background:P.bgCard, color:P.textPrimary,
            fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:10,
            marginBottom: isMobile?20:28, transition:"all 0.2s ease",
          }}>
            <span style={{ fontSize:18 }}>🦊</span> Connect with MetaMask
          </button>

          <p style={{ textAlign:"center", fontSize:13, color:P.textSecondary, marginBottom:16 }}>
            Don't have an account?{" "}
            <span style={{ color:P.forest, fontWeight:700, cursor:"pointer" }}>Register here</span>
          </p>

          <div style={{
            padding:"12px 14px", borderRadius:10,
            background:"rgba(13,59,46,0.04)", border:`1px solid rgba(13,59,46,0.10)`,
            display:"flex", alignItems:"center", gap:10,
          }}>
            <span style={{ fontSize:15 }}>🔒</span>
            <p style={{ fontSize:12, color:P.forestMid, margin:0, fontWeight:500, lineHeight:1.5 }}>
              Protected by blockchain verification & end-to-end encryption
            </p>
          </div>

          {/* Mobile back link */}
          {isMobile && (
            <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:P.textSecondary }}>
              <span onClick={() => navigate("/")} style={{ color:P.forest, fontWeight:700, cursor:"pointer" }}>← Back to Home</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}