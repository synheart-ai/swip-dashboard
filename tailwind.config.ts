import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'synheart-pink': '#ff0080',
        'synheart-blue': '#00bfff',
        'synheart-dark': '#0a0a0a',
        'synheart-gray': '#1a1a1a',
        'synheart-light-gray': '#2a2a2a',
      },
      backgroundImage: {
        'synheart-gradient': 'linear-gradient(135deg, #ff0080, #00bfff)',
        'synheart-gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'synheart-gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%': {
            boxShadow: '0 0 20px rgba(255, 0, 128, 0.3), 0 0 40px rgba(0, 191, 255, 0.2)',
          },
          '100%': {
            boxShadow: '0 0 30px rgba(255, 0, 128, 0.5), 0 0 60px rgba(0, 191, 255, 0.3)',
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      fontFamily: {
        'synheart': ['Inter', 'system-ui', 'sans-serif'],
      },
    }
  },
  plugins: []
} satisfies Config;
