import { useState, useEffect } from 'react';
import type {
  BudgetSummary,
  Category,
  CreateBudgetDto,
  UpdateBudgetDto,
} from '../../types';
import { budgetService } from '../../services/budgetService';
import { getCurrentMonth, getCurrentYear } from '../../utils/formatters';
import { getCategoryIcon } from '../../utils/categoryIcons';
import CustomSelect from '../CustomSelect/CustomSelect';
import './Modals.css';

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

interface BudgetModalProps {
  budget: BudgetSummary | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

function BudgetModal({
  budget,
  categories,
  onClose,
  onSuccess,
}: BudgetModalProps) {
  const [formData, setFormData] = useState({
    categoryId: '',
    limit: '',
    month: getCurrentMonth(),
    year: getCurrentYear(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!budget;

  useEffect(() => {
    if (budget) {
      setFormData({
        categoryId: budget.categoryId,
        limit: budget.limit.toString(),
        month: budget.month,
        year: budget.year,
      });
    }
  }, [budget]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, categoryId: value });
    setError('');
  };

  const handleMonthChange = (value: string) => {
    setFormData({ ...formData, month: parseInt(value) });
    setError('');
  };

  const handleYearChange = (value: string) => {
    setFormData({ ...formData, year: parseInt(value) });
    setError('');
  };

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
    icon: getCategoryIcon(cat.icon),
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.categoryId || !formData.limit) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(formData.limit) <= 0) {
      setError('Budget limit must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && budget) {
        const updateData: UpdateBudgetDto = {
          limit: parseFloat(formData.limit),
        };
        await budgetService.updateBudget(budget.id, updateData);
      } else {
        const createData: CreateBudgetDto = {
          categoryId: formData.categoryId,
          limit: parseFloat(formData.limit),
          month: formData.month,
          year: formData.year,
        };
        await budgetService.createBudget(createData);
      }
      onSuccess();
    } catch {
      setError(
        isEditMode ? 'Failed to update budget' : 'Failed to create budget',
      );
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => ({
    value: String(getCurrentYear() + i),
    label: String(getCurrentYear() + i),
  }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal budget-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {isEditMode ? 'Edit Budget' : 'New Budget'}
            </h3>
            <p className="modal-subtitle">
              {isEditMode
                ? 'Update your budget limit.'
                : 'Add a new budget to track your spending.'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="modal-body">
            {error && <div className="auth-error">{error}</div>}

            <div className="input-group">
              <label className="input-label" htmlFor="categoryId">
                Category
              </label>
              <CustomSelect
                id="categoryId"
                name="categoryId"
                options={categoryOptions}
                value={formData.categoryId}
                onChange={handleCategoryChange}
                placeholder="Select a category"
                disabled={isEditMode}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="limit">
                Budget Limit
              </label>
              <div className="amount-input-wrapper">
                <span className="amount-currency">₹</span>
                <input
                  type="number"
                  id="limit"
                  name="limit"
                  className="input-field"
                  placeholder="0.00"
                  value={formData.limit}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>

            {!isEditMode && (
              <div className="budget-month-year">
                <div className="input-group">
                  <label className="input-label" htmlFor="month">
                    Month
                  </label>
                  <CustomSelect
                    id="month"
                    name="month"
                    options={months}
                    value={String(formData.month)}
                    onChange={handleMonthChange}
                    placeholder="Select month"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="year">
                    Year
                  </label>
                  <CustomSelect
                    id="year"
                    name="year"
                    options={years}
                    value={String(formData.year)}
                    onChange={handleYearChange}
                    placeholder="Select year"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BudgetModal;
