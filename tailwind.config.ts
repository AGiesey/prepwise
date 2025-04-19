import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // You can customize your color palette here
      },
    },
  },
  plugins: [
    function({ addComponents }: { addComponents: (components: Record<string, any>) => void }) {
      addComponents({
        '.dietary-badge': {
          '@apply px-3 py-1 rounded-full': {},
        },
      })
    },
  ],
}

export default config 