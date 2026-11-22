import { expect, test } from 'playwright/test';

const scenarios = [
  {
    name: 'field-size-variants',
    id: 'components-inputs-input--sizes-and-variants',
    state: 'input',
  },
  {
    name: 'field-error-disabled',
    id: 'components-inputs-input--states',
    state: 'states',
  },
  {
    name: 'persistent-warning',
    id: 'components-status-banner--warning',
    state: 'banner',
  },
  {
    name: 'confirmation-open',
    id: 'components-layout-dialog--with-description',
    state: 'dialog',
  },
];

for (const scenario of scenarios) {
  test(scenario.name, async ({ page }, testInfo) => {
    await page.goto(
      `/iframe.html?id=${scenario.id}&viewMode=story&globals=backgrounds.value:${testInfo.project.name}`
    );
    if (scenario.state === 'dialog') {
      await page.getByRole('button', { name: 'Open dialog' }).click();
      await expect(
        page.getByRole('dialog', { name: 'Dialog title' })
      ).toBeVisible();
    } else if (scenario.state === 'input') {
      await expect(
        page.getByRole('textbox', { name: 'Email' }).first()
      ).toBeVisible();
    } else if (scenario.state === 'states') {
      await expect(
        page.getByRole('textbox', { name: 'Error' }).first()
      ).toHaveAttribute('aria-invalid', 'true');
    } else {
      await expect(page.getByText('Heads up', { exact: true })).toBeVisible();
    }
    await page.evaluate(() => document.fonts.ready);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            document.documentElement.classList.contains('dark') ||
            document.body.classList.contains('dark')
        )
      )
      .toBe(testInfo.project.name === 'dark');
    await expect(page).toHaveScreenshot(`${scenario.name}.png`, {
      animations: 'disabled',
      caret: 'hide',
    });
  });
}
