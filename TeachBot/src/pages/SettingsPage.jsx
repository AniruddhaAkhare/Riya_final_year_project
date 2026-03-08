import React, { useState, useEffect } from "react";

// ----------------------------- SETTINGS PAGE -----------------------------
const SettingsPage = () => {
  // ================= USER PROFILE STATE =================
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profilePic: null,
    password: "",
  });

  // ================= NOTIFICATIONS STATE =================
  const [notifications, setNotifications] = useState({
    quizReminders: true,
    classAlerts: true,
    assignmentReminders: false,
  });

  // ================= THEME & APPEARANCE STATE =================
  const [theme, setTheme] = useState({
    mode: "light", // light or dark
    fontSize: "medium", // small, medium, large
  });

  // ================= APPLY THEME & FONT SIZE =================
  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme.mode);

    document.documentElement.style.fontSize =
      theme.fontSize === "small"
        ? "14px"
        : theme.fontSize === "medium"
        ? "16px"
        : "18px";

    // Optional: save to localStorage to persist settings
    localStorage.setItem("themeMode", theme.mode);
    localStorage.setItem("fontSize", theme.fontSize);
  }, [theme]);

  // ================= HANDLE PROFILE CHANGE =================
  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setProfile({ ...profile, [name]: files[0] });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  // ================= HANDLE NOTIFICATIONS =================
  const toggleNotification = (field) => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
  };

  // ================= HANDLE THEME CHANGE =================
  const toggleTheme = () => {
    setTheme({ ...theme, mode: theme.mode === "light" ? "dark" : "light" });
  };

  const changeFontSize = (size) => {
    setTheme({ ...theme, fontSize: size });
  };

  // ================= PROFILE ACTIONS =================
  const saveProfile = () => {
    console.log("Profile saved:", profile);
    alert("Profile saved successfully!");
    // integrate backend API call here if available
  };

  const deleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      console.log("Account deleted!");
      alert("Your account has been deleted.");
      // integrate backend API call here if available
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        Settings
      </h1>

      {/* ================= PROFILE SECTION ================= */}
      <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Profile & Account
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              className="w-full border px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              className="w-full border px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
              Profile Picture
            </label>
            <input
              type="file"
              name="profilePic"
              accept="image/*"
              onChange={handleProfileChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">
              Change Password
            </label>
            <input
              type="password"
              name="password"
              value={profile.password}
              onChange={handleProfileChange}
              className="w-full border px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-4">
          <button
            onClick={saveProfile}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-600 transition"
          >
            Save Profile
          </button>
          <button
            onClick={deleteAccount}
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Delete Account
          </button>
        </div>
      </section>

      {/* ================= NOTIFICATIONS SECTION ================= */}
      <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Notifications
        </h2>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={notifications.quizReminders}
              onChange={() => toggleNotification("quizReminders")}
              className="cursor-pointer"
            />
            Quiz Reminders
          </label>
          <label className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={notifications.classAlerts}
              onChange={() => toggleNotification("classAlerts")}
              className="cursor-pointer"
            />
            Class Schedule Alerts
          </label>
          <label className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={notifications.assignmentReminders}
              onChange={() => toggleNotification("assignmentReminders")}
              className="cursor-pointer"
            />
            Assignment Reminders
          </label>
        </div>
      </section>

      {/* ================= THEME & APPEARANCE ================= */}
      <section className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Theme & Appearance
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              Dark / Light Mode
            </span>
            <button
              onClick={toggleTheme}
              className="bg-gray-300 dark:bg-gray-700 px-4 py-2 rounded-lg font-semibold"
            >
              {theme.mode === "light" ? "Switch to Dark" : "Switch to Light"}
            </button>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-200 font-medium">
              Font Size
            </label>
            <select
              value={theme.fontSize}
              onChange={(e) => changeFontSize(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full bg-gray-50 dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
