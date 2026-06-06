import { test, expect } from '@playwright/test';
import { BasePage } from '../../pages/base.page.js'; 
import { SubmissionPage } from '../../pages/01-submission.page.js'; 

const TARGET_APPLICATION_ID = '36010046678869'; 

/**
 * TEST 1: Run this once to generate a brand new Application ID from scratch
 */
test('SO User - Create New Application', async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.navigateToLogin();
    await basePage.loginAs('SO');

    const submissionPage = new SubmissionPage(page);
    const newId = await submissionPage.submitApplication(); 
    
    console.log(`\nCaptured Application ID: ${newId}\n`);
    await page.pause(); 
});

/**
 * TEST 2: Run this to skip form creation and open your specific target ID from the table
 */
test('SO User - Resume Existing Application ID', async ({ page }) => {
    const basePage = new BasePage(page);
    await basePage.navigateToLogin();
    await basePage.loginAs('SO');

    const submissionPage = new SubmissionPage(page);
    
    // Navigates the menu and clicks your unique Application ID directly from the grid row
    await submissionPage.Application(TARGET_APPLICATION_ID); 

    // Continue writing your steps for the next screens below here
    console.log(`Successfully opened file workflow for ID: ${TARGET_APPLICATION_ID}`);
    await page.pause(); 
});
