import { X, Eye, EyeOff } from 'lucide-react';
import './ProfileModals.css';

export function EditProfileModal({
  editProfileOpen,
  setEditProfileOpen,
  profileForm,
  setProfileForm,
  handleSaveProfile,
  formError,
  formMessage,
  loading,
  darkMode,
  theme
}) {
  if (!editProfileOpen) return null;

  return (
    <div
      className="profile-modal-overlay"
      onClick={() => {
        if (!loading) setEditProfileOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="profile-modal-box"
        style={{
          background: theme.cardBg,
          color: theme.text,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="profile-modal-header">
          <h3 style={{ margin: 0 }}>Edit Profile</h3>
          <button
            type="button"
            disabled={loading}
            onClick={() => setEditProfileOpen(false)}
            className="profile-modal-close-btn"
            style={{ color: theme.subText }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: theme.subText, fontSize: '14px' }}>
          Update your account information.
        </p>

        <form onSubmit={handleSaveProfile}>
          {[
            { key: 'name', label: 'Full Name', type: 'text' },
            { key: 'username', label: 'Username', type: 'text' },
            { key: 'email', label: 'Email Address', type: 'email' },
          ].map(({ key, label, type }) => (
            <div key={key} className="profile-form-field">
              <label htmlFor={`profile-${key}`} className="profile-form-label">
                {label}
              </label>
              <input
                id={`profile-${key}`}
                type={type}
                required
                maxLength={key === 'name' ? 100 : key === 'username' ? 30 : undefined}
                minLength={key === 'username' ? 3 : undefined}
                autoComplete={key === 'email' ? 'email' : 'off'}
                value={profileForm[key]}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                disabled={loading}
                className="profile-form-input"
                style={{
                  border: `1px solid ${theme.border}`,
                  background: darkMode ? '#0f172a' : '#ffffff',
                  color: theme.text,
                }}
              />
            </div>
          ))}

          {formError && <p role="alert" style={{ color: '#dc2626', fontSize: '13px' }}>{formError}</p>}
          {formMessage && <p role="status" style={{ color: '#16a34a', fontSize: '13px' }}>{formMessage}</p>}

          <div className="profile-form-actions">
            <button
              type="button"
              disabled={loading}
              onClick={() => setEditProfileOpen(false)}
              className="profile-btn-cancel"
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.cardBg,
                color: theme.text,
              }}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="profile-btn-submit">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function ChangePasswordModal({
  changePasswordOpen,
  setChangePasswordOpen,
  passwordForm,
  setPasswordForm,
  handleChangePassword,
  showNewPassword,
  setShowNewPassword,
  formError,
  formMessage,
  loading,
  darkMode,
  theme
}) {
  if (!changePasswordOpen) return null;

  return (
    <div
      className="profile-modal-overlay"
      onClick={() => {
        if (!loading) setChangePasswordOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="profile-modal-box"
        style={{
          background: theme.cardBg,
          color: theme.text,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="profile-modal-header">
          <h3 style={{ margin: 0 }}>Change Password</h3>
          <button
            type="button"
            disabled={loading}
            onClick={() => setChangePasswordOpen(false)}
            className="profile-modal-close-btn"
            style={{ color: theme.subText }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: theme.subText, fontSize: '14px' }}>
          Enter your current password and choose a new one.
        </p>

        <form onSubmit={handleChangePassword}>
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirmPassword', label: 'Confirm New Password' },
          ].map(({ key, label }) => (
            <div key={key} className="profile-form-field">
              <label htmlFor={`password-${key}`} className="profile-form-label">
                {label}
              </label>
              <input
                id={`password-${key}`}
                type={key === 'currentPassword' ? 'password' : showNewPassword ? 'text' : 'password'}
                autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'}
                required
                minLength={key === 'newPassword' ? 8 : undefined}
                value={passwordForm[key]}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                disabled={loading}
                className="profile-form-input"
                style={{
                  border: `1px solid ${theme.border}`,
                  background: darkMode ? '#0f172a' : '#ffffff',
                  color: theme.text,
                }}
              />
            </div>
          ))}

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              marginBottom: '14px',
              cursor: 'pointer',
              color: showNewPassword ? '#f97316' : theme.text,
            }}
          >
            <input
              type="checkbox"
              checked={showNewPassword}
              onChange={(e) => setShowNewPassword(e.target.checked)}
              disabled={loading}
              style={{ accentColor: '#f97316', cursor: 'pointer' }}
            />
            Show passwords
          </label>

          {formError && <p role="alert" style={{ color: '#dc2626', fontSize: '13px' }}>{formError}</p>}
          {formMessage && <p role="status" style={{ color: '#16a34a', fontSize: '13px' }}>{formMessage}</p>}

          <div className="profile-form-actions">
            <button
              type="button"
              disabled={loading}
              onClick={() => setChangePasswordOpen(false)}
              className="profile-btn-cancel"
              style={{
                border: `1px solid ${theme.border}`,
                background: theme.cardBg,
                color: theme.text,
              }}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="profile-btn-submit">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function DeleteAccountModal({
  deleteOpen,
  setDeleteOpen,
  currentPassword,
  setCurrentPassword,
  showPassword,
  setShowPassword,
  confirmDelete,
  setConfirmDelete,
  handleDeleteAccount,
  error,
  loading,
  darkMode,
  theme
}) {
  if (!deleteOpen) return null;

  return (
    <div
      className="profile-modal-overlay"
      onClick={() => {
        if (!loading) setDeleteOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="profile-modal-box"
        style={{
          background: theme.cardBg,
          color: theme.text,
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="profile-modal-header" style={{ marginBottom: '12px' }}>
          <h3 style={{ margin: 0 }}>Delete Account</h3>
          <button
            type="button"
            disabled={loading}
            onClick={() => setDeleteOpen(false)}
            className="profile-modal-close-btn"
            style={{ color: theme.subText }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ color: theme.subText, fontSize: '14px', lineHeight: 1.5 }}>
          This action is permanent. Enter your current password to verify your identity.
        </p>

        <label htmlFor="delete-current-password" className="profile-form-label">
          Current Password
        </label>

        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <input
            id="delete-current-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            disabled={loading}
            className="profile-form-input"
            style={{
              paddingRight: '42px',
              border: `1px solid ${theme.border}`,
              background: darkMode ? '#0f172a' : '#ffffff',
              color: theme.text,
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'transparent',
              color: theme.subText,
              cursor: 'pointer',
            }}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', fontSize: '13px', marginBottom: '14px' }}>
          <input
            type="checkbox"
            checked={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.checked)}
            disabled={loading}
            style={{ marginTop: '3px' }}
          />
          I understand that deleting my account is permanent.
        </label>

        {error && <p role="alert" style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 12px' }}>{error}</p>}

        <div className="profile-form-actions">
          <button
            type="button"
            disabled={loading}
            onClick={() => setDeleteOpen(false)}
            className="profile-btn-cancel"
            style={{
              border: `1px solid ${theme.border}`,
              background: theme.cardBg,
              color: theme.text,
            }}
          >
            Cancel
          </button>
          <button
            disabled={loading || !currentPassword || !confirmDelete}
            onClick={handleDeleteAccount}
            className="profile-btn-delete"
          >
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </section>
    </div>
  );
}