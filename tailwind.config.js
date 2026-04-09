/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ✅ Lo que ya existe - CONSERVADO
      colors: {
        cleverhub: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // ✅ NUEVOS breakpoints (se AÑADEN, no reemplazan)
      screens: {
        'xs': '475px',
        '3xl': '1920px',
        '4xl': '2560px',
      },
      
      // ✅ NUEVOS maxWidth
      maxWidth: {
        '8xl': '1600px',
        '9xl': '1800px',
      },
      
      // ✅ NUEVOS spacing
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
};