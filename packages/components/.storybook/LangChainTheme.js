import { create, getPreferredColorScheme } from 'storybook/theming';

import LangChainLogo from './assets/MacawLogoColorNoBG.svg';
import LangChainLogoDark from './assets/MacawLogoColorDarkNoBG.svg';

export default create({
  brandTitle: 'Macaw Design System',
  brandUrl: './',
  brandImage: LangChainLogo,
  brandTarget: '_self',
  colorPrimary: '#006ddd',
    ...(getPreferredColorScheme() === 'light' ? { appBg: '#F2FAFF' } : {}),
    ...(getPreferredColorScheme() === 'light' ? { brandImage: LangChainLogo } : { brandImage: LangChainLogoDark }),
});
