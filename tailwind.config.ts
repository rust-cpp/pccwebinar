import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: { ink: "#07100c", panel: "#0c1812", lime: "#9BE15D", emerald: "#17B26A" } } },
  plugins: [],
} satisfies Config;
