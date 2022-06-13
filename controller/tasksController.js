const formatErrorMessage = require("../helper/formatErrorMessage");
const ObjectId = require("mongodb").ObjectId;

function tasksController(client) {
  async function get(req, res) {
    try {
      const userId = req.query.id;
      const mycollection = client.db("mydb").collection("mycollection");

      const userInfo = await mycollection.findOne(
        { _id: ObjectId(userId) },
        { projection: { _id: 0, password: 0, links: 0, notes: 0 } }
      );

      res.send({ tasks: userInfo.tasks });
    } catch (error) {
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  async function post(req, res) {
    try {
      const { userId, task } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updateInfo = await mycollection.updateOne(
        { _id: ObjectId(userId) },
        { $push: { tasks: task } }
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
      const { userId, tasks } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updateInfo = await mycollection.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: { tasks: tasks },
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

module.exports = tasksController;
