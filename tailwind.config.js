/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Oficial Iliana Ramirez Real State
        'ileana-navy': '#2B2D6E',            // Azul Oscuro del logo - Primary
        'ileana-orange': '#F78A31',          // Naranja del logo - Accent
        'ileana-white': '#FFFFFF',           // Blanco - Secondary
        'ileana-light-gray': '#F5F5F5',      // Gris muy claro - Background
        'ileana-black': '#000000',           // Negro para texto

        // Alias para compatibilidad y uso semántico
        'ileana-primary': '#2B2D6E',         // Azul oscuro principal
        'ileana-secondary': '#FFFFFF',       // Blanco
        'ileana-accent': '#F78A31',          // Naranja
        'ileana-light': '#F5F5F5',           // Gris claro para fondos
        'ileana-dark': '#000000',            // Negro para texto

        // Colores de Estado usando la nueva paleta
        'ileana-success': '#F78A31',         // Naranja para éxito
        'ileana-warning': '#2B2D6E',         // Azul oscuro para advertencia
        'ileana-error': '#F78A31',           // Naranja para error
        'ileana-info': '#2B2D6E',            // Azul oscuro para información

        // Alias legacy para compatibilidad (mapeados a nuevos colores)
        'ileana-blue': '#2B2D6E',            // Mapeado al azul principal
        'ileana-light-blue': '#F78A31',      // Mapeado al naranja
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'ileana': '0 4px 6px -1px rgba(43, 45, 110, 0.1), 0 2px 4px -1px rgba(43, 45, 110, 0.06)',
        'ileana-lg': '0 10px 15px -3px rgba(43, 45, 110, 0.1), 0 4px 6px -2px rgba(43, 45, 110, 0.05)',
        'ileana-orange': '0 4px 6px -1px rgba(247, 138, 49, 0.1), 0 2px 4px -1px rgba(247, 138, 49, 0.06)',
      }
    }
  },
  plugins: [],
}
