/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}", // Added based on root structure
        "./*.{js,ts,jsx,tsx}", // Allow root files like App.tsx
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                primary: '#4F46E5', // Indigo 600
                secondary: '#64748B', // Slate 500
                surface: '#F8FAFC', // Slate 50
            }
        },
    },
    plugins: [],
}
