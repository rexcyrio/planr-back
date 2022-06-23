const controller = require("../helper/helperController");

function linksController(client) {
  return controller(client, "link");
}

module.exports = linksController;
