const controller = require("../helper/helperController");

function tasksController(client) {
  return controller(client, "task");
}

module.exports = tasksController;
