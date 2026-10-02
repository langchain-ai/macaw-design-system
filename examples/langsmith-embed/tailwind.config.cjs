module.exports = {
  content: [require('node:path').join(__dirname, '*.tsx')],
  presets: [require('@langchain/macaw-components/tailwind-preset')],
};
