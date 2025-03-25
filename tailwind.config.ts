// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
    theme: {
        extend: {
            boxShadow: {
                'custom-gray': '0 4px 6px -1px rgba(107, 114, 128, 0.1), 0 2px 4px -1px rgba(107, 114, 128, 0.06)',
            },
        },
    },
    plugins: [],
}

export default config