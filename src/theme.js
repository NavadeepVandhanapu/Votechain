// ============================================
// theme.js — Forest Authority Color Palette
// VoteChain E-Voting System
// ============================================

export const P = {
  // Primary Greens
  forestDark:    "#0D3B2E",
  forestMid:     "#155E43",
  forest:        "#1D7A56",
  forestLight:   "#2A9968",

  // Gold Accents
  gold:          "#D4AF37",
  goldDark:      "#B8962E",
  goldBorder:    "rgba(212,175,55,0.35)",
  goldSoft:      "#FDF3D0",

  // Backgrounds
  bgPage:        "#F5F7F0",
  bgCard:        "#FFFFFF",
  bgMint:        "#EDFAF4",

  // Text
  textPrimary:   "#1A2E1F",
  textSecondary: "#4B6357",
  textHint:      "#8FA899",
  textWhite:     "#FFFFFF",

  // Borders
  border:        "#D6E8DC",
  borderInput:   "#D6E8DC",

  // Semantic
  success:       "#16A34A",
  successBg:     "#DCFCE7",
  error:         "#DC2626",
  errorBg:       "#FEE2E2",
  warning:       "#D97706",
  warningBg:     "#FEF3C7",
  info:          "#2563EB",
  infoBg:        "#DBEAFE",
};

// Gradient helpers
export const G = {
  primary:    `linear-gradient(135deg, ${P.forestDark}, ${P.forestMid})`,
  gold:       `linear-gradient(135deg, ${P.gold}, ${P.goldDark})`,
  pageBg:     `linear-gradient(145deg, #EEF5EC, ${P.bgPage}, #E8F2E8)`,
  cardHover:  `linear-gradient(135deg, ${P.forestDark}08, ${P.forestMid}08)`,
};

// Shadow helpers
export const S = {
  card:       "0 4px 16px rgba(13,59,46,0.06)",
  cardHover:  "0 20px 40px rgba(13,59,46,0.13)",
  btn:        "0 6px 20px rgba(13,59,46,0.22)",
  btnHover:   "0 12px 28px rgba(13,59,46,0.35)",
  focus:      "0 0 0 3px rgba(29,122,86,0.14)",
  nav:        "0 2px 24px rgba(13,59,46,0.10)",
};

// Border radius
export const R = {
  btn:    "12px",
  card:   "16px",
  cardLg: "24px",
  input:  "10px",
  pill:   "20px",
  avatar: "50%",
};

// Font
export const FONT = "'DM Sans', 'Segoe UI', sans-serif";
export const FONT_IMPORT = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap";
