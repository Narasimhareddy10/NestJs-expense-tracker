import { useState, useEffect } from 'react';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../types';
import { categoryService } from '../../services/categoryService';
import { AVAILABLE_ICONS } from '../../utils/categoryIcons';
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

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

function CategoryModal({ category, onClose, onSuccess }: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'burger',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!category;

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon || 'other',
      });
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleIconSelect = (iconId: string) => {
    setFormData({ ...formData, icon: iconId });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter a category name');
      return;
    }

    setLoading(true);

    try {
      if (isEditMode && category) {
        const updateData: UpdateCategoryDto = {
          name: formData.name,
          icon: formData.icon,
        };
        await categoryService.updateCategory(category.id, updateData);
      } else {
        const createData: CreateCategoryDto = {
          name: formData.name,
          icon: formData.icon,
        };
        await categoryService.createCategory(createData);
      }
      onSuccess();
    } catch {
      setError(
        isEditMode ? 'Failed to update category' : 'Failed to create category',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal category-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {isEditMode ? 'Edit Category' : 'New Category'}
            </h3>
            <p className="modal-subtitle">
              {isEditMode
                ? 'Update your category details.'
                : 'Add a new category to organize your expenses.'}
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
              <label className="input-label" htmlFor="name">
                Category Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input-field"
                placeholder="e.g. Groceries"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
                required
              />
            </div>

            <div className="icon-selector">
              <label className="icon-selector-label">Icon</label>
              <div className="icon-grid">
                {AVAILABLE_ICONS.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    className={`icon-option ${formData.icon === icon.id ? 'selected' : ''}`}
                    onClick={() => handleIconSelect(icon.id)}
                    title={icon.name}
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>
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

export default CategoryModal;
