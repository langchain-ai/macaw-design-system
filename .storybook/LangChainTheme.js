import { create } from 'storybook/theming';

import LangChainLogo from './assets/LangChainLogoColor.svg';

export default create({
  brandTitle: 'LangChain Design System',
  brandUrl: 'https://langchain.com',
  brandImage: LangChainLogo,
  brandTarget: '_self',
  colorPrimary: '#006ddd',
});
