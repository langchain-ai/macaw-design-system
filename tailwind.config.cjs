const preset = require('./packages/components/tailwind.preset.cjs');

// Internal build config for dist/utilities.css. Consumers use the exported
// tailwind-preset entry with their own content paths.
module.exports = {
  content: ['./packages/components/src/**/*.{js,ts,jsx,tsx,mdx}'],
  presets: [preset],
};
