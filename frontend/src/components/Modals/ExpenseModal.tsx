import { useState, useEffect } from 'react';
import type {
  Expense,
  Category,
  CreateExpenseDto,
  UpdateExpenseDto,
} from '../../types';
import { expenseService } from '../../services/expenseService';
import { formatDateInput } from '../../utils/formatters';
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

interface ExpenseModalProps {
  expense: Expense | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

function ExpenseModal({
  expense,
  categories,
  onClose,
  onSuccess,
}: ExpenseModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
    date: formatDateInput(new Date()),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!expense;

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description,
        categoryId: expense.categoryId,
        date: formatDateInput(expense.date),
      });
    }
  }, [expense]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, categoryId: value });
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

    if (
      !formData.amount ||
      !formData.description ||
      !formData.categoryId ||
      !formData.date
    ) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && expense) {
        const updateData: UpdateExpenseDto = {
          amount: parseFloat(formData.amount),
          description: formData.description,
          categoryId: formData.categoryId,
          date: formData.date,
        };
        await expenseService.updateExpense(expense.id, updateData);
      } else {
        const createData: CreateExpenseDto = {
          amount: parseFloat(formData.amount),
          description: formData.description,
          categoryId: formData.categoryId,
          date: formData.date,
        };
        await expenseService.createExpense(createData);
      }
      onSuccess();
    } catch {
      setError(
        isEditMode ? 'Failed to update expense' : 'Failed to create expense',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal expense-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {isEditMode ? 'Edit Expense' : 'New Expense'}
            </h3>
            <p className="modal-subtitle">
              {isEditMode
                ? 'Update the details of your expense.'
                : 'Add a new expense to your list.'}
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
              <label className="input-label" htmlFor="amount">
                Amount
              </label>
              <div className="amount-input-wrapper">
                <span className="amount-currency">₹</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  className="input-field"
                  placeholder="00"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="description">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                className="input-field"
                placeholder="What was this expense for?"
                value={formData.description}
                onChange={handleChange}
                maxLength={255}
                required
              />
            </div>

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
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="date">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                className="input-field"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
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

export default ExpenseModal;
