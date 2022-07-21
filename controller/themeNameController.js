const controller2 = require("../helper/helperController2");

function themeNameController(client) {
  return controller2(client, "themeName");
}

module.exports = themeNameController;
