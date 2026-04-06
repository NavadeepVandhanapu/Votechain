import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const P = {
  forestDark:"#0D3B2E", forestMid:"#155E43", forest:"#1D7A56", forestLight:"#2A9968",
  gold:"#D4AF37", goldDark:"#B8962E", goldBorder:"rgba(212,175,55,0.35)", goldSoft:"#FDF3D0",
  bgPage:"#F5F7F0", bgCard:"#FFFFFF", bgMint:"#EDFAF4",
  textPrimary:"#1A2E1F", textSecondary:"#4B6357", textHint:"#8FA899",
  border:"#D6E8DC", borderInput:"#D6E8DC",
  success:"#16A34A", error:"#DC2626", warning:"#D97706",
};

const features = [
  { icon:"⛓️", title:"Immutable Blockchain Records",  desc:"Every vote is permanently stored on Ethereum. No tampering, no deletion — ever." },
  { icon:"🦊", title:"MetaMask Wallet Integration",    desc:"Voters sign transactions directly from their wallet. Your identity, your key." },
  { icon:"✅", title:"One Vote Enforcement",           desc:"Smart contracts guarantee one vote per verified voter, enforced at the chain level." },
  { icon:"📊", title:"Real-Time Results",              desc:"Live vote tallies with beautiful charts. Transparent from the first ballot to the last." },
  { icon:"🛡️", title:"Admin Control Panel",           desc:"Full election lifecycle management — create, start, pause, and close elections with ease." },
  { icon:"🔍", title:"Public Audit Trail",             desc:"Anyone can verify any vote on-chain using a unique transaction hash receipt." },
];
const steps = [
  { n:"01", title:"Register & Get Verified",  desc:"Sign up with your details and await admin approval before you can participate." },
  { n:"02", title:"Connect Your Wallet",       desc:"Link MetaMask to your account to enable your blockchain identity for voting." },
  { n:"03", title:"Cast Your Vote",            desc:"Choose your candidate and sign the transaction — your vote is locked on-chain." },
  { n:"04", title:"Verify Anytime",            desc:"Use your TX hash receipt to independently verify your vote on the blockchain." },
];
const stats = [
  { value:"100%", label:"Tamper-proof" },
  { value:"0",    label:"Double votes possible" },
  { value:"∞",    label:"Publicly auditable" },
  { value:"24/7", label:"On-chain availability" },
];

function useWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

export default function Landing() {
  const navigate = useNavigate();
  const w = useWidth();
  const isMobile = w < 768;
  const isTablet = w < 1024;

  const [loaded, setLoaded]         = useState(false);
  const [hovCard, setHovCard]       = useState(null);
  const [hovStep, setHovStep]       = useState(null);
  const [scrolled, setScrolled]     = useState(false);
  const [account, setAccount]       = useState(null);
  const [menuOpen, setMenuOpen]     = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) { alert("Please install MetaMask"); return; }
      await window.ethereum.request({ method:"wallet_requestPermissions", params:[{ eth_accounts:{} }] });
      const accounts = await window.ethereum.request({ method:"eth_accounts" });
      if (accounts[0]) { setAccount(accounts[0]); localStorage.setItem("walletAddress", accounts[0]); }
    } catch (err) { console.error(err); }
  };

  const px = isMobile ? "20px" : isTablet ? "32px" : "56px";

  return (
    <div style={{ minHeight:"100vh", background:P.bgPage, fontFamily:"'DM Sans','Segoe UI',sans-serif", color:P.textPrimary, overflowX:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:`0 ${px}`, height:64,
        background: scrolled ? "rgba(255,255,255,0.96)" : P.bgCard,
        boxShadow: scrolled ? `0 2px 24px rgba(13,59,46,0.10)` : `0 1px 0 ${P.border}`,
        position:"sticky", top:0, zIndex:200,
        backdropFilter: scrolled ? "blur(10px)" : "none",
        transition:"all 0.3s ease",
      }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={() => navigate("/")}>
          <div style={{
            width:34, height:34, borderRadius:"50%",
            background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:800, fontSize:14, color:P.forestDark,
            boxShadow:"0 3px 12px rgba(212,175,55,0.35)", flexShrink:0,
          }}>V</div>
          <span style={{ fontWeight:800, fontSize:isMobile?17:20, color:P.forestDark, letterSpacing:"-0.3px" }}>VoteChain</span>
        </div>

        {/* Desktop nav links */}
        {!isMobile && (
          <ul style={{ display:"flex", alignItems:"center", gap:32, listStyle:"none", margin:0, padding:0 }}>
            {["Features","How it works","About"].map(l => (
              <li key={l}>
                <span style={{ fontSize:14, fontWeight:600, cursor:"pointer", color:P.textSecondary, transition:"color 0.2s" }}
                  onMouseEnter={e => e.target.style.color=P.forest}
                  onMouseLeave={e => e.target.style.color=P.textSecondary}
                >{l}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Right side */}
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {!isMobile && (
            <button onClick={() => navigate("/login")} style={{
              padding:"8px 18px", borderRadius:10,
              border:`1.5px solid ${P.border}`, background:"transparent", color:P.forestMid,
              fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, cursor:"pointer",
            }}>Sign In</button>
          )}

          {account ? (
            <span style={{
              fontSize:12, fontWeight:600, color:P.forestMid,
              background:P.bgMint, padding:"6px 12px", borderRadius:20, border:`1px solid ${P.border}`,
              whiteSpace:"nowrap",
            }}>🦊 {account.slice(0,6)}...{account.slice(-4)}</span>
          ) : (
            <button onClick={connectWallet} style={{
              padding:isMobile?"8px 14px":"9px 20px", borderRadius:10, border:"none",
              background:`linear-gradient(135deg,${P.forestDark},${P.forestMid})`,
              color:P.gold, fontFamily:"'DM Sans',sans-serif",
              fontWeight:700, fontSize:isMobile?13:14, cursor:"pointer",
              boxShadow:"0 4px 12px rgba(13,59,46,0.18)", whiteSpace:"nowrap",
            }}>{isMobile ? "Connect" : "Connect Wallet"}</button>
          )}

          {/* Hamburger */}
          {isMobile && (
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background:"none", border:`1px solid ${P.border}`, borderRadius:8,
              padding:"6px 10px", cursor:"pointer", color:P.forestDark, fontSize:18, lineHeight:1,
            }}>☰</button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={{
          position:"fixed", top:64, left:0, right:0, zIndex:190,
          background:P.bgCard, borderBottom:`1px solid ${P.border}`,
          boxShadow:"0 8px 24px rgba(13,59,46,0.10)",
          animation:"fadeDown 0.2s ease",
          padding:"16px 20px",
        }}>
          {["Features","How it works","About"].map(l => (
            <div key={l} style={{
              padding:"12px 0", fontSize:15, fontWeight:600, color:P.textPrimary,
              borderBottom:`1px solid ${P.border}`, cursor:"pointer",
            }} onClick={() => setMenuOpen(false)}>{l}</div>
          ))}
          <button onClick={() => { setMenuOpen(false); navigate("/login"); }} style={{
            display:"block", width:"100%", marginTop:14, padding:"12px",
            borderRadius:10, background:`linear-gradient(135deg,${P.forestDark},${P.forestMid})`,
            color:P.gold, border:"none", fontWeight:700, fontSize:15, cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif",
          }}>Sign In →</button>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{
        maxWidth:1100, margin:"0 auto",
        padding: isMobile ? "48px 20px 40px" : isTablet ? "60px 32px 52px" : "88px 56px 72px",
        display:"flex", alignItems:"center", gap: isMobile ? 0 : 56,
        flexDirection: isMobile ? "column" : "row",
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(28px)",
        transition:"opacity 0.65s ease, transform 0.65s ease",
      }}>
        <div style={{ flex:1, textAlign: isMobile ? "center" : "left" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:7,
            background:"rgba(212,175,55,0.10)", border:`1px solid ${P.goldBorder}`,
            borderRadius:20, padding:"5px 14px",
            fontSize:11, fontWeight:700, color:P.goldDark, marginBottom:20,
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:P.success, display:"inline-block" }} />
            Live on Ethereum · Academic Edition
          </div>

          <h1 style={{
            fontSize: isMobile ? 36 : isTablet ? 44 : 54,
            fontWeight:800, lineHeight:1.1, letterSpacing:"-1.5px",
            color:P.forestDark, marginBottom:18,
          }}>
            Democracy,<br />
            <span style={{ background:`linear-gradient(135deg,${P.gold},${P.goldDark})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Secured Forever</span>
            <br />on the Blockchain.
          </h1>

          <p style={{ fontSize: isMobile?15:17, color:P.textSecondary, lineHeight:1.75, maxWidth:480, marginBottom:32, margin: isMobile?"0 auto 32px":"0 0 32px" }}>
            Cast your ballot with complete confidence. Every vote is immutably
            recorded, publicly verifiable, and tamper-proof — powered by Ethereum smart contracts.
          </p>

          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:32, justifyContent: isMobile?"center":"flex-start" }}>
            <button onClick={() => navigate("/login")} style={{
              padding: isMobile?"13px 24px":"14px 32px", borderRadius:12, border:"none",
              background:`linear-gradient(135deg,${P.forestDark},${P.forestMid})`,
              color:P.gold, fontFamily:"'DM Sans',sans-serif",
              fontWeight:800, fontSize: isMobile?15:16, cursor:"pointer",
              boxShadow:"0 6px 20px rgba(13,59,46,0.22)",
            }}>🗳️ Start Voting Now</button>
            <button onClick={() => navigate("/results")} style={{
              padding: isMobile?"13px 20px":"14px 28px", borderRadius:12,
              border:`1.5px solid ${P.border}`, background:P.bgCard, color:P.forestMid,
              fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize: isMobile?15:16, cursor:"pointer",
            }}>📊 Live Results</button>
          </div>

          <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent: isMobile?"center":"flex-start" }}>
            {[{icon:"🔒",label:"End-to-end encrypted"},{icon:"⛓️",label:"On-chain verified"},{icon:"👁️",label:"Publicly auditable"}].map(b => (
              <div key={b.label} style={{
                display:"flex", alignItems:"center", gap:6,
                background:P.bgCard, border:`1px solid ${P.border}`,
                borderRadius:20, padding:"6px 14px",
                fontSize:12, fontWeight:600, color:P.textSecondary,
              }}>
                <span style={{ fontSize:13 }}>{b.icon}</span>{b.label}
              </div>
            ))}
          </div>
        </div>

        {/* Election card — hidden on mobile */}
        {!isMobile && (
          <div style={{ flex:"0 0 340px" }}>
            <div style={{
              background:P.forestDark, borderRadius:22, padding:"28px 24px",
              boxShadow:"0 28px 56px rgba(13,59,46,0.28)", position:"relative", overflow:"hidden",
            }}>
              <div style={{ position:"absolute", top:-40, right:-40, width:160, height:160, borderRadius:"50%", background:"rgba(212,175,55,0.07)", pointerEvents:"none" }} />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <span style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.45)" }}>ELECTION 2025</span>
                <span style={{ background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, color:"#4ade80" }}>● LIVE</span>
              </div>
              <h3 style={{ fontSize:18, fontWeight:800, color:"#fff", marginBottom:4 }}>Student Council Election</h3>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", marginBottom:24 }}>Cast your vote before Dec 31, 2025</p>
              {[{name:"Arjun Sharma",pct:58},{name:"Priya Nair",pct:42}].map((c,i)=>(
                <div key={i} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{c.name}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:P.gold }}>{c.pct}%</span>
                  </div>
                  <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:5, height:7, overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:5, background:`linear-gradient(90deg,${P.gold},${P.goldDark})`, width:`${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── STATS BAR ── */}
      <div style={{
        background:P.bgCard, borderTop:`1px solid ${P.border}`, borderBottom:`1px solid ${P.border}`,
        padding: isMobile ? "20px" : "24px 56px",
        display:"grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)",
        gap: isMobile ? "16px" : "0",
      }}>
        {stats.map(s => (
          <div key={s.label} style={{ textAlign:"center", padding: isMobile?"8px 0":"0" }}>
            <span style={{
              display:"block", fontSize: isMobile?24:28, fontWeight:800,
              background:`linear-gradient(135deg,${P.forestDark},${P.forest})`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>{s.value}</span>
            <span style={{ fontSize:12, color:P.textSecondary, fontWeight:500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding: isMobile?"48px 20px":isTablet?"56px 32px":"80px 56px" }}>
        <div style={{ marginBottom:40, textAlign: isMobile?"center":"left" }}>
          <span style={{
            display:"inline-block", background:"rgba(212,175,55,0.10)", border:`1px solid ${P.goldBorder}`,
            borderRadius:20, padding:"4px 14px", fontSize:11, fontWeight:700, color:P.goldDark,
            letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12,
          }}>Features</span>
          <h2 style={{ fontSize: isMobile?26:isTablet?30:36, fontWeight:800, color:P.forestDark, letterSpacing:"-0.8px", marginBottom:10 }}>
            Everything you need to vote<br />with confidence
          </h2>
          <p style={{ fontSize:15, color:P.textSecondary, maxWidth:480, lineHeight:1.7, margin: isMobile?"0 auto":"0" }}>
            Built with enterprise-grade security and blockchain transparency at every layer.
          </p>
        </div>
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)",
          gap:18,
        }}>
          {features.map((f,i) => (
            <div key={i}
              onMouseEnter={() => setHovCard(i)} onMouseLeave={() => setHovCard(null)}
              style={{
                background:P.bgCard, borderRadius:16, padding:"24px 20px",
                border:`1.5px solid ${hovCard===i ? P.forest : P.border}`,
                boxShadow: hovCard===i ? "0 20px 40px rgba(13,59,46,0.12)" : "0 4px 16px rgba(13,59,46,0.05)",
                transform: hovCard===i ? "translateY(-4px)" : "none",
                transition:"all 0.25s ease",
              }}
            >
              <div style={{
                width:48, height:48, borderRadius:12,
                background: hovCard===i ? "rgba(13,59,46,0.08)" : P.bgMint,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:22, marginBottom:14,
              }}>{f.icon}</div>
              <h3 style={{ fontSize:16, fontWeight:700, color:P.forestDark, marginBottom:7 }}>{f.title}</h3>
              <p style={{ fontSize:13, color:P.textSecondary, lineHeight:1.65, margin:0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        background:`linear-gradient(135deg,${P.forestDark},${P.forestMid})`,
        padding: isMobile?"48px 20px":isTablet?"60px 32px":"80px 56px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ marginBottom:40, textAlign: isMobile?"center":"left" }}>
            <span style={{
              display:"inline-block", background:"rgba(212,175,55,0.12)", border:`1px solid ${P.goldBorder}`,
              borderRadius:20, padding:"4px 14px", fontSize:11, fontWeight:700, color:P.gold,
              letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:12,
            }}>How it works</span>
            <h2 style={{ fontSize: isMobile?26:isTablet?30:36, fontWeight:800, color:"#fff", letterSpacing:"-0.8px", marginBottom:10 }}>Vote in 4 simple steps</h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", maxWidth:460, lineHeight:1.7, margin: isMobile?"0 auto":"0" }}>
              From registration to blockchain verification — intuitive, transparent, and secure.
            </p>
          </div>
          <div style={{
            display:"grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "repeat(4,1fr)",
            gap:16,
          }}>
            {steps.map((s,i) => (
              <div key={i}
                onMouseEnter={() => setHovStep(i)} onMouseLeave={() => setHovStep(null)}
                style={{
                  background: hovStep===i ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
                  border:`1px solid ${hovStep===i ? P.goldBorder : "rgba(255,255,255,0.1)"}`,
                  borderRadius:14, padding: isMobile?"20px 16px":"24px 20px",
                  transition:"all 0.25s ease",
                }}
              >
                <div style={{
                  width:42, height:42, borderRadius:"50%",
                  background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:800, fontSize:14, color:P.forestDark, marginBottom:14,
                }}>{s.n}</div>
                <h3 style={{ fontSize:14, fontWeight:700, color:"#fff", marginBottom:6 }}>{s.title}</h3>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.6, margin:0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: isMobile?"40px 20px":isTablet?"56px 32px":"80px 56px" }}>
        <div style={{
          maxWidth:860, margin:"0 auto", background:P.bgCard,
          borderRadius:22, padding: isMobile?"36px 24px":isTablet?"48px 36px":"56px 52px",
          textAlign:"center", border:`1.5px solid ${P.border}`,
          boxShadow:"0 24px 56px rgba(13,59,46,0.08)", position:"relative", overflow:"hidden",
        }}>
          <h2 style={{ fontSize: isMobile?28:isTablet?32:38, fontWeight:800, color:P.forestDark, letterSpacing:"-0.9px", marginBottom:12 }}>
            Ready to make your{" "}
            <span style={{ background:`linear-gradient(135deg,${P.gold},${P.goldDark})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              voice count?
            </span>
          </h2>
          <p style={{ fontSize:15, color:P.textSecondary, lineHeight:1.75, maxWidth:440, margin:"0 auto 28px" }}>
            Join thousands of verified voters. Your ballot is permanent, private, and verifiable — recorded forever on the blockchain.
          </p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => navigate("/login")} style={{
              padding: isMobile?"13px 24px":"14px 32px", borderRadius:12, border:"none",
              background:`linear-gradient(135deg,${P.forestDark},${P.forestMid})`,
              color:P.gold, fontFamily:"'DM Sans',sans-serif",
              fontWeight:800, fontSize: isMobile?15:16, cursor:"pointer",
            }}>🗳️ Register to Vote Now</button>
            <button onClick={() => navigate("/results")} style={{
              padding: isMobile?"13px 20px":"14px 24px", borderRadius:12,
              border:`1.5px solid ${P.border}`, background:"transparent", color:P.forestMid,
              fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize: isMobile?15:16, cursor:"pointer",
            }}>View Live Results →</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background:P.forestDark,
        padding: isMobile ? "28px 20px" : "32px 56px",
        display:"flex", flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent:"space-between", gap:16,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{
            width:28, height:28, borderRadius:"50%",
            background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:800, fontSize:12, color:P.forestDark,
          }}>V</div>
          <span style={{ fontWeight:800, fontSize:16, color:"#fff" }}>VoteChain</span>
        </div>
        <ul style={{ display:"flex", gap:16, listStyle:"none", margin:0, padding:0, flexWrap:"wrap" }}>
          {["Privacy Policy","Terms of Use","Contact","GitHub"].map(l => (
            <li key={l}><span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", cursor:"pointer", fontWeight:500 }}>{l}</span></li>
          ))}
        </ul>
        <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>© 2025 VoteChain · Built on Ethereum</span>
      </footer>
    </div>
  );
}