/**
 * Lomba Theme Configuration & Dynamic Token Presets
 * Allows dynamic theming (Wayang Royal Gold, Modern Emerald, Classic Teal, etc.)
 */

export interface LombaThemeConfig {
  id: string;
  name: string;
  backgroundGradient: string;
  cardBg: string;
  borderGold: string;
  textGold: string;
  textMuted: string;
  btnPrimary: string;
  activeRing: string;
}

export const WAYANG_GOLD_THEME: LombaThemeConfig = {
  id: "wayang-gold",
  name: "Wayang Royal Gold & Bronze",
  backgroundGradient: "bg-[#120d09] bg-[radial-gradient(ellipse_at_top,_#261a0e_0%,_#0d0906_100%)]",
  cardBg: "bg-[#1c140c]/90 backdrop-blur-md",
  borderGold: "border-[#8c6d23]/50",
  textGold: "text-[#f3e5ab]",
  textMuted: "text-[#d4af37]/70",
  btnPrimary: "bg-gradient-to-r from-[#8c6d23] via-[#d4af37] to-[#8c6d23] text-[#14100c] hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]",
  activeRing: "ring-2 ring-[#d4af37]/50 border-[#d4af37]",
};

export const currentLombaTheme = WAYANG_GOLD_THEME;
