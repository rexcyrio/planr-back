const formatErrorMessage = require("./formatErrorMessage");
const ObjectId = require("mongodb").ObjectId;

function controller(client, type) {
  const pluralType = type + "s";
  async function get(req, res) {
    try {
      const userId = req.query.id;
      const mycollection = client.db("mydb").collection("mycollection");

      const userInfo = await mycollection.findOne(
        { _id: ObjectId(userId) },
        { projection: { [pluralType]: 1 } }
      );

      res.send({ [pluralType]: userInfo[pluralType] });
    } catch (error) {
      console.error(error);
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  async function post(req, res) {
    try {
      const { userId, [type]: item } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updateInfo = await mycollection.updateOne(
        { _id: ObjectId(userId) },
        { $push: { [pluralType]: item } }
      );

      if (updateInfo.acknowledged) {
        res.send({});
      } else {
        throw new Error("acknowledged false");
      }
    } catch (error) {
      console.error(error);
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  async function put(req, res) {
    try {
      const { userId, [pluralType]: items } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updateInfo = await mycollection.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: { [pluralType]: items },
        }
      );

      if (updateInfo.acknowledged) {
        res.send({});
      } else {
        throw new Error("acknowledged false");
      }
    } catch (error) {
      console.error(error);
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  return {
    get: get,
    post: post,
    put: put,
  };
}

module.exports = controller;
