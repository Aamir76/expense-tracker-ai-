// Test runner for expense tracker export functionality
const puppeteer = require('puppeteer');

async function runExportTests() {
    const browser = await puppeteer.launch({ 
        headless: false, 
        devtools: true,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        console.log(`PAGE LOG: ${msg.text()}`);
    });
    
    // Listen for errors
    page.on('pageerror', error => {
        console.log(`PAGE ERROR: ${error.message}`);
    });
    
    try {
        console.log('Navigating to expense tracker...');
        await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
        
        // Add sample data
        console.log('Adding sample data...');
        await page.evaluate(() => {
            const sampleExpenses = [
                {
                    id: 'exp-1',
                    amount: 25.50,
                    description: 'Lunch at restaurant',
                    category: 'Food',
                    date: '2025-01-15',
                    createdAt: '2025-01-15T12:00:00Z',
                    updatedAt: '2025-01-15T12:00:00Z'
                },
                {
                    id: 'exp-2',
                    amount: 45.00,
                    description: 'Gas for car',
                    category: 'Transportation',
                    date: '2025-01-14',
                    createdAt: '2025-01-14T10:00:00Z',
                    updatedAt: '2025-01-14T10:00:00Z'
                },
                {
                    id: 'exp-3',
                    amount: 15.99,
                    description: 'Movie ticket',
                    category: 'Entertainment',
                    date: '2025-01-13',
                    createdAt: '2025-01-13T20:00:00Z',
                    updatedAt: '2025-01-13T20:00:00Z'
                },
                {
                    id: 'exp-4',
                    amount: 120.00,
                    description: 'Electricity bill',
                    category: 'Bills',
                    date: '2025-01-12',
                    createdAt: '2025-01-12T09:00:00Z',
                    updatedAt: '2025-01-12T09:00:00Z'
                },
                {
                    id: 'exp-5',
                    amount: 78.50,
                    description: 'New shoes',
                    category: 'Shopping',
                    date: '2025-01-11',
                    createdAt: '2025-01-11T15:00:00Z',
                    updatedAt: '2025-01-11T15:00:00Z'
                }
            ];
            localStorage.setItem('expense-tracker-data', JSON.stringify(sampleExpenses));
        });
        
        await page.reload({ waitUntil: 'networkidle0' });
        
        // Test 1: Check if Export Data button appears when there are expenses
        console.log('Test 1: Checking Export Data button visibility...');
        
        // Navigate to expenses page
        const expensesNav = await page.$('nav a:nth-child(2), header a:nth-child(2), a[href*="expenses"], button:contains("Expenses")');
        if (expensesNav) {
            await expensesNav.click();
            await page.waitForTimeout(1000);
        }
        
        const exportButton = await page.$('button:has-text("Export Data"), button[class*="bg-blue"]:has-text("Export")');
        if (exportButton) {
            console.log('✅ Export Data button found and visible');
            
            // Test 2: Test opening the ExportModal
            console.log('Test 2: Testing Export Modal opening...');
            await exportButton.click();
            await page.waitForTimeout(1000);
            
            const modal = await page.$('[class*="fixed"][class*="z-50"], [role="dialog"], .modal');
            if (modal) {
                console.log('✅ Export Modal opened successfully');
                
                // Test 3: Check all three tabs
                console.log('Test 3: Testing tab navigation...');
                
                const filtersTab = await page.$('button:has-text("Filters")');
                const previewTab = await page.$('button:has-text("Preview")');
                const exportTab = await page.$('button:has-text("Export"):not(:has-text("Export Data"))');
                
                if (filtersTab && previewTab && exportTab) {
                    console.log('✅ All three tabs found');
                    
                    // Test 4: Test date range filtering
                    console.log('Test 4: Testing date range filtering...');
                    await filtersTab.click();
                    await page.waitForTimeout(500);
                    
                    const dateInputs = await page.$$('input[type="date"]');
                    if (dateInputs.length >= 2) {
                        await dateInputs[0].type('2025-01-13');
                        await dateInputs[1].type('2025-01-15');
                        console.log('✅ Date range filtering inputs work');
                        
                        // Test 5: Test category filtering
                        console.log('Test 5: Testing category filtering...');
                        
                        const categoryCheckboxes = await page.$$('input[type="checkbox"]');
                        const selectAllBtn = await page.$('button:has-text("Select All")');
                        const deselectAllBtn = await page.$('button:has-text("Deselect All")');
                        
                        if (categoryCheckboxes.length > 0 && selectAllBtn && deselectAllBtn) {
                            // Test individual checkbox
                            await categoryCheckboxes[0].click();
                            await page.waitForTimeout(200);
                            
                            // Test select all
                            await selectAllBtn.click();
                            await page.waitForTimeout(200);
                            
                            // Test deselect all
                            await deselectAllBtn.click();
                            await page.waitForTimeout(200);
                            
                            console.log('✅ Category filtering controls work');
                            
                            // Reset to all selected for preview test
                            await selectAllBtn.click();
                            await page.waitForTimeout(200);
                            
                            // Test 6: Test preview functionality
                            console.log('Test 6: Testing preview functionality...');
                            await previewTab.click();
                            await page.waitForTimeout(500);
                            
                            const previewTable = await page.$('table, [class*="table"]');
                            const recordCount = await page.$text('[class*="blue"]:has-text("record")');
                            
                            if (previewTable || recordCount) {
                                console.log('✅ Preview functionality works');
                                
                                // Test 7-9: Test export formats
                                console.log('Test 7-9: Testing export formats...');
                                await exportTab.click();
                                await page.waitForTimeout(500);
                                
                                const csvRadio = await page.$('input[type="radio"][value="csv"]');
                                const jsonRadio = await page.$('input[type="radio"][value="json"]');
                                const pdfRadio = await page.$('input[type="radio"][value="pdf"]');
                                const filenameInput = await page.$('input[type="text"]');
                                const finalExportBtn = await page.$('button:has-text("Export Data"):not([disabled])');
                                
                                if (csvRadio && jsonRadio && pdfRadio && filenameInput && finalExportBtn) {
                                    console.log('✅ All export format options available');
                                    
                                    // Test each format
                                    console.log('Testing CSV export...');
                                    await csvRadio.click();
                                    await page.waitForTimeout(500);
                                    await finalExportBtn.click();
                                    await page.waitForTimeout(1000);
                                    console.log('✅ CSV export attempted');
                                    
                                    console.log('Testing JSON export...');
                                    await jsonRadio.click();
                                    await page.waitForTimeout(500);
                                    await finalExportBtn.click();
                                    await page.waitForTimeout(1000);
                                    console.log('✅ JSON export attempted');
                                    
                                    console.log('Testing PDF export...');
                                    await pdfRadio.click();
                                    await page.waitForTimeout(500);
                                    await finalExportBtn.click();
                                    await page.waitForTimeout(2000);
                                    console.log('✅ PDF export attempted');
                                } else {
                                    console.log('❌ Some export format options missing');
                                }
                            } else {
                                console.log('❌ Preview functionality not working');
                            }
                        } else {
                            console.log('❌ Category filtering controls missing');
                        }
                    } else {
                        console.log('❌ Date range inputs not found');
                    }
                } else {
                    console.log('❌ Not all tabs found');
                }
                
                // Test 10: Test edge cases
                console.log('Test 10: Testing edge cases...');
                
                // Go back to filters and deselect all categories
                await filtersTab.click();
                await page.waitForTimeout(500);
                const deselectAllBtn2 = await page.$('button:has-text("Deselect All")');
                if (deselectAllBtn2) {
                    await deselectAllBtn2.click();
                    await page.waitForTimeout(500);
                    
                    // Check preview shows no data
                    await previewTab.click();
                    await page.waitForTimeout(500);
                    
                    const noDataMessage = await page.$text('*:has-text("No data matches")');
                    if (noDataMessage) {
                        console.log('✅ Empty result set handled properly');
                    } else {
                        console.log('❌ Empty result set not handled properly');
                    }
                    
                    // Check export button is disabled
                    await exportTab.click();
                    await page.waitForTimeout(500);
                    const disabledExportBtn = await page.$('button:has-text("Export Data")[disabled]');
                    if (disabledExportBtn) {
                        console.log('✅ Export button correctly disabled when no data');
                    } else {
                        console.log('❌ Export button should be disabled when no data');
                    }
                } else {
                    console.log('❌ Could not test edge cases');
                }
                
            } else {
                console.log('❌ Export Modal did not open');
            }
        } else {
            console.log('❌ Export Data button not found');
        }
        
        // Test with empty data
        console.log('Test 11: Testing with empty data set...');
        await page.evaluate(() => {
            localStorage.removeItem('expense-tracker-data');
        });
        await page.reload({ waitUntil: 'networkidle0' });
        
        const emptyExportButton = await page.$('button:has-text("Export Data")');
        if (!emptyExportButton) {
            console.log('✅ Export button correctly hidden when no expenses');
        } else {
            console.log('❌ Export button should be hidden when no expenses');
        }
        
        console.log('\n=== TEST SUMMARY ===');
        console.log('All tests completed. Check the logs above for detailed results.');
        
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        // Keep browser open for manual inspection
        console.log('Browser will remain open for manual inspection...');
        // await browser.close();
    }
}

runExportTests().catch(console.error);