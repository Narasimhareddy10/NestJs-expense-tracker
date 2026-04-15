import { useState, useEffect } from 'react';
import { budgetService } from '../../services/budgetService';
import { categoryService } from '../../services/categoryService';
import type { BudgetSummary, Category } from '../../types';
import {
  formatCurrency,
  formatMonth,
  getCurrentMonth,
  getCurrentYear,
} from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import BudgetModal from '../../components/Modals/BudgetModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import './Budgets.css';

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

const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
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
    width="16"
    height="16"
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

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function Budgets() {
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<BudgetSummary | null>(
    null,
  );

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsData, categoriesData] = await Promise.all([
        budgetService.getBudgets(),
        categoryService.getCategories(),
      ]);
      setBudgets(budgetsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'on track':
        return 'on-track';
      case 'warning':
        return 'warning';
      case 'exceeded':
        return 'exceeded';
      default:
        return 'on-track';
    }
  };

  const handleCreateBudget = () => {
    setSelectedBudget(null);
    setShowBudgetModal(true);
  };

  const handleEditBudget = (budget: BudgetSummary) => {
    setSelectedBudget(budget);
    setShowBudgetModal(true);
  };

  const handleDeleteBudget = (budget: BudgetSummary) => {
    setSelectedBudget(budget);
    setShowDeleteModal(true);
  };

  const handleBudgetModalClose = () => {
    setShowBudgetModal(false);
    setSelectedBudget(null);
  };

  const handleBudgetModalSuccess = () => {
    setShowBudgetModal(false);
    setSelectedBudget(null);
    void fetchData();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBudget) return;

    try {
      await budgetService.deleteBudget(selectedBudget.id);
      setShowDeleteModal(false);
      setSelectedBudget(null);
      void fetchData();
    } catch (error) {
      console.error('Failed to delete budget:', error);
    }
  };

  // Get categories not yet used in budgets for this month
  const getAvailableCategories = (): Category[] => {
    const usedCategoryIds = budgets.map((b) => b.categoryId);
    return categories.filter((c) => !usedCategoryIds.includes(c.id));
  };

  if (loading) {
    return <div className="budgets-loading">Loading budgets...</div>;
  }

  return (
    <div className="budgets-page">
      {/* Header */}
      <div className="budgets-header">
        <div className="budgets-header-left">
          <h1>Budgets</h1>
          <p className="budgets-period">
            {formatMonth(getCurrentMonth(), getCurrentYear())} ·{' '}
            {budgets.length} active budgets
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateBudget}>
          <PlusIcon />
          Add Budget
        </button>
      </div>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <div className="budgets-empty">
          <div className="budgets-empty-icon">💰</div>
          <div className="budgets-empty-title">No budgets yet</div>
          <div className="budgets-empty-text">
            Create your first budget to start tracking your spending
          </div>
        </div>
      ) : (
        <div className="budgets-grid">
          {budgets.map((budget) => {
            const statusClass = getStatusClass(budget.status);
            const percentage = parseFloat(budget.percentage);
            const remaining = parseFloat(budget.remaining);

            return (
              <div key={budget.id} className="budget-card">
                <div className="budget-card-header">
                  <div className="budget-card-left">
                    <div className="budget-icon">
                      {getCategoryIcon(budget.category?.icon)}
                    </div>
                    <div className="budget-name">{budget.category?.name}</div>
                  </div>
                  <div className="budget-card-actions">
                    <button
                      className="icon-btn"
                      onClick={() => handleEditBudget(budget)}
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="icon-btn icon-btn-danger"
                      onClick={() => handleDeleteBudget(budget)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </div>

                <div className={`budget-status ${statusClass}`}>
                  <CheckIcon />
                  {budget.status}
                </div>

                <div className="budget-amounts">
                  <span className="budget-spent">
                    Spent: {formatCurrency(budget.spent)}
                  </span>
                  <span className="budget-limit">
                    Limit: {formatCurrency(budget.limit)}
                  </span>
                </div>

                <div className="budget-progress">
                  <div
                    className={`budget-progress-fill ${statusClass}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="budget-footer">
                  <span className="budget-percentage">
                    {percentage.toFixed(1)}% used
                  </span>
                  <span className={`budget-remaining ${statusClass}`}>
                    {formatCurrency(Math.abs(remaining))}{' '}
                    {remaining >= 0 ? 'remaining' : 'over'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <BudgetModal
          budget={selectedBudget}
          categories={selectedBudget ? categories : getAvailableCategories()}
          onClose={handleBudgetModalClose}
          onSuccess={handleBudgetModalSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBudget && (
        <DeleteConfirmModal
          title="Delete Budget"
          message={`Are you sure you want to delete the budget for "${selectedBudget.category?.name}"?`}
          onConfirm={() => void handleDeleteConfirm()}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedBudget(null);
          }}
        />
      )}
    </div>
  );
}

export default Budgets;
