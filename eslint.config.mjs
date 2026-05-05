import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import storybook from 'eslint-plugin-storybook'

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    ...storybook.configs['flat/recommended'],
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])

export default eslintConfig
