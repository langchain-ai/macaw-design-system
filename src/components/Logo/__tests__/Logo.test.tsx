import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { Logo } from '..';

const CUSTOM_LOGO_URL = 'https://example.com/custom-logo.png';

// Mock SVG imports
vi.mock('../EngineIconLight.svg?react', () => ({
  default: (props: any) => (
    <div data-testid="engine-icon" className={props.className}>
      EngineIconLight
    </div>
  ),
}));

vi.mock('../EngineLogoDark.svg?react', () => ({
  default: (props: any) => (
    <div data-testid="engine-logo-dark" className={props.className}>
      EngineLogoDark
    </div>
  ),
}));

vi.mock('../EngineLogoLight.svg?react', () => ({
  default: (props: any) => (
    <div data-testid="engine-logo-light" className={props.className}>
      EngineLogoLight
    </div>
  ),
}));

vi.mock('../LangChainLogoIcon.svg?react', () => ({
  default: (props: any) => (
    <div data-testid="logo-icon" className={props.className}>
      LangChainLogoIcon
    </div>
  ),
}));

vi.mock('../LangSmithLogoWord.svg?react', () => ({
  default: (props: any) => (
    <div data-testid="logo-wordmark" className={props.className}>
      LangSmithLogoWord
    </div>
  ),
}));

vi.mock('../LangSmithLogoFull.svg?react', () => ({
  default: (props: any) => (
    <div data-testid="logo-full" className={props.className}>
      LangSmithLogoFull
    </div>
  ),
}));

vi.mock('../LangChainLogoWord.svg?react', () => ({
  default: (props: any) => (
    <div data-testid="langchain-logo-wordmark" className={props.className}>
      LangChainLogoWord
    </div>
  ),
}));

vi.mock('../LangChainLogoFull.svg?react', () => ({
  default: (props: any) => (
    <div data-testid="langchain-logo-full" className={props.className}>
      LangChainLogoFull
    </div>
  ),
}));

vi.mock('../FleetLogoIcon.svg?react', () => ({
  default: (props: any) => (
    <div data-testid="fleet-icon" className={props.className}>
      FleetLogoIcon
    </div>
  ),
}));

vi.mock('../FleetLogoWord.svg?react', () => ({
  default: (props: any) => (
    <div data-testid="fleet-logo" className={props.className}>
      FleetLogoWord
    </div>
  ),
}));

vi.mock('../FleetLogoFull.svg?react', () => ({
  default: (props: any) => (
    <div data-testid="fleet-logo-full" className={props.className}>
      FleetLogoFull
    </div>
  ),
}));

describe('Logo Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render default logo', () => {
    render(<Logo />);
    const logo = screen.getByTestId('logo-full');
    expect(logo).toBeInTheDocument();
  });

  it('should render logomark sizes', () => {
    const { rerender } = render(<Logo variant="logomark" size="sm" />);
    expect(screen.getByTestId('logo-icon')).toHaveClass('size-5');

    rerender(<Logo variant="logomark" size="md" />);
    expect(screen.getByTestId('logo-icon')).toHaveClass('size-6');
  });

  it('should render wordmark sizes', () => {
    const { rerender } = render(<Logo variant="wordmark" size="lg" />);
    expect(screen.getByTestId('logo-wordmark')).toHaveClass('h-6');

    rerender(<Logo variant="wordmark" size="xl" />);
    expect(screen.getByTestId('logo-wordmark')).toHaveClass('h-10');
  });

  it('should apply custom className', () => {
    render(<Logo className="custom-class" />);
    const logo = screen.getByTestId('logo-full');
    expect(logo).toHaveClass('custom-class');
  });

  it('should render the custom logo when no variant is requested', () => {
    render(<Logo customLogoUrl={CUSTOM_LOGO_URL} />);

    expect(screen.getByAltText('Custom Logo')).toHaveAttribute(
      'src',
      CUSTOM_LOGO_URL
    );
    expect(screen.queryByTestId('logo-full')).not.toBeInTheDocument();
  });

  it('should render the LangSmith logo when a LangSmith variant is requested with a custom logo configured', () => {
    render(
      <Logo
        brand="langsmith"
        variant="wordmark"
        size="md"
        customLogoUrl={CUSTOM_LOGO_URL}
      />
    );

    expect(screen.getByTestId('logo-wordmark')).toBeInTheDocument();
    expect(screen.queryByAltText('Custom Logo')).not.toBeInTheDocument();
  });

  it('should render the Fleet logo when a Fleet variant is requested with a custom logo configured', () => {
    render(
      <Logo
        brand="fleet"
        variant="full"
        size="md"
        customLogoUrl={CUSTOM_LOGO_URL}
      />
    );

    expect(screen.getByTestId('fleet-logo-full')).toBeInTheDocument();
    expect(screen.queryByAltText('Custom Logo')).not.toBeInTheDocument();
  });

  it('should render the LangChain logo when a LangChain brand is requested', () => {
    render(<Logo brand="langchain" variant="full" size="md" />);
    expect(screen.getByTestId('langchain-logo-full')).toBeInTheDocument();
  });

  it('should render the Engine logo when an Engine brand is requested', () => {
    render(<Logo brand="engine" variant="full" size="md" />);

    expect(screen.getByTestId('engine-logo-light')).toHaveClass('h-5');
    expect(screen.getByTestId('engine-logo-light')).toHaveClass('dark:hidden');
    expect(screen.getByTestId('engine-logo-dark')).toHaveClass('h-5');
    expect(screen.getByTestId('engine-logo-dark')).toHaveClass(
      'hidden',
      'dark:block'
    );
  });

  it('should render the Engine icon when the Engine logomark is requested', () => {
    render(<Logo brand="engine" variant="logomark" size="lg" />);

    expect(screen.getByTestId('engine-icon')).toHaveClass('size-8');
  });
});
