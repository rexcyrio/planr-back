const formatErrorMessage = require("../helper/formatErrorMessage");
const ObjectId = require("mongodb").ObjectId;

function notesController(client) {
  async function get(req, res) {
    try {
      const userId = req.query.id;
      const mycollection = client.db("mydb").collection("mycollection");

      const userInfo = await mycollection.findOne(
        { _id: ObjectId(userId) },
        { projection: { _id: 0, password: 0, links: 0 } }
      );

      res.send({ notes: userInfo.notes });
    } catch (error) {
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  async function post(req, res) {
    try {
      const { userId, note } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updateInfo = await mycollection.updateOne(
        { _id: ObjectId(userId) },
        { $push: { notes: note } }
      );

      if (updateInfo.acknowledged) {
        res.send({});
      } else {
        throw new Error("acknowledged false");
      }
    } catch (error) {
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  async function put(req, res) {
    try {
      const { userId, notes } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updateInfo = await mycollection.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: { notes: notes },
        }
      );

      if (updateInfo.acknowledged) {
        res.send({});
      } else {
        throw new Error("acknowledged false");
      }
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
