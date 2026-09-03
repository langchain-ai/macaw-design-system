// Storybook/Vite process source Tailwind directives through this local config.
// Consumers use the package's precompiled CSS and do not need to copy it.
module.exports = {
  plugins: {
    tailwindcss: {
      config: './tailwind.config.cjs',
    },
  },
};
