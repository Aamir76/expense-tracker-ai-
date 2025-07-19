# Testing Guide for Expense Tracker AI

## Manual Testing Checklist

Once you have the application running with `npm run dev`, test the following features:

### 1. Initial Load
- [ ] Application loads without errors
- [ ] Dashboard is displayed by default
- [ ] Header navigation is visible
- [ ] No expenses message is shown on dashboard

### 2. Adding Expenses
- [ ] Navigate to "Expenses" tab
- [ ] Form validation works:
  - [ ] Empty amount shows error
  - [ ] Negative amount shows error
  - [ ] Empty description shows error
  - [ ] Empty date shows error
- [ ] Successfully add expense with valid data
- [ ] Form clears after successful submission
- [ ] New expense appears in the list

### 3. Expense List
- [ ] Expenses display in table format
- [ ] All columns show correct data (Date, Description, Category, Amount)
- [ ] Categories have colored badges
- [ ] Edit and Delete buttons are visible
- [ ] Currency formatting is correct

### 4. Filtering & Search
- [ ] Search by description works
- [ ] Search by category works
- [ ] Category filter dropdown works
- [ ] Date range filters work
- [ ] "Clear Filters" button works
- [ ] Filtered results update in real-time

### 5. Edit Functionality
- [ ] Click "Edit" button loads expense data into form
- [ ] Form shows "Edit Expense" title
- [ ] "Cancel" button clears edit mode
- [ ] "Update Expense" saves changes
- [ ] Updated expense reflects in list

### 6. Delete Functionality
- [ ] Click "Delete" shows confirmation dialog
- [ ] "Cancel" in dialog keeps expense
- [ ] "OK" in dialog removes expense
- [ ] Expense is removed from list and localStorage

### 7. Dashboard Analytics
- [ ] Total expenses card shows correct sum
- [ ] Monthly total shows current month expenses
- [ ] Transaction count is accurate
- [ ] Average per transaction is calculated correctly
- [ ] Top categories section shows spending breakdown
- [ ] Recent expenses shows latest 5 expenses
- [ ] Spending overview shows all categories

### 8. Export Functionality
- [ ] "Export CSV" button appears when expenses exist
- [ ] Clicking export downloads CSV file
- [ ] CSV contains all filtered expenses
- [ ] CSV has correct headers and data format

### 9. Responsive Design
- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] All components adapt to screen size
- [ ] Text remains readable on all devices
- [ ] Touch targets are appropriate for mobile

### 10. Data Persistence
- [ ] Add expense and refresh page - data persists
- [ ] Edit expense and refresh page - changes persist
- [ ] Delete expense and refresh page - deletion persists
- [ ] Open in incognito/private mode - data is isolated

### 11. Performance
- [ ] Page loads quickly
- [ ] Form submissions are responsive
- [ ] Filtering is instant
- [ ] No console errors in browser dev tools
- [ ] Smooth animations and transitions

## Expected Behavior

### Sample Data for Testing
Add these sample expenses for comprehensive testing:

1. **Grocery Shopping**
   - Amount: $45.67
   - Category: Food
   - Date: Today

2. **Gas Fill-up**
   - Amount: $52.00
   - Category: Transportation
   - Date: Yesterday

3. **Movie Tickets**
   - Amount: $28.50
   - Category: Entertainment
   - Date: 3 days ago

4. **Electricity Bill**
   - Amount: $125.00
   - Category: Bills
   - Date: 1 week ago

5. **Online Shopping**
   - Amount: $89.99
   - Category: Shopping
   - Date: 2 weeks ago

### Browser Compatibility
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Troubleshooting

### Common Issues
1. **Blank page**: Check browser console for JavaScript errors
2. **Data not saving**: Verify localStorage is enabled in browser
3. **Styling issues**: Clear browser cache and reload
4. **Export not working**: Ensure browser allows downloads

### Development Issues
1. **npm run dev fails**: Delete node_modules and run `npm install` again
2. **TypeScript errors**: Check all imports and type definitions
3. **Build fails**: Verify all dependencies are properly installed

## Performance Benchmarks
- Initial page load: < 2 seconds
- Form submission: < 500ms
- Filter response: < 100ms
- Export generation: < 1 second (for 1000 expenses)

The application should handle up to 10,000 expenses efficiently in localStorage.