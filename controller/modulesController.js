const controller2 = require("../helper/helperController2");

function modulesController(client) {
  return controller2(client, "modules");
}

module.exports = modulesController;
