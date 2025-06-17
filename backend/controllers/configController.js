const Config = require("../models/Config");
const cronService = require("../services/cronService");

// Get all configuration settings
exports.getAllConfigs = async (req, res) => {
  try {
    const configs = await Config.find();
    res.status(200).json(configs);
  } catch (error) {
    console.error("Error fetching configs:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch configs", error: error.message });
  }
};

// Get a specific config
exports.getConfig = async (req, res) => {
  try {
    const { name } = req.params;
    const config = await Config.findOne({ name });

    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    res.status(200).json(config);
  } catch (error) {
    console.error("Error fetching config:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch config", error: error.message });
  }
};

// Update a configuration setting
exports.updateConfig = async (req, res) => {
  try {
    const { name } = req.params;
    const { value, description } = req.body;

    if (value === undefined) {
      return res.status(400).json({ message: "Value is required" });
    }

    let config = await Config.findOne({ name });

    if (!config) {
      // Create if doesn't exist
      config = new Config({
        name,
        value,
        description,
        lastUpdated: new Date(),
      });
    } else {
      // Update existing config
      config.value = value;
      if (description) config.description = description;
      config.lastUpdated = new Date();
    }

    await config.save();

    // If we're updating the cron schedule, update the actual cron job
    if (name === "CODEFORCES_SYNC_SCHEDULE") {
      cronService.updateCronSchedule(value);
    }

    res.status(200).json(config);
  } catch (error) {
    console.error("Error updating config:", error);
    res
      .status(500)
      .json({ message: "Failed to update config", error: error.message });
  }
};

// Initialize default configurations
exports.initializeDefaultConfigs = async () => {
  try {
    const defaults = [
      {
        name: "CODEFORCES_SYNC_SCHEDULE",
        value: process.env.CODEFORCES_SYNC_SCHEDULE || "0 2 * * *", // 2 AM daily
        description: "Cron schedule for Codeforces data synchronization",
      },
      {
        name: "INACTIVITY_DAYS_THRESHOLD",
        value: 7,
        description: "Days of inactivity before sending a reminder",
      },
      {
        name: "MAX_REMINDERS_PER_STUDENT",
        value: 3,
        description:
          "Maximum number of inactivity reminders to send to a student",
      },
    ];

    for (const config of defaults) {
      const existing = await Config.findOne({ name: config.name });
      if (!existing) {
        await Config.create({
          ...config,
          lastUpdated: new Date(),
        });
      }
    }

    console.log("Default configurations initialized");
  } catch (error) {
    console.error("Error initializing default configs:", error);
  }
};
