const controller = require("../helper/helperController");

function notesController(client) {
  return controller(client, "note");
}

module.exports = notesController;
