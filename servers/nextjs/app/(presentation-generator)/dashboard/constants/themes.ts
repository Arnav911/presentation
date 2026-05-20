export interface Theme {
  id: string;
  name: string;
  dotColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  accentColorRgb?: string; // e.g. "30, 76, 217"
  cardBackgroundColor?: string;
  cardBorderColor?: string;
}

export const PRESET_THEMES: Theme[] = [
  {
    id: "chronicle",
    name: "Chronicle",
    dotColor: "#FF4D00",
    backgroundColor: "hsla(0, 0%, 2%, 1)",
    textColor: "hsla(0, 0%, 100%, 0.88)",
    accentColor: "#FF4D00",
    accentColorRgb: "255, 77, 0",
    cardBackgroundColor: "hsla(0, 0%, 8%, 1)",
    cardBorderColor: "hsla(0, 0%, 13%, 1)",
  },
  {
    id: "minimal",
    name: "Minimal",
    dotColor: "#000000",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    accentColor: "#000000",
    accentColorRgb: "0, 0, 0",
    cardBackgroundColor: "#f9f9f9",
    cardBorderColor: "#e5e5e5",
  },
  {
    id: "new-classic",
    name: "New Classic",
    dotColor: "#1E4CD9",
    backgroundColor: "#143a75", 
    textColor: "#ffffff",
    accentColor: "#1E4CD9",
    accentColorRgb: "30, 76, 217",
    cardBackgroundColor: "rgba(255, 255, 255, 0.05)",
    cardBorderColor: "rgba(255, 255, 255, 0.1)",
  },
  {
    id: "forest",
    name: "Forest",
    dotColor: "#2ecc71",
    backgroundColor: "#0b2e13",
    textColor: "#ffffff",
    accentColor: "#2ecc71",
    accentColorRgb: "46, 204, 113",
    cardBackgroundColor: "rgba(255, 255, 255, 0.05)",
    cardBorderColor: "rgba(255, 255, 255, 0.1)",
  },
  {
    id: "braun",
    name: "Braun",
    dotColor: "#5d4037",
    backgroundColor: "#f3e9dc",
    textColor: "#5d4037",
    accentColor: "#8d6e63",
    accentColorRgb: "141, 110, 99",
    cardBackgroundColor: "rgba(93, 64, 55, 0.05)",
    cardBorderColor: "rgba(93, 64, 55, 0.1)",
  },
  {
    id: "matisse",
    name: "Matisse",
    dotColor: "#1e4cd9",
    backgroundColor: "#d1dcfb",
    textColor: "#1e4cd9",
    accentColor: "#1e4cd9",
    accentColorRgb: "30, 76, 217",
    cardBackgroundColor: "rgba(30, 76, 217, 0.05)",
    cardBorderColor: "rgba(30, 76, 217, 0.1)",
  },
  {
    id: "romantic",
    name: "Romantic",
    dotColor: "#ff4d4d",
    backgroundColor: "#8b1a1a",
    textColor: "#ffffff",
    accentColor: "#ff4d4d",
    accentColorRgb: "255, 77, 77",
    cardBackgroundColor: "rgba(255, 255, 255, 0.05)",
    cardBorderColor: "rgba(255, 255, 255, 0.1)",
  },
  {
    id: "pixel",
    name: "Pixel",
    dotColor: "#7b7d6a",
    backgroundColor: "#7b7d6a",
    textColor: "#ffffff",
    accentColor: "#a3a58b",
    accentColorRgb: "163, 165, 139",
    cardBackgroundColor: "rgba(255, 255, 255, 0.05)",
    cardBorderColor: "rgba(255, 255, 255, 0.1)",
  },
  {
    id: "modern-tech",
    name: "Modern tech",
    dotColor: "#00f2fe",
    backgroundColor: "#0a0c10",
    textColor: "#e0e6ed",
    accentColor: "#4facfe",
    accentColorRgb: "79, 172, 254",
    cardBackgroundColor: "#161b22",
    cardBorderColor: "#30363d",
  },
  {
    id: "paper",
    name: "Paper",
    dotColor: "#5d4037",
    backgroundColor: "#fdf6e3",
    textColor: "#2c3e50",
    accentColor: "#8d6e63",
    accentColorRgb: "141, 110, 99",
    cardBackgroundColor: "#f5ece0",
    cardBorderColor: "#e6d5c1",
  }
];
