import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
        "primary-glow": "hsl(var(--primary-glow))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "neon-pulse": {
          "0%, 100%": {
            boxShadow:
              "0 0 0 1px hsl(var(--primary-glow) / 0.5), 0 0 24px hsl(var(--primary-glow) / 0.45), 0 0 60px hsl(var(--primary-glow) / 0.25)",
          },
          "50%": {
            boxShadow:
              "0 0 0 1px hsl(var(--primary-glow) / 0.9), 0 0 40px hsl(var(--primary-glow) / 0.75), 0 0 90px hsl(var(--primary-glow) / 0.4)",
          },
        },
        "neon-border": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "wave-bar": {
          "0%, 100%": { transform: "scaleY(0.25)" },
          "50%": { transform: "scaleY(1)" },
        },
        "mentor-orb": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.5) translateY(-40px)", opacity: "0" },
          "60%": { transform: "scale(1.05) translateY(8px)", opacity: "1" },
          "80%": { transform: "scale(0.97) translateY(-3px)" },
          "100%": { transform: "scale(1) translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "help-pulse": {
          "0%, 100%": { transform: "scale(1)", boxShadow: "0 0 0 0 hsl(var(--primary-glow) / 0.6)" },
          "50%": { transform: "scale(1.08)", boxShadow: "0 0 0 10px hsl(var(--primary-glow) / 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "neon-pulse": "neon-pulse 2.4s ease-in-out infinite",
        "neon-border": "neon-border 2.4s ease-in-out infinite",
        "mentor-orb": "mentor-orb 2.8s ease-in-out infinite",
        "bounce-in": "bounce-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "fade-in": "fade-in 0.25s ease-out",
        "help-pulse": "help-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
