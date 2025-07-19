'use client';

interface HeaderProps {
  currentPage: 'dashboard' | 'expenses';
  onPageChange: (page: 'dashboard' | 'expenses') => void;
}

export default function Header({ currentPage, onPageChange }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
              💰 <span className="hidden sm:inline">Expense Tracker</span>
              <span className="sm:hidden">Expenses</span>
            </h1>
          </div>
          
          <nav className="flex space-x-2 sm:space-x-4">
            <button
              onClick={() => onPageChange('dashboard')}
              className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onPageChange('expenses')}
              className={`px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                currentPage === 'expenses'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Expenses
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}