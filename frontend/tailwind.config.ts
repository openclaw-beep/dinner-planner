import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#fefaf6",
        ink: "#13212b",
        brand: "#b6402c",
        accent: "#eca72c",
        pine: "#1b4332",
      },
      boxShadow: {
        card: "0 20px 45px -25px rgba(19, 33, 43, 0.45)",
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(circle at 20% 20%, rgba(236, 167, 44, 0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(182, 64, 44, 0.25), transparent 35%)",
      },
    },
  },
  plugins: [],
};

export default config;
