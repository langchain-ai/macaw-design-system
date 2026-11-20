import { addons } from 'storybook/manager-api';

import LangChainTheme from './LangChainTheme';

import './manager.css';

addons.setConfig({
  theme: LangChainTheme,
});
