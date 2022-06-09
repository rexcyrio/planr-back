const formatErrorMessage = require("../helper/formatErrorMessage");

function notesController(client) {
  async function get(req, res) {
    try {
      const username = req.query.username;
      const mycollection = client.db("mydb").collection("mycollection");

      const userInfo = await mycollection.findOne(
        { username },
        { projection: { _id: 0, password: 0 } }
      );

      res.send({ notes: userInfo.notes });
    } catch (error) {
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  async function post(req, res) {
    try {
      const { username, note } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updatedUserInfo = await mycollection.findOneAndUpdate(
        { username },
        { $push: { notes: note } },
        { returnDocument: "after" }
      );

      res.send({ notes: updatedUserInfo.value.notes });
    } catch (error) {
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  async function put(req, res) {
    try {
      const { username, notes } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updatedUserInfo = await mycollection.findOneAndUpdate(
        { username },
        {
          $set: { notes: notes },
        },
        { returnDocument: "after" }
      );

      res.send({ notes: updatedUserInfo.value.notes });
    } catch (error) {
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  return {
    get: get,
    post: post,
    put: put,
  };
}

module.exports = notesController;
