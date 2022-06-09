const formatErrorMessage = require("../helper/formatErrorMessage");

function linksController(client) {
  async function get(req, res) {
    try {
      const username = req.query.username;
      const mycollection = client.db("mydb").collection("mycollection");
      const userInfo = await mycollection.findOne({ username: username });
      console.log(userInfo);
      res.send({ links: userInfo.links });
    } catch (error) {
      res.status(503).send({ error: formatErrorMessage(error) });
    }
  }

  async function post(req, res) {
    try {
      const { username, link } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updatedUserInfo = await mycollection.findOneAndUpdate(
        { username },
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
      const { username, links } = req.body;
      const mycollection = client.db("mydb").collection("mycollection");

      const updatedUserInfo = await mycollection.findOneAndUpdate(
        { username },
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
