const controller2 = require("../helper/helperController2");

function mappingTagToColourNameController(client) {
  return controller2(client, "mappingTagToColourName");
}

module.exports = mappingTagToColourNameController;
