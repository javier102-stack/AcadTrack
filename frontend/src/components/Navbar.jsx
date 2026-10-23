
import { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar as CalendarIcon,
  Timer,
  PlusCircle,
  Sun,
  Moon,
  BookOpen,
  UserRound,
  UserRoundPen,
  KeyRound,
  Trash2,
  LogOut,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

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
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const textColor = darkMode ? "#f8fafc" : "#1e293b";
  const mutedColor = darkMode ? "#94a3b8" : "#64748b";
  const panelColor = darkMode ? "#1e293b" : "#ffffff";
  const borderColor = darkMode ? "#334155" : "#e2e8f0";

  
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
  : {
      message: `The server returned HTML instead of JSON (HTTP ${response.status}). Check the API URL and backend route.`,
    };

if (!response.ok) {
  throw new Error(data.message || "Unable to update profile.");
}

if (!data.user) {
  throw new Error("The server response did not include updated user information.");
}


    setProfileForm({
      name: data.user.name,
      username: data.user.username,
      email: data.user.email,
    });

    setFormMessage("Profile updated successfully.");

    // Tell App.jsx to update the displayed user.
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
      const response = await fetch(
        `${API_URL}/api/auth/delete-account`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ currentPassword }),
        }
      );

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

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 30px",
        height: "70px",
        borderBottom: `1px solid ${borderColor}`,
        background: panelColor,
        flexShrink: 0,
        width: "100%",
        boxSizing: "border-box",
        gap: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <BookOpen color="#f97316" size={24} />
        <h2
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            margin: 0,
            color: textColor,
          }}
        >
          AcadTrack
        </h2>
      </div>

      <nav
        style={{
          display: "flex",
          gap: "20px",
          height: "100%",
          alignItems: "center",
        }}
      >
        {[
          { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
          { id: "academics", label: "Academics & Tasks", Icon: CheckSquare },
          { id: "calendar", label: "Calendar", Icon: CalendarIcon },
          { id: "study", label: "Focus Mode", Icon: Timer },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              height: "100%",
              padding: "0 4px",
              color: activeTab === id ? "#f97316" : mutedColor,
              borderBottom:
                activeTab === id
                  ? "2px solid #f97316"
                  : "2px solid transparent",
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={() => setIsAddTaskOpen(true)}
          style={{
            background: "#f97316",
            color: "#ffffff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <PlusCircle size={16} /> Add Task
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle Dark / Light Mode"
          style={{
            border: "none",
            padding: "8px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: darkMode ? "#334155" : "#f1f5f9",
          }}
        >
          {darkMode ? (
            <Sun size={18} color="#f59e0b" />
          ) : (
            <Moon size={18} color="#475569" />
          )}
        </button>

        {/* Clickable profile */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                flexShrink: 0,
                borderRadius: "50%",
                background: "#ffedd5",
                color: "#f97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "14px",
                border: "1px solid #fed7aa",
              }}
            >
              {(user?.name || "Student")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <span
                style={{
                  display: "block",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: textColor,
                }}
              >
                {user?.name || "Student"}
              </span>
              <small style={{ fontSize: "12px", color: mutedColor }}>
                {user?.username ? `@${user.username}` : "Student"}
              </small>
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
                  Account
                </strong>
                <div style={{ color: mutedColor, fontSize: "12px", marginTop: "4px" }}>
                  {user?.username ? `@${user.username}` : ""}
                </div>
              </div>

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
                <Trash2 size={16} />
                Delete Account
              </button>

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
            <UserRoundPen size={16} />
            Edit Profile
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
            <KeyRound size={16} />
            Change Password
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
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      
{/* Edit Profile Modal */}
{editProfileOpen && (
  <div
    onClick={() => {
      if (!loading) {
        setEditProfileOpen(false);
        setFormError("");
        setFormMessage("");
      }
    }}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.65)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      zIndex: 1000,
    }}
  >
    <section
      role="dialog"
      aria-modal="true"
      onClick={(event) => event.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: "430px",
        background: panelColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "16px",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <h3 style={{ margin: 0 }}>Edit Profile</h3>
        <button
          type="button"
          disabled={loading}
          onClick={() => setEditProfileOpen(false)}
          style={{
            border: "none",
            background: "transparent",
            color: mutedColor,
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>
      </div>

      <p style={{ color: mutedColor, fontSize: "14px" }}>
        Update your account information.
      </p>

      <form onSubmit={handleSaveProfile}>
        {[
          { key: "name", label: "Full Name", type: "text" },
          { key: "username", label: "Username", type: "text" },
          { key: "email", label: "Email Address", type: "email" },
        ].map(({ key, label, type }) => (
          <div key={key} style={{ marginBottom: "14px" }}>
            <label
              htmlFor={`profile-${key}`}
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              {label}
            </label>
            <input
              id={`profile-${key}`}
              type={type}
              required
              maxLength={key === "name" ? 100 : key === "username" ? 30 : undefined}
              minLength={key === "username" ? 3 : undefined}
              autoComplete={key === "email" ? "email" : "off"}
              value={profileForm[key]}
              onChange={(event) =>
                setProfileForm((prev) => ({
                  ...prev,
                  [key]: event.target.value,
                }))
              }
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                border: `1px solid ${borderColor}`,
                borderRadius: "8px",
                background: darkMode ? "#0f172a" : "#ffffff",
                color: textColor,
              }}
            />
          </div>
        ))}

        {formError && (
          <p role="alert" style={{ color: "#dc2626", fontSize: "13px" }}>
            {formError}
          </p>
        )}

        {formMessage && (
          <p role="status" style={{ color: "#16a34a", fontSize: "13px" }}>
            {formMessage}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
          <button
            type="button"
            disabled={loading}
            onClick={() => setEditProfileOpen(false)}
            style={{
              flex: 1,
              padding: "11px",
              border: `1px solid ${borderColor}`,
              borderRadius: "8px",
              background: panelColor,
              color: textColor,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "11px",
              border: "none",
              borderRadius: "8px",
              background: "#f97316",
              color: "#ffffff",
              fontWeight: "bold",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  </div>
)}


{/* Change Password Modal */}
{changePasswordOpen && (
  <div
    onClick={() => {
      if (!loading) {
        setChangePasswordOpen(false);
        setFormError("");
        setFormMessage("");
      }
    }}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(15, 23, 42, 0.65)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      zIndex: 1001,
    }}
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
      onClick={(event) => event.stopPropagation()}
      style={{
        width: "100%",
        maxWidth: "430px",
        background: panelColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: "16px",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 id="change-password-title" style={{ margin: 0 }}>
          Change Password
        </h3>

        <button
          type="button"
          disabled={loading}
          onClick={() => setChangePasswordOpen(false)}
          style={{
            border: "none",
            background: "transparent",
            color: mutedColor,
            cursor: "pointer",
          }}
        >
          <X size={20} />
        </button>
      </div>

      <p style={{ color: mutedColor, fontSize: "14px" }}>
        Enter your current password and choose a new one.
      </p>

      <form onSubmit={handleChangePassword}>
        {[
          {
            key: "currentPassword",
            label: "Current Password",
          },
          {
            key: "newPassword",
            label: "New Password",
          },
          {
            key: "confirmPassword",
            label: "Confirm New Password",
          },
        ].map(({ key, label }) => (
          <div key={key} style={{ marginBottom: "14px" }}>
            <label
              htmlFor={`password-${key}`}
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              {label}
            </label>

            <input
              id={`password-${key}`}
              type={
                key === "currentPassword"
                  ? "password"
                  : showNewPassword
                    ? "text"
                    : "password"
              }
              autoComplete={
                key === "currentPassword"
                  ? "current-password"
                  : "new-password"
              }
              required
              minLength={key === "newPassword" ? 8 : undefined}
              value={passwordForm[key]}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  [key]: event.target.value,
                }))
              }
              disabled={loading}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 12px",
                border: `1px solid ${borderColor}`,
                borderRadius: "8px",
                background: darkMode ? "#0f172a" : "#ffffff",
                color: textColor,
              }}
            />
          </div>
        ))}

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            marginBottom: "14px",
            cursor: "pointer",
            color: showNewPassword ? "#f97316" : textColor,
          }}
        >
          <input
            type="checkbox"
            checked={showNewPassword}
            onChange={(event) => setShowNewPassword(event.target.checked)}
            disabled={loading}
            style={{
              accentColor: showNewPassword ? "#f97316" : panelColor,
              cursor: "pointer",
            }}
          />
          Show passwords
        </label>

        {formError && (
          <p role="alert" style={{ color: "#dc2626", fontSize: "13px" }}>
            {formError}
          </p>
        )}

        {formMessage && (
          <p role="status" style={{ color: "#16a34a", fontSize: "13px" }}>
            {formMessage}
          </p>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
          <button
            type="button"
            disabled={loading}
            onClick={() => setChangePasswordOpen(false)}
            style={{
              flex: 1,
              padding: "11px",
              border: `1px solid ${borderColor}`,
              borderRadius: "8px",
              background: panelColor,
              color: textColor,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "11px",
              border: "none",
              borderRadius: "8px",
              background: "#f97316",
              color: "#ffffff",
              fontWeight: "bold",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  </div>
)}


      {/* Delete confirmation modal */}
      {deleteOpen && (
        <div
          onClick={() => {
            if (!loading) {
              setDeleteOpen(false);
              setError("");
              setCurrentPassword("");
              setConfirmDelete(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: panelColor,
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "16px",
              padding: "24px",
              boxSizing: "border-box",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <h3 id="delete-account-title" style={{ margin: 0 }}>
                Delete Account
              </h3>
              <button
                aria-label="Close dialog"
                disabled={loading}
                onClick={() => {
                  setDeleteOpen(false);
                  setError("");
                  setCurrentPassword("");
                  setConfirmDelete(false);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  color: mutedColor,
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ color: mutedColor, fontSize: "14px", lineHeight: 1.5 }}>
              This action is permanent. Enter your current password to verify
              your identity before deleting your account.
            </p>

            <label
              htmlFor="delete-current-password"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "8px",
              }}
            >
              Current Password
            </label>

            <div style={{ position: "relative", marginBottom: "14px" }}>
              <input
                id="delete-current-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="Enter your current password"
                disabled={loading}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "11px 42px 11px 12px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "8px",
                  background: darkMode ? "#0f172a" : "#ffffff",
                  color: textColor,
                }}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  color: mutedColor,
                  cursor: "pointer",
                }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "9px",
                fontSize: "13px",
                lineHeight: 1.5,
                marginBottom: "14px",
              }}
            >
              <input
                type="checkbox"
                checked={confirmDelete}
                onChange={(event) => setConfirmDelete(event.target.checked)}
                disabled={loading}
                style={{ marginTop: "3px" }}
              />
              I understand that deleting my account is permanent.
            </label>

            {error && (
              <p
                role="alert"
                style={{
                  color: "#dc2626",
                  fontSize: "13px",
                  margin: "0 0 12px",
                }}
              >
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                disabled={loading}
                onClick={() => {
                  setDeleteOpen(false);
                  setError("");
                  setCurrentPassword("");
                  setConfirmDelete(false);
                }}
                style={{
                  flex: 1,
                  padding: "11px",
                  border: `1px solid ${borderColor}`,
                  borderRadius: "8px",
                  background: panelColor,
                  color: textColor,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                disabled={loading || !currentPassword || !confirmDelete}
                onClick={handleDeleteAccount}
                style={{
                  flex: 1,
                  padding: "11px",
                  border: "none",
                  borderRadius: "8px",
                  background:
                    loading || !currentPassword || !confirmDelete
                      ? "#fca5a5"
                      : "#dc2626",
                  color: "#ffffff",
                  fontWeight: "bold",
                  cursor:
                    loading || !currentPassword || !confirmDelete
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </section>
        </div>
      )}
    </header>
  );
}
