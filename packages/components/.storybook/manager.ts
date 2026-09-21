import { addons } from 'storybook/manager-api';

import LangChainTheme from './LangChainTheme';

addons.setConfig({
  theme: LangChainTheme,
});
