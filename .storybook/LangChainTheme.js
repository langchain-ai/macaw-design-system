import { create } from 'storybook/theming';

// Storybook's manager needs a fixed-color image URL. The component asset uses
// currentColor and is compiled through SVGR inside the preview/application.
import LangChainLogo from './assets/LangChainLogoColor.svg';

export default create({
  brandTitle: 'LangChain Design System',
  brandUrl: 'https://langchain.com',
  brandImage: LangChainLogo,
  brandTarget: '_self',
  colorPrimary: '#006ddd',
});
