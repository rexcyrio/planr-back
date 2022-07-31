const controller = require("../helper/helperController");

function userTagsController(client) {
  return controller(client, "userTag");
}

module.exports = userTagsController;
