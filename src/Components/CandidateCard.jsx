import { useState } from "react";
import { P, G, S, R, FONT } from "../theme";

export default function CandidateCard({ id, name, party, voteCount = 0, totalVotes = 0, onVote, hasVoted, votedFor }) {
  const [hov, setHov]             = useState(false);
  const [btnHov, setBtnHov]       = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading]     = useState(false);

  const isVotedFor = votedFor === id;
  const pct        = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
  const initials   = name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();

  const handleVoteClick = () => { if (hasVoted || loading) return; setConfirming(true); };
  const handleConfirm   = async () => { setConfirming(false); setLoading(true); await onVote(id, name); setLoading(false); };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirming(false); }}
      style={{
        background: isVotedFor ? `${P.forestMid}09` : P.bgCard,
        borderRadius: R.card,
        border: `1.5px solid ${isVotedFor ? P.forest : hov ? P.forest : P.border}`,
        padding: "20px",
        boxShadow: hov ? S.cardHover : S.card,
        transform: hov && !hasVoted ? "translateY(-4px)" : "none",
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "hidden",
        fontFamily: FONT,
        // Ensure good touch targets
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Voted ribbon */}
      {isVotedFor && (
        <div style={{
          position:"absolute", top:14, right:-22,
          background: G.primary, color: P.gold,
          fontSize:10, fontWeight:800,
          padding:"4px 32px", transform:"rotate(35deg)",
          letterSpacing:"0.06em",
        }}>YOUR VOTE</div>
      )}

      {/* Top row */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <div style={{
          width:48, height:48, borderRadius:"50%",
          background: isVotedFor ? G.primary : `linear-gradient(135deg,${P.bgMint},${P.border})`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:800, fontSize:16,
          color: isVotedFor ? P.gold : P.forestMid,
          border:`2px solid ${isVotedFor ? P.forest : P.border}`,
          flexShrink:0,
        }}>{initials}</div>

        <div style={{ flex:1, minWidth:0 }}>
          <h3 style={{
            fontSize:15, fontWeight:800, color:P.textPrimary,
            margin:0, marginBottom:3,
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>{name}</h3>
          <span style={{
            display:"inline-block",
            background:`${P.forestMid}12`, border:`1px solid ${P.border}`,
            borderRadius:R.pill, padding:"2px 9px",
            fontSize:11, fontWeight:700, color:P.forestMid,
          }}>{party}</span>
        </div>

        <div style={{ textAlign:"center", flexShrink:0 }}>
          <span style={{
            display:"block", fontSize:20, fontWeight:800,
            background:G.primary, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
          }}>{voteCount}</span>
          <span style={{ fontSize:10, color:P.textHint, fontWeight:500 }}>votes</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ fontSize:12, color:P.textSecondary, fontWeight:500 }}>Vote share</span>
          <span style={{ fontSize:12, fontWeight:700, color:P.forestMid }}>{pct}%</span>
        </div>
        <div style={{
          background:P.bgMint, borderRadius:6, height:8, overflow:"hidden",
          border:`1px solid ${P.border}`,
        }}>
          <div style={{
            height:"100%", borderRadius:6,
            background: isVotedFor ? G.gold : G.primary,
            width:`${pct}%`, transition:"width 0.8s ease",
          }} />
        </div>
      </div>

      {/* Action area */}
      {!confirming ? (
        <button
          onClick={handleVoteClick}
          onMouseEnter={() => setBtnHov(true)}
          onMouseLeave={() => setBtnHov(false)}
          disabled={hasVoted || loading}
          style={{
            width:"100%",
            // min 44px for touch targets (Apple HIG / WCAG)
            padding:"12px 0",
            minHeight:44,
            borderRadius:R.btn, border:"none",
            background: hasVoted
              ? isVotedFor ? G.primary : P.bgMint
              : btnHov ? G.primary : `${P.forestDark}0D`,
            color: hasVoted
              ? isVotedFor ? P.gold : P.textHint
              : btnHov ? P.gold : P.forestMid,
            fontFamily:FONT, fontWeight:700, fontSize:14,
            cursor: hasVoted ? "default" : "pointer",
            transition:"all 0.22s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:7,
            boxShadow: btnHov&&!hasVoted ? S.btn : "none",
            WebkitTapHighlightColor:"transparent",
          }}
        >
          {loading ? (
            <>
              <span style={{
                width:15, height:15, border:`2px solid ${P.gold}55`,
                borderTopColor:P.gold, borderRadius:"50%",
                display:"inline-block", animation:"spin 0.75s linear infinite",
              }} />
              Submitting on-chain...
            </>
          ) : isVotedFor ? "✅ Vote Submitted"
            : hasVoted   ? "🔒 Already Voted"
            :               "🗳️ Vote for this Candidate"}
        </button>
      ) : (
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={handleConfirm} style={{
            flex:1, padding:"12px 0", minHeight:44,
            borderRadius:R.btn, border:"none",
            background:G.primary, color:P.gold,
            fontFamily:FONT, fontWeight:700, fontSize:13,
            cursor:"pointer", boxShadow:S.btn,
          }}>✅ Yes, confirm vote</button>
          <button onClick={() => setConfirming(false)} style={{
            flex:1, padding:"12px 0", minHeight:44,
            borderRadius:R.btn, border:`1.5px solid ${P.border}`,
            background:"transparent", color:P.textSecondary,
            fontFamily:FONT, fontWeight:600, fontSize:13,
            cursor:"pointer",
          }}>Cancel</button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}