# 💰 Expense Tracker AI

A modern, professional expense tracking web application built with Next.js 14, TypeScript, and Tailwind CSS. This application helps users manage their personal finances with intuitive features and a clean, responsive design.

## ✨ Features

### Core Functionality
- **Add Expenses**: Create new expenses with amount, description, category, and date
- **View & Manage**: Browse expenses in a clean, organized list with search and filtering
- **Edit & Delete**: Modify or remove existing expenses with confirmation
- **Data Persistence**: All data is stored locally using localStorage

### Dashboard & Analytics
- **Summary Cards**: Total expenses, monthly spending, transaction count, and average per transaction
- **Category Breakdown**: Visual representation of spending by category with percentages
- **Recent Expenses**: Quick view of the latest transactions
- **Spending Overview**: Category-based spending visualization

### Advanced Features
- **Smart Filtering**: Filter by date range, category, and search terms
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Export Functionality**: Export expense data to CSV format
- **Form Validation**: Comprehensive input validation with error handling
- **Loading States**: Professional loading indicators and transitions

### Categories
- Food
- Transportation
- Entertainment
- Shopping
- Bills
- Other

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. **Clone the repository** (or extract the files):
   ```bash
   git clone <repository-url>
   cd expense-tracker-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout component
│   └── page.tsx         # Main application page
├── components/
│   ├── Dashboard.tsx    # Dashboard with analytics
│   ├── ExpenseForm.tsx  # Add/edit expense form
│   ├── ExpenseFilters.tsx # Filtering interface
│   ├── ExpenseList.tsx  # Expense table/list
│   └── Header.tsx       # Navigation header
├── lib/
│   ├── storage.ts       # localStorage utilities
│   └── utils.ts         # Helper functions
└── types/
    └── expense.ts       # TypeScript interfaces
```

## 📱 How to Use

### Adding Expenses
1. Navigate to the "Expenses" tab
2. Fill out the expense form:
   - **Amount**: Enter the expense amount (required, must be > 0)
   - **Description**: Provide a description (required)
   - **Category**: Select from predefined categories
   - **Date**: Choose the expense date (defaults to today)
3. Click "Add Expense" to save

### Viewing & Managing Expenses
- **Filter**: Use the filter bar to search by description, category, or date range
- **Edit**: Click "Edit" next to any expense to modify it
- **Delete**: Click "Delete" and confirm to remove an expense
- **Export**: Click "Export CSV" to download your expense data

### Dashboard Analytics
- View spending summaries and trends
- See top spending categories with visual bars
- Check recent transactions
- Monitor monthly vs. total spending

## 🛠️ Technical Details

### Built With
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: Modern state management
- **localStorage**: Client-side data persistence

### Key Features
- **Responsive Design**: Mobile-first approach with breakpoints
- **Form Validation**: Real-time validation with error messages
- **Currency Formatting**: Automatic USD formatting
- **Date Handling**: Intuitive date picker and formatting
- **Search & Filter**: Real-time filtering without page refresh
- **Export**: CSV generation and download functionality

### Performance Optimizations
- Client-side rendering for instant interactions
- Efficient state management with React hooks
- Optimized bundle size with Next.js
- Responsive images and icons

## 🎨 Design Features

- **Modern UI**: Clean, professional design with subtle shadows and transitions
- **Color Coding**: Category-based color system for easy recognition
- **Loading States**: Smooth loading indicators and disabled states
- **Visual Feedback**: Hover effects and button states
- **Mobile Responsive**: Optimized layouts for all screen sizes

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 📊 Data Management

All expense data is stored locally in your browser's localStorage. This means:
- ✅ Your data stays private and secure
- ✅ No internet connection required after initial load
- ✅ Fast performance with instant access
- ⚠️ Data is tied to the specific browser/device
- ⚠️ Clearing browser data will remove expenses

## 🚀 Future Enhancements

Potential features for future versions:
- Cloud synchronization
- Budget tracking and alerts
- Multiple currency support
- Recurring expense templates
- Advanced reporting and charts
- Import from bank statements
- Mobile app version

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

**Enjoy tracking your expenses!** 💰📊