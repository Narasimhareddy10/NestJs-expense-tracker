import { useState, useEffect } from 'react';
import { expenseService } from '../../services/expenseService';
import { categoryService } from '../../services/categoryService';
import type {
  Expense,
  Category,
  FilterExpenseParams,
  PaginatedResult,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import ExpenseModal from '../../components/Modals/ExpenseModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import './Expenses.css';

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    lastpage: 1,
    limit: 10,
  });

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterExpenseParams>({
    categoryId: '',
    startDate: '',
    endDate: '',
    minAmount: undefined,
    maxAmount: undefined,
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterExpenseParams>({});

  // Modal states
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  useEffect(() => {
    void fetchCategories();
    void fetchExpenses();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchExpenses = async (params: FilterExpenseParams = {}) => {
    try {
      setLoading(true);
      const response: PaginatedResult<Expense> =
        await expenseService.getExpenses({
          ...params,
          search: searchQuery || undefined,
        });
      setExpenses(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    const cleanFilters: FilterExpenseParams = {};

    if (filters.categoryId) cleanFilters.categoryId = filters.categoryId;
    if (filters.startDate) cleanFilters.startDate = filters.startDate;
    if (filters.endDate) cleanFilters.endDate = filters.endDate;
    if (filters.minAmount) cleanFilters.minAmount = filters.minAmount;
    if (filters.maxAmount) cleanFilters.maxAmount = filters.maxAmount;

    setAppliedFilters(cleanFilters);
    void fetchExpenses({ ...cleanFilters, page: 1 });
  };

  const handleClearFilters = () => {
    setFilters({
      categoryId: '',
      startDate: '',
      endDate: '',
      minAmount: undefined,
      maxAmount: undefined,
    });
    setAppliedFilters({});
    void fetchExpenses({ page: 1 });
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      void fetchExpenses({ ...appliedFilters, search: searchQuery, page: 1 });
    }
  };

  const handlePageChange = (page: number) => {
    void fetchExpenses({ ...appliedFilters, page });
  };

  const handleCreateExpense = () => {
    setSelectedExpense(null);
    setShowExpenseModal(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowExpenseModal(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  };

  const handleExpenseModalClose = () => {
    setShowExpenseModal(false);
    setSelectedExpense(null);
  };

  const handleExpenseModalSuccess = () => {
    setShowExpenseModal(false);
    setSelectedExpense(null);
    void fetchExpenses({ ...appliedFilters, page: meta.page });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExpense) return;

    try {
      await expenseService.deleteExpense(selectedExpense.id);
      setShowDeleteModal(false);
      setSelectedExpense(null);
      void fetchExpenses({ ...appliedFilters, page: meta.page });
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= meta.lastpage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${meta.page === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>,
      );
    }
    return pages;
  };

  return (
    <div className="expenses-page">
      {/* Header */}
      <div className="expenses-header">
        <div className="expenses-header-left">
          <h1>Expenses</h1>
          <p className="expenses-count">
            <span>{meta.total}</span> total expenses
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateExpense}>
          <PlusIcon />
          Add Expense
        </button>
      </div>

      {/* Search & Filters Toggle */}
      <div className="expenses-toolbar">
        <div className="search-container">
          <span className="search-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="search-input"
            placeholder="Search expenses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
        <button
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <CustomSelect
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                    icon: getCategoryIcon(cat.icon),
                  })),
                ]}
                value={filters.categoryId || ''}
                onChange={(value) =>
                  setFilters({ ...filters, categoryId: value })
                }
                placeholder="All Categories"
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Start Date</label>
              <input
                type="date"
                className="input-field"
                value={filters.startDate || ''}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">End Date</label>
              <input
                type="date"
                className="input-field"
                value={filters.endDate || ''}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Min Amount</label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                value={filters.minAmount || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    minAmount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Max Amount</label>
              <input
                type="number"
                className="input-field"
                placeholder="Any"
                value={filters.maxAmount || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    maxAmount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
          </div>

          <div className="filter-actions">
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Clear
            </button>
            <button className="btn btn-primary" onClick={handleApplyFilters}>
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="expenses-card">
        {loading ? (
          <div className="expenses-loading">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="expenses-empty">
            <div className="expenses-empty-icon">📝</div>
            <div className="expenses-empty-title">No expenses found</div>
            <div className="expenses-empty-text">
              {Object.keys(appliedFilters).length > 0
                ? 'Try adjusting your filters'
                : 'Add your first expense to get started'}
            </div>
          </div>
        ) : (
          <>
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td data-label="Description">
                      <div className="expense-description">
                        <div className="expense-icon">
                          {getCategoryIcon(expense.category?.icon)}
                        </div>
                        <span className="expense-text">
                          {expense.description}
                        </span>
                      </div>
                    </td>
                    <td data-label="Category">
                      <span className="expense-category">
                        {expense.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td data-label="Date">
                      <span className="expense-date">
                        {formatDate(expense.date)}
                      </span>
                    </td>
                    <td data-label="Amount">
                      <span className="expense-amount">
                        {formatCurrency(expense.amount)}
                      </span>
                    </td>
                    <td data-label="Actions">
                      <div className="expense-actions">
                        <button
                          className="icon-btn"
                          onClick={() => handleEditExpense(expense)}
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          className="icon-btn icon-btn-danger"
                          onClick={() => handleDeleteExpense(expense)}
                          title="Delete"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {meta.lastpage > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {(meta.page - 1) * meta.limit + 1} to{' '}
                  {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}{' '}
                  expenses
                </div>
                <div className="pagination-controls">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page === 1}
                  >
                    Previous
                  </button>
                  {renderPagination()}
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page === meta.lastpage}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          expense={selectedExpense}
          categories={categories}
          onClose={handleExpenseModalClose}
          onSuccess={handleExpenseModalSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedExpense && (
        <DeleteConfirmModal
          title="Delete Expense"
          message={`Are you sure you want to delete "${selectedExpense.description}"?`}
          onConfirm={() => void handleDeleteConfirm()}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedExpense(null);
          }}
        />
      )}
    </div>
  );
}

export default Expenses;
