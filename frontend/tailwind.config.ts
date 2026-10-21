import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        stk: {
          sidebar: '#0052AF',
          sidebarActive: '#FFFFFF',
          sidebarGroup: '#0060C9',
          primary: '#0052AF',
          primaryHover: '#00428C',
          darkBtn: '#1D2939',
          darkBtnHover: '#101828',
          inputBg: '#F9FAFB',
          inputDisabled: '#EAECF0',
          connector: '#D0D5DD',
          border: '#D0D5DD',
          textMain: '#101828',
          textMuted: '#475467',
          textSub: '#667085',
        },
      },
      borderRadius: {
        'sidebar': '24px',
        'pill': '9999px',
        'field': '16px',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'var(--font-noto-kr)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
