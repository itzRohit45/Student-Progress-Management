import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaSave } from "react-icons/fa";
import { getAllConfigs, updateConfig } from "../services/configService";
import { cronToHuman } from "../utils/formatters";
import "./Settings.css";

const Settings = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncSchedule, setSyncSchedule] = useState("0 2 * * *");
  const [inactivityThreshold, setInactivityThreshold] = useState(7);
  const [maxReminders, setMaxReminders] = useState(3);
  const [saving, setSaving] = useState(false);

  // Fetch configurations on component mount
  useEffect(() => {
    fetchConfigs();
  }, []);

  // Fetch all configurations from API
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const data = await getAllConfigs();
      setConfigs(data);

      // Set initial values from fetched configs
      const syncConfig = data.find(
        (c) => c.name === "CODEFORCES_SYNC_SCHEDULE"
      );
      if (syncConfig) setSyncSchedule(syncConfig.value);

      const inactivityConfig = data.find(
        (c) => c.name === "INACTIVITY_DAYS_THRESHOLD"
      );
      if (inactivityConfig) setInactivityThreshold(inactivityConfig.value);

      const maxRemindersConfig = data.find(
        (c) => c.name === "MAX_REMINDERS_PER_STUDENT"
      );
      if (maxRemindersConfig) setMaxReminders(maxRemindersConfig.value);
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // Handle saving sync schedule
  const handleSaveSyncSchedule = async () => {
    try {
      setSaving(true);
      await updateConfig("CODEFORCES_SYNC_SCHEDULE", syncSchedule);
      toast.success("Sync schedule updated successfully");
    } catch (error) {
      toast.error("Failed to update sync schedule");
    } finally {
      setSaving(false);
    }
  };

  // Handle saving inactivity threshold
  const handleSaveInactivityThreshold = async () => {
    try {
      setSaving(true);
      await updateConfig(
        "INACTIVITY_DAYS_THRESHOLD",
        parseInt(inactivityThreshold)
      );
      toast.success("Inactivity threshold updated successfully");
    } catch (error) {
      toast.error("Failed to update inactivity threshold");
    } finally {
      setSaving(false);
    }
  };

  // Handle saving max reminders
  const handleSaveMaxReminders = async () => {
    try {
      setSaving(true);
      await updateConfig("MAX_REMINDERS_PER_STUDENT", parseInt(maxReminders));
      toast.success("Maximum reminders updated successfully");
    } catch (error) {
      toast.error("Failed to update maximum reminders");
    } finally {
      setSaving(false);
    }
  };

  // Preset cron schedules
  const presetSchedules = [
    { label: "Daily at 2 AM", value: "0 2 * * *" },
    { label: "Daily at 4 AM", value: "0 4 * * *" },
    { label: "Every 12 hours", value: "0 */12 * * *" },
    { label: "Every Sunday at 12 AM", value: "0 0 * * 0" },
  ];

  // Render content based on loading state
  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading settings...</div>;
    }

    return (
      <>
        <section className="settings-section">
          <h2>Codeforces Data Sync</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Sync Schedule</h3>
              <p className="setting-description">
                Configure when the system should automatically fetch updated
                Codeforces data for all students.
              </p>
              <p className="cron-human">
                Current schedule: <strong>{cronToHuman(syncSchedule)}</strong>
              </p>
            </div>

            <div className="setting-control">
              <label>Select a preset schedule:</label>
              <select
                value={syncSchedule}
                onChange={(e) => setSyncSchedule(e.target.value)}
                className="setting-select"
              >
                {presetSchedules.map((schedule, index) => (
                  <option key={index} value={schedule.value}>
                    {schedule.label}
                  </option>
                ))}
              </select>

              <div className="mt-10">
                <label>Or enter custom cron expression:</label>
                <input
                  type="text"
                  value={syncSchedule}
                  onChange={(e) => setSyncSchedule(e.target.value)}
                  className="setting-input"
                  placeholder="Cron expression (e.g., 0 2 * * *)"
                />
                <p className="setting-hint">
                  Format: minute hour day-of-month month day-of-week
                </p>
              </div>

              <button
                className="button button-primary mt-10"
                onClick={handleSaveSyncSchedule}
                disabled={saving}
              >
                <FaSave /> Save Schedule
              </button>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Inactivity Reminders</h2>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Inactivity Threshold</h3>
              <p className="setting-description">
                Number of days of inactivity before sending a reminder email to
                a student.
              </p>
            </div>

            <div className="setting-control">
              <input
                type="number"
                value={inactivityThreshold}
                onChange={(e) => setInactivityThreshold(e.target.value)}
                className="setting-input"
                min="1"
                max="90"
              />
              <p className="setting-hint">Range: 1 to 90 days</p>

              <button
                className="button button-primary"
                onClick={handleSaveInactivityThreshold}
                disabled={saving}
              >
                <FaSave /> Save Threshold
              </button>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3>Maximum Reminders</h3>
              <p className="setting-description">
                Maximum number of inactivity reminder emails to send to a
                student.
              </p>
            </div>

            <div className="setting-control">
              <input
                type="number"
                value={maxReminders}
                onChange={(e) => setMaxReminders(e.target.value)}
                className="setting-input"
                min="1"
                max="10"
              />
              <p className="setting-hint">Range: 1 to 10 reminders</p>

              <button
                className="button button-primary"
                onClick={handleSaveMaxReminders}
                disabled={saving}
              >
                <FaSave /> Save Maximum
              </button>
            </div>
          </div>
        </section>
      </>
    );
  };

  return (
    <div className="settings-container">
      <h1>System Settings</h1>
      {renderContent()}
    </div>
  );
};

export default Settings;
