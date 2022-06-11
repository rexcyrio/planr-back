const formatErrorMessage = require("../helper/formatErrorMessage");
const ObjectId = require("mongodb").ObjectId;

function linksController(client) {
  async function get(req, res) {
    try {
      const userId = req.query.id;
      console.log(userId);
      const mycollection = client.db("mydb").collection("mycollection");

      const userInfo = await mycollection.findOne(
        { _id: ObjectId(userId) },
        { projection: { _id: 0, password: 0, notes: 0 } }
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

      const updatedUserInfo = await mycollection.findOneAndUpdate(
        { _id: ObjectId(userId) },
        { $push: { links: link } },
        { returnDocument: "after" }
      );

      res.send({ links: updatedUserInfo.value.links });
    } catch (error) {
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  async function put(req, res) {
    try {
      const { userId, links } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updatedUserInfo = await mycollection.findOneAndUpdate(
        { _id: ObjectId(userId) },
        {
          $set: { links: links },
        },
        { returnDocument: "after" }
      );

      res.send({ links: updatedUserInfo.value.links });
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
