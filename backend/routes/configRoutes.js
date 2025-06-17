const express = require("express");
const router = express.Router();
const configController = require("../controllers/configController");

// Get all configuration settings
router.get("/", configController.getAllConfigs);

// Get a specific configuration setting
router.get("/:name", configController.getConfig);

// Update a configuration setting
router.put("/:name", configController.updateConfig);

module.exports = router;
