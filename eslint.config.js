// @ts-check
import { defineFlatConfig, prettier, typescript } from '@bassist/eslint'

export default defineFlatConfig([
  ...prettier,
  ...typescript,
  {
    ignores: ['dist'],
    languageOptions: {
      globals: {
        DedicatedWorkerGlobalScope: 'readonly',
      },
    },
  },
])
