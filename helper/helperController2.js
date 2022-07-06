const formatErrorMessage = require("./formatErrorMessage");
const ObjectId = require("mongodb").ObjectId;

function controller2(client, type) {
  async function get(req, res) {
    try {
      const userId = req.query.id;
      const mycollection = client.db("mydb").collection("mycollection");

      const userInfo = await mycollection.findOne(
        { _id: ObjectId(userId) },
        {
          projection: { [type]: 1 },
        }
      );

      res.send({ [type]: userInfo[type] });
    } catch (error) {
      console.error(error);
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  async function put(req, res) {
    try {
      const { userId, [type]: item } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updateInfo = await mycollection.updateOne(
        { _id: ObjectId(userId) },
        {
          $set: { [type]: item },
        }
      );

      if (updateInfo.acknowledged) {
        res.send({});
      } else {
        throw new Error("Database failed to acknowledge request");
      }
    } catch (error) {
      console.error(error);
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  return {
    get: get,
    put: put,
  };
}

module.exports = controller2;
