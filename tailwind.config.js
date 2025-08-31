/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk Purple Theme
        'cyber-purple': '#1a0b2e',
        'cyber-dark': '#0d0519',
        'cyber-darker': '#050208',
        'cyber-purple-light': '#2d1b4e',
        'cyber-purple-lighter': '#4a2b7a',
        'cyber-accent': '#8b5cf6',
        'cyber-accent-light': '#a78bfa',
        'cyber-accent-bright': '#c084fc',
        'cyber-blue': '#06b6d4',
        'cyber-blue-light': '#22d3ee',
        'cyber-pink': '#ec4899',
        'cyber-pink-light': '#f472b6',
        'cyber-green': '#10b981',
        'cyber-green-light': '#34d399',
        'cyber-yellow': '#f59e0b',
        'cyber-yellow-light': '#fbbf24',
        'cyber-gray': '#374151',
        'cyber-gray-light': '#6b7280',
        'cyber-gray-lighter': '#9ca3af',
        'cyber-white': '#f3f4f6',
        'cyber-black': '#000000',
        
        // Legacy Spotify colors (keeping for compatibility)
        spotify: {
          green: '#10b981',
          black: '#0d0519',
          dark: '#1a0b2e',
          light: '#374151',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'cyber-pulse': 'cyber-pulse 4s ease-in-out infinite',
        'matrix': 'matrix 20s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #8b5cf6, 0 0 10px #8b5cf6, 0 0 15px #8b5cf6' },
          '100%': { boxShadow: '0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 30px #8b5cf6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'cyber-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #1a0b2e 0%, #0d0519 50%, #050208 100%)',
        'cyber-gradient-radial': 'radial-gradient(ellipse at center, #2d1b4e 0%, #1a0b2e 50%, #0d0519 100%)',
        'cyber-mesh': 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%238b5cf6\' fill-opacity=\'0.05\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      },
    },
  },
  plugins: [],
}
