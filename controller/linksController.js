const formatErrorMessage = require("../helper/formatErrorMessage");
const ObjectId = require("mongodb").ObjectId;

function linksController(client) {
  async function get(req, res) {
    try {
      const userId = req.query.id;
      const mycollection = client.db("mydb").collection("mycollection");

      const userInfo = await mycollection.findOne(
        { _id: ObjectId(userId) },
        { projection: { links: 1 } }
      );

      res.send({ links: userInfo.links });
    } catch (error) {
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  async function post(req, res) {
    try {
      const { userId, link } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updateInfo = await mycollection.updateOne(
        { _id: ObjectId(userId) },
        { $push: { links: link } }
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
      const { userId, links } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updateInfo = await mycollection.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: { links: links },
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

module.exports = linksController;
