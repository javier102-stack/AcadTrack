import { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, CheckSquare, Calendar as CalendarIcon, 
  PlusCircle, Sun, Moon, BookOpen, Bell, AlertCircle, Clock, 
  CheckCircle2, UserRoundPen, KeyRound, Trash2, LogOut, Menu, X, PencilIcon
} from 'lucide-react';
import { EditProfileModal, ChangePasswordModal, DeleteAccountModal } from './ProfileModals';
import './Navbar.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Navbar({
  activeTab,
  setActiveTab,
  setIsAddTaskOpen,
  darkMode,
  setDarkMode,
  user,
  onLogout,
  onAccountDeleted,
  onProfileUpdated,
  tasks = [],
  theme
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dropdownRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notifications = tasks.filter(task => {
    if (task.completed || !task.dueDate) return false;
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSaveProfile(event) {
    event.preventDefault();
    setLoading(true);
    setFormError("");
    setFormMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { message: `The server returned HTML instead of JSON (HTTP ${response.status}).` };

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile.");
      }

      setProfileForm({
        name: data.user.name,
        username: data.user.username,
        email: data.user.email,
      });

      setFormMessage("Profile updated successfully.");

      if (onProfileUpdated) {
        onProfileUpdated(data.user);
      }
    } catch (err) {
      setFormError(err.message || "Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword(event) {
    event.preventDefault();
    setFormError("");
    setFormMessage("");

    if (passwordForm.newPassword.length < 8) {
      setFormError("Your new password must contain at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormError("The new passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to change password.");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setFormMessage(data.message || "Password changed successfully.");
    } catch (err) {
      setFormError(err.message || "Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!confirmDelete) {
      setError("Please confirm that you want to permanently delete your account.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete your account.");
      }

      setDeleteOpen(false);
      setProfileOpen(false);
      setCurrentPassword("");
      setConfirmDelete(false);

      if (onAccountDeleted) {
        onAccountDeleted();
      } else if (onLogout) {
        onLogout();
      }
    } catch (err) {
      setError(err.message || "Cannot connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'academics', label: 'To-dos', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'notes', label: 'Study Notes', icon: PencilIcon }
  ];

  const modeClass = darkMode ? 'dark' : 'light';
  const textColor = darkMode ? "#f8fafc" : "#1e293b";
  const mutedColor = darkMode ? "#94a3b8" : "#64748b";
  const panelColor = darkMode ? "#1e293b" : "#ffffff";
  const borderColor = darkMode ? "#334155" : "#e2e8f0";

  return (
    <>
      <header className={`navbar-header ${modeClass}`}>
        {/* Clickable AcadTrack Logo */}
        <div onClick={() => setActiveTab('dashboard')} className="navbar-logo-container">
          <div className="navbar-logo-icon">
            <BookOpen color="#ffffff" size={20} />
          </div>
          <h2 className={`navbar-title ${modeClass}`}>AcadTrack</h2>
        </div>
        
        {/* Desktop Navigation Tabs */}
        <nav className={`navbar-nav-container ${modeClass}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)} 
                className={`navbar-nav-btn ${isActive ? 'active' : `inactive ${modeClass}`}`}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls Area */}
        <div className="navbar-actions-area">
          
          {/* Add Task Button */}
          <button onClick={() => setIsAddTaskOpen(true)} className="navbar-add-task-btn">
            <PlusCircle size={16} /> <span>Add Task</span>
          </button>

          {/* NOTIFICATION BELL ICON */}
          <div className="navbar-notification-wrapper" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className={`navbar-icon-btn ${modeClass}`}
              title="Notifications"
            >
              <Bell size={18} color="#4B7B9D" />
              {notifications.length > 0 && (
                <span className={`navbar-badge ${modeClass}`}>
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className={`navbar-dropdown ${modeClass}`}>
                <div className={`navbar-dropdown-header ${modeClass}`}>
                  <span>Notifications</span>
                  <span className={`notification-badge-status ${notifications.length > 0 ? 'urgent' : 'caught-up'}`}>
                    {notifications.length > 0 ? `${notifications.length} Urgent` : 'All caught up'}
                  </span>
                </div>
                <div className="navbar-dropdown-list">
                  {notifications.length === 0 ? (
                    <div className="navbar-dropdown-empty">
                      <CheckCircle2 size={24} color="#047857" className="navbar-dropdown-empty-icon" />
                      <span className={`navbar-dropdown-empty-text ${modeClass}`}>
                        No urgent requirements due today.
                      </span>
                    </div>
                  ) : (
                    notifications.map(task => (
                      <div key={task._id} className={`navbar-dropdown-item ${modeClass}`}>
                        <AlertCircle size={18} color="#DC2626" className="navbar-item-icon" />
                        <div className="navbar-item-content">
                          <div className={`navbar-item-title ${modeClass}`}>{task.title}</div>
                          <div className="navbar-item-due">
                            <Clock size={11} /> Due: {task.dueDate ? task.dueDate.split('T')[0] : 'No date'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className={`navbar-icon-btn ${modeClass}`}
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? <Sun size={18} color="#FFE08A" /> : <Moon size={18} color="#4B7B9D" />}
          </button>

          {/* Profile Dropdown Trigger */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div className="navbar-avatar">
                {(user?.name || "Student")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </button>

            {profileOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "52px",
                  right: 0,
                  width: "210px",
                  background: panelColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "10px",
                  padding: "8px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    padding: "10px",
                    borderBottom: `1px solid ${borderColor}`,
                    marginBottom: "6px",
                  }}
                >
                  <strong style={{ color: textColor, fontSize: "13px" }}>
                    {user?.name || "Student"}
                  </strong>
                  <div style={{ color: mutedColor, fontSize: "12px", marginTop: "2px" }}>
                    {user?.username ? `@${user.username}` : ""}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileForm({
                      name: user?.name || "",
                      username: user?.username || "",
                      email: user?.email || "",
                    });
                    setFormError("");
                    setFormMessage("");
                    setProfileOpen(false);
                    setEditProfileOpen(true);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    border: "none",
                    borderRadius: "6px",
                    background: "transparent",
                    color: textColor,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <UserRoundPen size={16} /> Edit Profile
                </button>

                <button
                  onClick={() => {
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setFormError("");
                    setFormMessage("");
                    setProfileOpen(false);
                    setChangePasswordOpen(true);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    border: "none",
                    borderRadius: "6px",
                    background: "transparent",
                    color: textColor,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <KeyRound size={16} /> Change Password
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    setDeleteOpen(true);
                    setError("");
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    border: "none",
                    borderRadius: "6px",
                    background: "transparent",
                    color: "#dc2626",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <Trash2 size={16} /> Delete Account
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    border: "none",
                    borderRadius: "6px",
                    background: "transparent",
                    color: textColor,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>

          {/* Hamburger Menu Toggle (Mobile) */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="navbar-hamburger-btn"
            title="Open Navigation Menu"
          >
            <Menu size={22} color={darkMode ? '#f8fafc' : '#1e293b'} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-overlay" onClick={() => setMobileMenuOpen(false)} style={{ display: 'block' }} />
      )}
      <aside className={`navbar-mobile-drawer ${modeClass} ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="navbar-mobile-header">
          <h3 className={`navbar-title ${modeClass}`}>Navigation</h3>
          <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color={darkMode ? '#f8fafc' : '#1e293b'} />
          </button>
        </div>

        <nav className="navbar-mobile-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }} 
                className={`navbar-mobile-nav-btn ${isActive ? 'active' : `inactive ${modeClass}`}`}
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Profile Modals */}
      <EditProfileModal
        editProfileOpen={editProfileOpen}
        setEditProfileOpen={setEditProfileOpen}
        profileForm={profileForm}
        setProfileForm={setProfileForm}
        handleSaveProfile={handleSaveProfile}
        formError={formError}
        formMessage={formMessage}
        loading={loading}
        darkMode={darkMode}
        theme={theme}
      />

      <ChangePasswordModal
        changePasswordOpen={changePasswordOpen}
        setChangePasswordOpen={setChangePasswordOpen}
        passwordForm={passwordForm}
        setPasswordForm={setPasswordForm}
        handleChangePassword={handleChangePassword}
        showNewPassword={showNewPassword}
        setShowNewPassword={setShowNewPassword}
        formError={formError}
        formMessage={formMessage}
        loading={loading}
        darkMode={darkMode}
        theme={theme}
      />

      <DeleteAccountModal
        deleteOpen={deleteOpen}
        setDeleteOpen={setDeleteOpen}
        currentPassword={currentPassword}
        setCurrentPassword={setCurrentPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
        handleDeleteAccount={handleDeleteAccount}
        error={error}
        loading={loading}
        darkMode={darkMode}
        theme={theme}
      />
    </>
  );
}