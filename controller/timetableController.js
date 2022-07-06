const controller2 = require("../helper/helperController2");

function timetableController(client) {
  return controller2(client, "timetable");
}

module.exports = timetableController;
