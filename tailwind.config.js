/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': 'var(--primary-blue)',
        'secondary-blue': 'var(--secondary-blue)',
        'alert-red': 'var(--alert-red)',
        'success-green': 'var(--success-green)',
        'warning-yellow': 'var(--warning-yellow)',
        'hover-blue': 'var(--hover-blue)',
        'active-blue': 'var(--active-blue)',
        'hover-gray': 'var(--hover-gray)',
        'active-gray': 'var(--active-gray)',
        'error-bg': 'var(--error-bg)',
        'error-border': 'var(--error-border)',
        'error-text': 'var(--error-text)',
        'warning-bg': 'var(--warning-bg)',
        'warning-border': 'var(--warning-border)',
        'warning-text': 'var(--warning-text)',
        'background': 'var(--background)',
        'text': 'var(--text)',
        'light-gray': 'var(--light-gray)',
        'border': 'var(--border)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
    },
  },
  plugins: [],
} 