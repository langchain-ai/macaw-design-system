# Changelog

All notable public API, visual, and interaction changes belong here.
This package follows [Semantic Versioning](https://semver.org/).

## Unreleased

### Added

- Standalone React components, semantic tokens, compiled styles, icon wrappers,
  Tailwind 3 preset, and explicit component entry points for the first release.
- Public `TooltipProvider`, contributor and integration guides, MIT license,
  package-consumer checks, and a guarded release workflow.
- Current LangChainPlus chart legend hover/focus behavior, Typeahead custom
  filtering and decorators, shared component sizes, and matching stories.

### Changed

- Align shared icons with the regular weights used in LangChainPlus.
- Keep chart legend callbacks compatible with React 18 and 19.

### Fixed

- Forward Badge refs to their inline root and support keyboard tag removal in Typeahead.
- Replace the outdated test DOM engine whose selector recursion caused timeouts.
