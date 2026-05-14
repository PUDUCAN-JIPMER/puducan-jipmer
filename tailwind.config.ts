import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'base': {
                    50: 'var(--base-50)',
                    100: 'var(--base-100)',
                    200: 'var(--base-200)',
                    300: 'var(--base-300)',
                    400: 'var(--base-400)',
                },
                'text': {
                    900: 'var(--text-900)',
                    700: 'var(--text-700)',
                    600: 'var(--text-600)',
                    500: 'var(--text-500)',
                },
                'accent': {
                    primary: 'var(--accent-primary)',
                    light: 'var(--accent-light)',
                    dark: 'var(--accent-dark)',
                    secondary: 'var(--accent-secondary)',
                    'secondary-light': 'var(--accent-secondary-light)',
                },
                'bg': 'var(--background)',
                'fg': 'var(--foreground)',
                'color': {
                    blue: 'var(--color-blue)',
                    'blue-light': 'var(--color-blue-light)',
                    green: 'var(--color-green)',
                    'green-light': 'var(--color-green-light)',
                    yellow: 'var(--color-yellow)',
                    'yellow-light': 'var(--color-yellow-light)',
                },
            },
            spacing: {
                '1': 'var(--space-1)',
                '2': 'var(--space-2)',
                '3': 'var(--space-3)',
                '4': 'var(--space-4)',
                '5': 'var(--space-5)',
                '6': 'var(--space-6)',
                '7': 'var(--space-7)',
            },
            fontSize: {
                'xs': 'var(--text-xs)',
                'sm': 'var(--text-sm)',
                'base': 'var(--text-base)',
                'lg': 'var(--text-lg)',
                'xl': 'var(--text-xl)',
                '2xl': 'var(--text-2xl)',
                '3xl': 'var(--text-3xl)',
                '4xl': 'var(--text-4xl)',
                '5xl': 'var(--text-5xl)',
            },
            lineHeight: {
                'tight': 'var(--lh-tight)',
                'normal': 'var(--lh-normal)',
                'relaxed': 'var(--lh-relaxed)',
            },
        },
    },
    plugins: [],
}
export default config
