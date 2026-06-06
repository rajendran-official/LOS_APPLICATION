// pages/01-submission.page.js
import { executeQuery } from '../lib/db.js'; 

export class SubmissionPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.sendOtpButton = page.locator('button:has-text("Send OTP")');
        this.otpInputField = page.locator('input[placeholder*="Enter OTP"]'); 
        this.submitOtpButton = page.locator('button:has-text("Submit OTP")'); 
        
        // Locators for the pop-up modal dialog alert boxes
        this.popUpOkButton = page.locator('button:has-text("OK")');

        // Sidebar navigation locators
        this.loanApplicationsMenu = page.locator('text=/Loan Applications/i');
        this.loanApplicationLink = page.locator('text="Loan Application"');
    }

    // Common navigation logic to dismiss alerts and land on the table listing view
    async navigateToDashboard() {
        const okButton = this.popUpOkButton.first();
        if (await okButton.isVisible({ timeout: 5000 })) {
            await okButton.click();
            await this.page.waitForTimeout(1000);
        }
        await this.loanApplicationsMenu.click();
        await this.loanApplicationLink.click();
    }

    // 2. Updated OTP verification method matching your exact case-sensitive SQL structure
    async handleOtpVerification(emailAddress) {
        console.log(`⏳ Waiting for backend to write OTP to the database for email: ${emailAddress}...`);
        await this.page.waitForTimeout(3000); 
        
        // Using your exact case-sensitive double quotes syntax and Oracle row limits
        const sqlQuery = `
            SELECT "OTP" 
            FROM "ApplicantMailOtp" 
            WHERE "MailId" = :emailAddress 
            ORDER BY "Created_On" DESC
            FETCH FIRST 1 ROWS ONLY
        `;

        try {
            // Execute the query using your database helper module
            const result = await executeQuery(sqlQuery, [emailAddress]);

            // Validate that database records exist
            if (!result.rows || result.rows.length === 0) {
                throw new Error(`No active OTP found in database for email string value: ${emailAddress}`);
            }

            // Extract the OTP string dynamically regardless of your default query return style
            // Handling both Object array formatting and clean Array indexes safely
            let retrievedOtp;
            const firstRow = result.rows[0];
            
            if (typeof firstRow === 'object' && firstRow !== null) {
                // If the driver returns row objects (e.g. { OTP: '123456' } or { "OTP": '123456' })
                retrievedOtp = firstRow.OTP || firstRow["OTP"] || Object.values(firstRow)[0];
            } else if (Array.isArray(firstRow)) {
                // If it returns standard array indexes
                retrievedOtp = firstRow[0];
            } else {
                retrievedOtp = firstRow;
            }

            if (!retrievedOtp) {
                throw new Error("Failed to extract raw data string from returned query database matrix.");
            }

            const cleanOtpString = retrievedOtp.toString().trim();
            console.log(`✅ Database OTP successfully retrieved for ${emailAddress}: ${cleanOtpString}`);

            // 3. Input value string into the browser element and confirm
            await this.otpInputField.fill(cleanOtpString);
            await this.submitOtpButton.click();

        } catch (error) {
            console.error(`🔴 Automation Database OTP Hook Failed: ${error.message}`);
            throw error;
        }
    }

    // Method to create a brand new file from scratch
    async submitApplication() {
        await this.navigateToDashboard();
        
        await this.page.getByRole('button', { name: '+ Create New Application' }).click();
        await this.page.getByLabel('Default select example').first().selectOption('1');
        await this.page.locator('nz-select-search').getByRole('textbox').click();
        await this.page.getByText('L0100000878 05-Jun-').click();
        await this.page.getByRole('button', { name: 'Confirm' }).click();
        await this.page.getByLabel('Default select example').nth(1).selectOption('930');
        await this.page.getByLabel('Default select example').nth(2).selectOption('23');
        await this.page.getByLabel('Default select example').nth(3).selectOption('3');
        await this.page.getByRole('textbox', { name: 'Enter remarks for the purpose' }).click();
        await this.page.getByRole('textbox', { name: 'Enter remarks for the purpose' }).fill('Business Unit Development');
        await this.page.getByRole('button', { name: 'Continue' }).click();
        
        // Execute profile form automation filling sequences
        await this.fillApplicationFormDetails();
    }

    // Method to search, isolate, and resume an existing application record
    async Application(applicationId) {
        await this.navigateToDashboard();

        const targetIdCell = this.page.locator('table, tbody, tr').locator(`text="${applicationId}"`).first();
        await targetIdCell.waitFor({ state: 'visible', timeout: 8000 });
        await targetIdCell.click();

        // Execute profile form automation filling sequences
        await this.fillApplicationFormDetails();
    }

    // Isolated reusable helper method to fill out the secondary form details
    async fillApplicationFormDetails() {
        const targetEmail = '360175@manappuram.com';

        await this.page.getByRole('button').first().click(); 
        await this.page.getByLabel('Default select example').nth(1).selectOption('1');
        await this.page.getByRole('textbox', { name: 'Father Name*' }).fill('John');
        await this.page.getByRole('textbox', { name: 'Enter Mother Name' }).fill('Jenifer');
        await this.page.locator('#martial_Status').selectOption('1');
        
        // Explicitly filling the field using the target configuration
        await this.page.getByRole('textbox', { name: 'Email Address *' }).fill(targetEmail);
        
        await this.page.getByLabel('Default select example').nth(3).selectOption('2');
        await this.page.getByLabel('Default select example').nth(4).selectOption('3');
        
        // Trigger the OTP generation request
        await this.sendOtpButton.click();

        // Intercept and resolve validation checks passing email argument safely down
        await this.handleOtpVerification(targetEmail);
    }
}
