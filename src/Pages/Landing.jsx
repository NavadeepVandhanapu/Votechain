import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const P = {
  forestDark:    "#0D3B2E",
  forestMid:     "#155E43",
  forest:        "#1D7A56",
  forestLight:   "#2A9968",
  gold:          "#D4AF37",
  goldDark:      "#B8962E",
  goldBorder:    "rgba(212,175,55,0.35)",
  goldSoft:      "#FDF3D0",
  bgPage:        "#F5F7F0",
  bgCard:        "#FFFFFF",
  bgMint:        "#EDFAF4",
  textPrimary:   "#1A2E1F",
  textSecondary: "#4B6357",
  textHint:      "#8FA899",
  border:        "#D6E8DC",
  borderInput:   "#D6E8DC",
  success:       "#16A34A",
  error:         "#DC2626",
  warning:       "#D97706",
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
  { value:"100%", label:"Tamper-proof"          },
  { value:"0",    label:"Double votes possible" },
  { value:"∞",    label:"Publicly auditable"    },
  { value:"24/7", label:"On-chain availability" },
];

export default function Landing() {
  const navigate = useNavigate();

  const [loaded, setLoaded]         = useState(false);
  const [hovCard, setHovCard]       = useState(null);
  const [hovStep, setHovStep]       = useState(null);
  const [navHov, setNavHov]         = useState(null);
  const [primaryHov, setPrimaryHov] = useState(false);
  const [secondHov, setSecondHov]   = useState(false);
  const [ctaHov, setCtaHov]         = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [account, setAccount]       = useState(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Connect wallet ──
  // wallet_requestPermissions forces the MetaMask account picker to appear
  // every time — the user explicitly chooses which wallet to connect.
  const connectWallet = async () => {
    try {
      if (!window.ethereum) { alert("Please install MetaMask"); return; }

      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts[0]) {
        setAccount(accounts[0]);
        localStorage.setItem("walletAddress", accounts[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:P.bgPage, fontFamily:"'DM Sans','Segoe UI',sans-serif", color:P.textPrimary, overflowX:"hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ── NAVBAR ── */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 56px", height:68,
        background: scrolled ? "rgba(255,255,255,0.96)" : P.bgCard,
        boxShadow: scrolled ? "0 2px 24px rgba(13,59,46,0.10)" : `0 1px 0 ${P.border}`,
        position:"sticky", top:0, zIndex:100,
        transition:"all 0.3s ease",
        backdropFilter: scrolled ? "blur(10px)" : "none",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:36, height:36, borderRadius:"50%",
            background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:800, fontSize:15, color:P.forestDark,
            boxShadow:"0 3px 12px rgba(212,175,55,0.35)",
          }}>V</div>
          <span style={{ fontWeight:800, fontSize:20, color:P.forestDark, letterSpacing:"-0.3px" }}>VoteChain</span>
        </div>

        <ul style={{ display:"flex", alignItems:"center", gap:36, listStyle:"none", margin:0, padding:0 }}>
          {["Features","How it works","About"].map((l) => (
            <li key={l}>
              <span
                onMouseEnter={() => setNavHov(l)}
                onMouseLeave={() => setNavHov(null)}
                style={{
                  fontSize:14, fontWeight:600, cursor:"pointer",
                  color: navHov === l ? P.forest : P.textSecondary,
                  borderBottom: navHov === l ? `2px solid ${P.gold}` : "2px solid transparent",
                  paddingBottom:2, transition:"all 0.2s",
                }}
              >{l}</span>
            </li>
          ))}
        </ul>

        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button
            onMouseEnter={() => setSecondHov(true)}
            onMouseLeave={() => setSecondHov(false)}
            onClick={() => navigate("/login")}
            style={{
              padding:"9px 22px", borderRadius:10,
              border:`1.5px solid ${secondHov ? P.forest : P.border}`,
              background:"transparent", color:P.forestMid,
              fontFamily:"'DM Sans',sans-serif",
              fontWeight:700, fontSize:14, cursor:"pointer", transition:"all 0.2s",
            }}
          >Sign In</button>

          {account ? (
            <span style={{
              fontSize:13, fontWeight:600, color:P.forestMid,
              background:P.bgMint, padding:"6px 14px", borderRadius:20,
              border:`1px solid ${P.border}`,
            }}>
              🦊 {account.slice(0,6)}...{account.slice(-4)}
            </span>
          ) : (
            <button
              onClick={connectWallet}
              onMouseEnter={() => setPrimaryHov(true)}
              onMouseLeave={() => setPrimaryHov(false)}
              style={{
                padding:"9px 22px", borderRadius:10, border:"none",
                background:`linear-gradient(135deg,${P.forestDark},${P.forestMid})`,
                color:P.gold,
                fontFamily:"'DM Sans',sans-serif",
                fontWeight:700, fontSize:14, cursor:"pointer",
                boxShadow: primaryHov ? "0 8px 22px rgba(13,59,46,0.35)" : "0 4px 12px rgba(13,59,46,0.18)",
                transform: primaryHov ? "translateY(-1px)" : "none",
                transition:"all 0.2s",
              }}
            >Connect Wallet</button>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        maxWidth:1100, margin:"0 auto",
        padding:"90px 56px 80px",
        display:"flex", alignItems:"center", gap:64,
        opacity: loaded ? 1 : 0,
        transform: loaded ? "translateY(0)" : "translateY(28px)",
        transition:"opacity 0.65s ease, transform 0.65s ease",
      }}>
        <div style={{ flex:1 }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:7,
            background:"rgba(212,175,55,0.10)", border:`1px solid ${P.goldBorder}`,
            borderRadius:20, padding:"5px 14px",
            fontSize:12, fontWeight:700, color:P.goldDark, marginBottom:28,
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:P.success, display:"inline-block" }} />
            Live on Ethereum · Academic Edition
          </div>

          <h1 style={{ fontSize:54, fontWeight:800, lineHeight:1.1, letterSpacing:"-1.5px", color:P.forestDark, marginBottom:22 }}>
            Democracy,<br />
            <span style={{
              background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>Secured Forever</span>
            <br />on the Blockchain.
          </h1>

          <p style={{ fontSize:17, color:P.textSecondary, lineHeight:1.75, maxWidth:480, marginBottom:40 }}>
            Cast your ballot with complete confidence. Every vote is immutably
            recorded, publicly verifiable, and tamper-proof — powered by
            Ethereum smart contracts.
          </p>

          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:44 }}>
            <button
              onMouseEnter={() => setPrimaryHov(true)}
              onMouseLeave={() => setPrimaryHov(false)}
              onClick={() => navigate("/login")}
              style={{
                padding:"14px 32px", borderRadius:12, border:"none",
                background:`linear-gradient(135deg,${P.forestDark},${P.forestMid})`,
                color:P.gold, fontFamily:"'DM Sans',sans-serif",
                fontWeight:800, fontSize:16, cursor:"pointer",
                boxShadow: primaryHov ? "0 14px 32px rgba(13,59,46,0.35)" : "0 6px 20px rgba(13,59,46,0.22)",
                transform: primaryHov ? "translateY(-2px)" : "none",
                transition:"all 0.22s",
                display:"flex", alignItems:"center", gap:8,
              }}
            >🗳️ Start Voting Now</button>

            <button
              onMouseEnter={() => setSecondHov(true)}
              onMouseLeave={() => setSecondHov(false)}
              style={{
                padding:"14px 28px", borderRadius:12,
                border:`1.5px solid ${secondHov ? P.forest : P.border}`,
                background: secondHov ? P.bgMint : P.bgCard,
                color:P.forestMid, fontFamily:"'DM Sans',sans-serif",
                fontWeight:700, fontSize:16, cursor:"pointer", transition:"all 0.22s",
                display:"flex", alignItems:"center", gap:8,
              }}
            >🔍 Verify a Vote</button>
          </div>

          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {[
              { icon:"🔒", label:"End-to-end encrypted" },
              { icon:"⛓️", label:"On-chain verified"    },
              { icon:"👁️", label:"Publicly auditable"   },
            ].map((b) => (
              <div key={b.label} style={{
                display:"flex", alignItems:"center", gap:6,
                background:P.bgCard, border:`1px solid ${P.border}`,
                borderRadius:20, padding:"7px 16px",
                fontSize:13, fontWeight:600, color:P.textSecondary,
                boxShadow:"0 2px 8px rgba(13,59,46,0.05)",
              }}>
                <span style={{ fontSize:14 }}>{b.icon}</span>{b.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right — live election card */}
        <div style={{ flex:"0 0 360px" }}>
          <div style={{
            background:P.forestDark, borderRadius:24, padding:"32px 28px",
            boxShadow:"0 32px 64px rgba(13,59,46,0.28)",
            position:"relative", overflow:"hidden",
          }}>
            <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%", background:"rgba(212,175,55,0.07)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-30, left:-30, width:140, height:140, borderRadius:"50%", background:"rgba(212,175,55,0.05)", pointerEvents:"none" }} />

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.45)" }}>ELECTION 2025</span>
              <span style={{
                background:"rgba(34,197,94,0.15)", border:"1px solid rgba(34,197,94,0.3)",
                borderRadius:20, padding:"3px 12px",
                fontSize:11, fontWeight:700, color:"#4ade80",
              }}>● LIVE</span>
            </div>

            <h3 style={{ fontSize:20, fontWeight:800, color:"#fff", marginBottom:6 }}>Student Council Election</h3>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:28 }}>Cast your vote before Dec 31, 2025</p>

            {[
              { name:"Arjun Sharma", votes:1420, pct:58 },
              { name:"Priya Nair",   votes:1030, pct:42 },
            ].map((c, i) => (
              <div key={i} style={{ marginBottom:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{c.name}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:P.gold }}>{c.pct}%</span>
                </div>
                <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:6, height:8, overflow:"hidden" }}>
                  <div style={{
                    height:"100%", borderRadius:6,
                    background:`linear-gradient(90deg,${P.gold},${P.goldDark})`,
                    width:`${c.pct}%`, transition:"width 1s ease",
                  }} />
                </div>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4, display:"block" }}>{c.votes.toLocaleString()} votes</span>
              </div>
            ))}

            <div style={{
              marginTop:24, padding:"14px 18px",
              background:"rgba(212,175,55,0.10)", border:`1px solid ${P.goldBorder}`,
              borderRadius:12, display:"flex", alignItems:"center", gap:10,
            }}>
              <span style={{ fontSize:18 }}>⛓️</span>
              <div>
                <p style={{ fontSize:11, fontWeight:700, color:P.gold, margin:0 }}>Blockchain Verified</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0 }}>TX: 0x4f3a...d92c</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div style={{
        background:P.bgCard,
        borderTop:`1px solid ${P.border}`, borderBottom:`1px solid ${P.border}`,
        padding:"28px 56px",
        display:"flex", justifyContent:"center", gap:64, flexWrap:"wrap",
      }}>
        {stats.map((s) => (
          <div key={s.label} style={{ textAlign:"center" }}>
            <span style={{
              display:"block", fontSize:30, fontWeight:800,
              background:`linear-gradient(135deg,${P.forestDark},${P.forest})`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>{s.value}</span>
            <span style={{ fontSize:13, color:P.textSecondary, fontWeight:500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"88px 56px" }}>
        <div style={{ marginBottom:52 }}>
          <span style={{
            display:"inline-block",
            background:"rgba(212,175,55,0.10)", border:`1px solid ${P.goldBorder}`,
            borderRadius:20, padding:"4px 14px",
            fontSize:11, fontWeight:700, color:P.goldDark,
            letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:14,
          }}>Features</span>
          <h2 style={{ fontSize:38, fontWeight:800, color:P.forestDark, letterSpacing:"-0.8px", marginBottom:12 }}>
            Everything you need to vote<br />with confidence
          </h2>
          <p style={{ fontSize:16, color:P.textSecondary, maxWidth:480, lineHeight:1.7 }}>
            Built with enterprise-grade security and blockchain transparency at every layer.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
          {features.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovCard(i)}
              onMouseLeave={() => setHovCard(null)}
              style={{
                background:P.bgCard, borderRadius:16, padding:"28px 24px",
                border:`1.5px solid ${hovCard === i ? P.forest : P.border}`,
                boxShadow: hovCard === i ? "0 20px 40px rgba(13,59,46,0.12)" : "0 4px 16px rgba(13,59,46,0.05)",
                transform: hovCard === i ? "translateY(-5px)" : "none",
                transition:"all 0.25s ease", cursor:"default",
              }}
            >
              <div style={{
                width:52, height:52, borderRadius:14,
                background: hovCard === i ? "rgba(13,59,46,0.08)" : P.bgMint,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:24, marginBottom:18, transition:"background 0.25s",
              }}>{f.icon}</div>
              <h3 style={{ fontSize:17, fontWeight:700, color:P.forestDark, marginBottom:8 }}>{f.title}</h3>
              <p style={{ fontSize:14, color:P.textSecondary, lineHeight:1.65 }}>{f.desc}</p>
              {hovCard === i && (
                <div style={{ marginTop:16, display:"inline-flex", alignItems:"center", gap:4, fontSize:13, fontWeight:700, color:P.forestMid }}>
                  Learn more <span style={{ color:P.gold }}>→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        background:`linear-gradient(135deg,${P.forestDark},${P.forestMid})`,
        padding:"88px 56px", position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:300, height:300, borderRadius:"50%", background:"rgba(212,175,55,0.05)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-60, left:-60, width:240, height:240, borderRadius:"50%", background:"rgba(212,175,55,0.04)", pointerEvents:"none" }} />

        <div style={{ maxWidth:1100, margin:"0 auto" }}>
          <div style={{ marginBottom:52 }}>
            <span style={{
              display:"inline-block",
              background:"rgba(212,175,55,0.12)", border:`1px solid ${P.goldBorder}`,
              borderRadius:20, padding:"4px 14px",
              fontSize:11, fontWeight:700, color:P.gold,
              letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:14,
            }}>How it works</span>
            <h2 style={{ fontSize:38, fontWeight:800, color:"#fff", letterSpacing:"-0.8px", marginBottom:12 }}>Vote in 4 simple steps</h2>
            <p style={{ fontSize:16, color:"rgba(255,255,255,0.5)", maxWidth:460, lineHeight:1.7 }}>
              From registration to blockchain verification — intuitive, transparent, and secure.
            </p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:20 }}>
            {steps.map((s, i) => (
              <div
                key={i}
                onMouseEnter={() => setHovStep(i)}
                onMouseLeave={() => setHovStep(null)}
                style={{
                  background: hovStep === i ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
                  border:`1px solid ${hovStep === i ? P.goldBorder : "rgba(255,255,255,0.1)"}`,
                  borderRadius:16, padding:"28px 22px",
                  transform: hovStep === i ? "translateY(-4px)" : "none",
                  transition:"all 0.25s ease", cursor:"default",
                }}
              >
                <div style={{
                  width:46, height:46, borderRadius:"50%",
                  background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontWeight:800, fontSize:16, color:P.forestDark,
                  marginBottom:18, boxShadow:"0 4px 14px rgba(212,175,55,0.35)",
                }}>{s.n}</div>
                <h3 style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:8 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", lineHeight:1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding:"88px 56px" }}>
        <div style={{
          maxWidth:900, margin:"0 auto", background:P.bgCard,
          borderRadius:24, padding:"60px 56px", textAlign:"center",
          border:`1.5px solid ${P.border}`,
          boxShadow:"0 24px 56px rgba(13,59,46,0.08)",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:-50, right:-50, width:200, height:200, borderRadius:"50%", background:"rgba(212,175,55,0.06)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, borderRadius:"50%", background:"rgba(13,59,46,0.04)", pointerEvents:"none" }} />

          <div style={{
            display:"inline-flex", alignItems:"center", gap:7,
            background:"rgba(212,175,55,0.10)", border:`1px solid ${P.goldBorder}`,
            borderRadius:20, padding:"5px 14px",
            fontSize:12, fontWeight:700, color:P.goldDark, marginBottom:22,
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:P.success, display:"inline-block" }} />
            Registration is open
          </div>

          <h2 style={{ fontSize:40, fontWeight:800, color:P.forestDark, letterSpacing:"-0.9px", marginBottom:14 }}>
            Ready to make your<br />
            <span style={{
              background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
            }}>voice count?</span>
          </h2>

          <p style={{ fontSize:16, color:P.textSecondary, lineHeight:1.75, maxWidth:440, margin:"0 auto 36px" }}>
            Join thousands of verified voters. Your ballot is permanent,
            private, and verifiable — recorded forever on the blockchain.
          </p>

          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button
              onMouseEnter={() => setCtaHov(true)}
              onMouseLeave={() => setCtaHov(false)}
              onClick={() => navigate("/login")}
              style={{
                padding:"14px 36px", borderRadius:12, border:"none",
                background:`linear-gradient(135deg,${P.forestDark},${P.forestMid})`,
                color:P.gold, fontFamily:"'DM Sans',sans-serif",
                fontWeight:800, fontSize:16, cursor:"pointer",
                boxShadow: ctaHov ? "0 14px 32px rgba(13,59,46,0.35)" : "0 6px 20px rgba(13,59,46,0.2)",
                transform: ctaHov ? "translateY(-2px)" : "none", transition:"all 0.22s",
              }}
            >🗳️ Register to Vote Now</button>

            <button style={{
              padding:"14px 28px", borderRadius:12,
              border:`1.5px solid ${P.border}`,
              background:"transparent", color:P.forestMid,
              fontFamily:"'DM Sans',sans-serif",
              fontWeight:700, fontSize:16, cursor:"pointer",
            }}>View Live Results →</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background:P.forestDark, padding:"36px 56px",
        display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:30, height:30, borderRadius:"50%",
            background:`linear-gradient(135deg,${P.gold},${P.goldDark})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontWeight:800, fontSize:13, color:P.forestDark,
          }}>V</div>
          <span style={{ fontWeight:800, fontSize:17, color:"#fff" }}>VoteChain</span>
        </div>
        <ul style={{ display:"flex", gap:24, listStyle:"none", margin:0, padding:0 }}>
          {["Privacy Policy","Terms of Use","Contact","GitHub"].map((l) => (
            <li key={l}>
              <span style={{ fontSize:13, color:"rgba(255,255,255,0.4)", cursor:"pointer", fontWeight:500 }}>{l}</span>
            </li>
          ))}
        </ul>
        <span style={{ fontSize:12, color:"rgba(255,255,255,0.3)" }}>© 2025 VoteChain · Built on Ethereum</span>
      </footer>
    </div>
  );
}