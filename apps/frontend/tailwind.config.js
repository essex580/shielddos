/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
                mono: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
