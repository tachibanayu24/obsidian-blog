/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            color: '#f3f4f6', // text-gray-100
            a: {
              color: '#93c5fd', // text-blue-300
              '&:hover': {
                color: '#60a5fa', // text-blue-400
              },
            },
            h1: {
              color: '#f3f4f6', // text-gray-100
            },
            h2: {
              color: '#f3f4f6', // text-gray-100
            },
            h3: {
              color: '#f3f4f6', // text-gray-100
            },
            h4: {
              color: '#f3f4f6', // text-gray-100
            },
            h5: {
              color: '#f3f4f6', // text-gray-100
            },
            h6: {
              color: '#f3f4f6', // text-gray-100
            },
            strong: {
              color: '#f3f4f6', // text-gray-100
            },
            code: {
              color: '#f3f4f6', // text-gray-100
            },
            blockquote: {
              color: '#d1d5db', // text-gray-300
              borderLeftColor: '#4b5563', // gray-600
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
