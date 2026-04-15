import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';
import './profile.css';

const BellIcon = () => (
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
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SaveIcon = () => (
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
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const CheckIcon = () => (
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
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

function Profile() {
  const { user, updateProfile, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    monthlyIncome: '',
    emailNotifications: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        monthlyIncome: user.monthlyIncome?.toString() || '',
        emailNotifications: user.emailNotifications ?? true,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || formData.username.length < 4) {
      setError('Username must be at least 4 characters');
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        username: formData.username,
        monthlyIncome: formData.monthlyIncome
          ? parseFloat(formData.monthlyIncome)
          : undefined,
        emailNotifications: formData.emailNotifications,
      });
      refreshUser();
      setSuccess('Profile updated successfully!');
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitial = () => {
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };

  const formatMemberSince = () => {
    if (!user?.CreatedAt) return 'N/A';
    const date = new Date(user.CreatedAt);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'long',
    }).format(date);
  };

  const formatLastUpdated = () => {
    if (!user?.UpdatedAt) return 'N/A';
    return formatDate(user.UpdatedAt);
  };

  // Check if form data has changed from original user data
  const hasChanges = (): boolean => {
    if (!user) return false;

    const originalUsername = user.username || '';
    const originalIncome = user.monthlyIncome?.toString() || '';
    const originalNotifications = user.emailNotifications ?? true;

    return (
      formData.username !== originalUsername ||
      formData.monthlyIncome !== originalIncome ||
      formData.emailNotifications !== originalNotifications
    );
  };

  if (!user) {
    return <div className="loading-screen">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">{getUserInitial()}</div>
          <div className="profile-avatar-info">
            <h2>{user.username}</h2>
            <p>{user.email}</p>
          </div>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {success && (
          <div className="profile-success">
            <CheckIcon />
            {success}
          </div>
        )}

        <form className="profile-form" onSubmit={(e) => void handleSubmit(e)}>
          <div className="input-group">
            <label className="profile-input-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="profile-input-field"
              value={user.email}
              disabled
            />
          </div>

          <div className="input-group">
            <label className="profile-input-label" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="profile-input-field"
              value={formData.username}
              onChange={handleChange}
              minLength={4}
              maxLength={20}
            />
          </div>

          <div className="input-group">
            <label className="profile-input-label" htmlFor="monthlyIncome">
              Monthly Income
            </label>
            <input
              type="number"
              id="monthlyIncome"
              name="monthlyIncome"
              className="profile-input-field"
              placeholder="0"
              value={formData.monthlyIncome}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </div>

          <div className="notification-toggle">
            <div className="notification-toggle-left">
              <div className="notification-icon">
                <BellIcon />
              </div>
              <div className="notification-info">
                <h4>Email Notifications</h4>
                <p>Receive budget alerts and reports</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={formData.emailNotifications}
                onChange={handleChange}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary profile-save-btn"
            disabled={loading || !hasChanges()}
          >
            <SaveIcon />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="account-info">
          <h3 className="account-info-title">Account Information</h3>
          <div className="account-info-grid">
            <div className="account-info-item">
              <span className="account-info-label">Member since</span>
              <span className="account-info-value">{formatMemberSince()}</span>
            </div>
            <div className="account-info-item">
              <span className="account-info-label">Last updated</span>
              <span className="account-info-value">{formatLastUpdated()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
