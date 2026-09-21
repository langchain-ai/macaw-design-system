export const LANGUAGES = {
  typescript: import('./typescript').then(
    (module) => module.typescriptLanguage
  ),
  python: import('./python').then((module) => module.pythonLanguage),
  shell: import('./shell').then((module) => module.shellLanguage),
  yaml: import('./yaml').then((module) => module.yamlLanguage),
  json: import('./json').then((module) => module.jsonLanguage),
} as const;
