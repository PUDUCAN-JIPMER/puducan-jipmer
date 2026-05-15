// Import Tailwind CSS configuration type for proper TypeScript support
import type { Config } from 'tailwindcss'

// Define the Tailwind CSS configuration for PuduCan application
const config: Config = {
    // Content paths: Tells Tailwind where to look for class names to generate utilities
    // Scans all .js, .ts, .jsx, .tsx, and .mdx files in the app and components directories
    // This ensures only the utilities actually used in these files are included in the final bundle
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',      // All files in app directory (pages, layouts, etc.)
        './components/**/*.{js,ts,jsx,tsx,mdx}', // All files in components directory (reusable UI components)
    ],
    
    // Theme configuration: Extends Tailwind's default theme with custom design tokens
    theme: {
        extend: {
            // Font Family customization
            // Defines custom font families used throughout the application
            fontFamily: {
                // 'heading' class: Uses Montserrat font with sans-serif fallback for headings and titles
                'heading': ["'Montserrat'", 'sans-serif'],
                // 'body' class: Uses Plus Jakarta Sans font with sans-serif fallback for body text and general content
                'body': ["'Plus Jakarta Sans'", 'sans-serif'],
            },
            
            // Color customization: All colors use CSS custom properties (variables) from globals.css
            // This allows for dynamic theme switching (e.g., light/dark mode) at runtime
            colors: {
                // Base colors: Neutral palette ranging from 50 (lightest) to 400 (darkest)
                // Used for backgrounds, borders, and neutral elements
                'base': {
                    50: 'var(--base-50)',    // Lightest base color for subtle backgrounds
                    100: 'var(--base-100)',  // Light base color for hover states
                    200: 'var(--base-200)',  // Medium-light base color for borders
                    300: 'var(--base-300)',  // Medium base color
                    400: 'var(--base-400)',  // Darker base color
                },
                
                // Text colors: Semantic color scale for typography
                // 900 (darkest) to 500 (lighter) for different text hierarchy levels
                'text': {
                    900: 'var(--text-900)',  // Primary text color (darkest, highest contrast)
                    700: 'var(--text-700)',  // Secondary text color for less important content
                    600: 'var(--text-600)',  // Tertiary text color for supporting content
                    500: 'var(--text-500)',  // Light text color for disabled or subtle text
                },
                
                // Accent colors: Brand colors for interactive elements, CTAs, and highlights
                'accent': {
                    primary: 'var(--accent-primary)',              // Main brand color for primary actions
                    light: 'var(--accent-light)',                  // Light variant for hover/active states
                    dark: 'var(--accent-dark)',                    // Dark variant for emphasis
                    secondary: 'var(--accent-secondary)',          // Secondary brand color for complementary elements
                    'secondary-light': 'var(--accent-secondary-light)', // Light variant of secondary color
                },
                
                // Background and foreground colors: Global page and element backgrounds
                'bg': 'var(--background)',      // Main page background color
                'fg': 'var(--foreground)',      // Foreground color (text on background)
                
                // Semantic status/category colors: Used for data visualization and status indicators
                'color': {
                    blue: 'var(--color-blue)',              // Blue for primary information/status
                    'blue-light': 'var(--color-blue-light)', // Light blue for secondary information
                    green: 'var(--color-green)',            // Green for success/positive status
                    'green-light': 'var(--color-green-light)', // Light green for positive backgrounds
                    yellow: 'var(--color-yellow)',          // Yellow for warnings/attention
                    'yellow-light': 'var(--color-yellow-light)', // Light yellow for warning backgrounds
                },
            },
            
            // Spacing customization: Custom spacing scale for margins, padding, gaps, etc.
            // Uses CSS custom properties to maintain consistency with design system
            spacing: {
                '1': 'var(--space-1)', // Smallest spacing unit (typically 4px or smaller)
                '2': 'var(--space-2)', // Small spacing (typically 8px)
                '3': 'var(--space-3)', // Medium-small spacing (typically 12px)
                '4': 'var(--space-4)', // Medium spacing (typically 16px)
                '5': 'var(--space-5)', // Medium-large spacing (typically 20px)
                '6': 'var(--space-6)', // Large spacing (typically 24px)
                '7': 'var(--space-7)', // Extra-large spacing (typically 32px or larger)
            },
            
            // Font size customization: Custom typography scale
            // Defines all text sizes available through Tailwind's text-* utilities
            fontSize: {
                'xs': 'var(--text-xs)',   // Extra small: captions, micro copy, labels
                'sm': 'var(--text-sm)',   // Small: secondary labels, helper text
                'base': 'var(--text-base)', // Base/body: default paragraph text
                'lg': 'var(--text-lg)',   // Large: prominent body text, emphasis
                'xl': 'var(--text-xl)',   // Extra large: subheadings
                '2xl': 'var(--text-2xl)', // 2XL: section headings
                '3xl': 'var(--text-3xl)', // 3XL: main page headings
                '4xl': 'var(--text-4xl)', // 4XL: prominent headings
                '5xl': 'var(--text-5xl)', // 5XL: hero section titles
            },
            
            // Line height customization: Controls vertical spacing of text for readability
            lineHeight: {
                'tight': 'var(--lh-tight)',     // Tight line height for headings (1.2 or similar)
                'normal': 'var(--lh-normal)',   // Normal line height for body text (1.5 or similar)
                'relaxed': 'var(--lh-relaxed)', // Relaxed line height for dense content (1.75+ or similar)
            },
        },
    },
    
    // Plugins array: Extend Tailwind with custom plugins
    // Currently empty, but can be populated with community or custom plugins for additional functionality
    plugins: [],
}

// Export the configuration as default for Tailwind CSS to use
// NOTE: This TS config file is only used if referenced with @config in your CSS file.
// Check globals.css for @config "./tailwind.config.ts" directive.
export default config
