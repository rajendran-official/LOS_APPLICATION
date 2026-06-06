import { test, expect } from '@playwright/test';
import { BasePage } from '../../pages/base.page.js';

test('BM User Login and BOH Verification', async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.navigateToLogin();
    await basePage.loginAs('BM');
    
    // Member D continues writing approval & sanction flows here...
});
