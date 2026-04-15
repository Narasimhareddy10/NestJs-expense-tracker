import { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';
import type { Category } from '../../types';
import { getCategoryIcon } from '../../utils/categoryIcons';
import CategoryModal from '../../components/Modals/CategoryModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import './Categories.css';

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

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  useEffect(() => {
    void fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const customCategories = categories.filter((c) => c.isCustom);
  const defaultCategories = categories.filter((c) => !c.isCustom);

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false);
    setSelectedCategory(null);
  };

  const handleCategoryModalSuccess = () => {
    setShowCategoryModal(false);
    setSelectedCategory(null);
    void fetchCategories();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    try {
      await categoryService.deleteCategory(selectedCategory.id);
      setShowDeleteModal(false);
      setSelectedCategory(null);
      void fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  if (loading) {
    return <div className="categories-loading">Loading categories...</div>;
  }

  return (
    <div className="categories-page">
      {/* Header */}
      <div className="categories-header">
        <div className="categories-header-left">
          <h1>Categories</h1>
          <p className="categories-count">
            {categories.length} categories ({defaultCategories.length} default,{' '}
            {customCategories.length} custom)
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleCreateCategory}>
          <PlusIcon />
          Add Category
        </button>
      </div>

      {/* Custom Categories */}
      {customCategories.length > 0 && (
        <div className="category-section">
          <h3 className="category-section-title">Your Categories</h3>
          <div className="categories-grid">
            {customCategories.map((category) => (
              <div key={category.id} className="category-card custom">
                <div className="category-icon">
                  {getCategoryIcon(category.icon)}
                </div>
                <div className="category-info">
                  <div className="category-name">{category.name}</div>
                  <div className="category-type custom">Custom</div>
                </div>
                <div className="category-actions">
                  <button
                    className="icon-btn"
                    onClick={() => handleEditCategory(category)}
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="icon-btn icon-btn-danger"
                    onClick={() => handleDeleteCategory(category)}
                    title="Delete"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default Categories */}
      <div className="category-section">
        <h3 className="category-section-title">Default Categories</h3>
        <div className="categories-grid">
          {defaultCategories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-icon">
                {getCategoryIcon(category.icon)}
              </div>
              <div className="category-info">
                <div className="category-name">{category.name}</div>
                <div className="category-type">Default</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={selectedCategory}
          onClose={handleCategoryModalClose}
          onSuccess={handleCategoryModalSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <DeleteConfirmModal
          title="Delete Category"
          message={`Are you sure you want to delete "${selectedCategory.name}"? This may affect expenses using this category.`}
          onConfirm={() => void handleDeleteConfirm()}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
}

export default Categories;
