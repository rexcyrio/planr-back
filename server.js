"use strict";

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const mongodb = require("mongodb");
const { MongoClient, ServerApiVersion } = require("mongodb");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const nodemailer = require("nodemailer");
const { convert } = require("html-to-text");
const cors = require("cors");
require("dotenv").config();
const linksController = require("./controller/linksController");
const notesController = require("./controller/notesController");
const tasksController = require("./controller/tasksController");
const modulesController = require("./controller/modulesController");

const NUSModsURLController = require("./controller/NUSModsURLController");
const themeNameController = require("./controller/themeNameController");
const mappingTagToColourNameController = require("./controller/mappingTagToColourNameController");
const userTagsController = require("./controller/userTagsController");

const formatErrorMessage = require("./helper/formatErrorMessage");
const createEmptyTimetable = require("./helper/createEmptyTimetable");

const PORT = process.env.PORT || 3001;
const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

(async function init() {
  try {
    await client.connect();
    console.log("client connected!");
  } catch (error) {
    console.error(error);
  }
})();

const app = express();
app.use(cors());
app.use(express.json()); // automatically parse request.body as JSON object
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName: "mydb",
    }),
  })
);

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const mycollection = client.db("mydb").collection("mycollection");
      const userInfo = await mycollection.findOne({ username: username });

      // check if user exists
      if (!userInfo) {
        return done(null, false);
      }

      // check for correct password
      if (await bcrypt.compare(password, userInfo.password)) {
        return done(null, userInfo);
      } else {
        return done(null, false);
      }
    } catch (error) {
      return done(error, false);
    }
  })
);

// user ==> id
passport.serializeUser((user, done) => {
  return done(null, user._id);
});

// id ==> user
passport.deserializeUser(async (_id, done) => {
  try {
    const mycollection = client.db("mydb").collection("mycollection");
    const userInfo = await mycollection.findOne({
      _id: mongodb.ObjectId(_id),
    });

    if (userInfo) {
      return done(null, userInfo);
    } else {
      return done(`User with _id="${_id}" does not exist`, false);
    }
  } catch (error) {
    return done(error, false);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// reusable SMTP transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "SendinBlue", // no need to set host or port etc.
  auth: {
    user: process.env.SENDINBLUE_EMAIL,
    pass: process.env.SENDINBLUE_SMTP_KEY,
  },
});

// ============================================================================
// routing start
// ============================================================================

app.get("/", (req, res) => {
  res.send("Express server is online");
});

app.post("/api/login", passport.authenticate("local"), async (req, res) => {
  try {
    const username = req.user.username;
    const mycollection = client.db("mydb").collection("mycollection");
    const userInfo = await mycollection.findOne({ username: username });
    res.send({
      login_success: true,
      loggedInUsername: username,
      userId: userInfo._id,
    });
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: formatErrorMessage(error) });
  }
});

app.post("/api/is-authenticated", async (req, res) => {
  const t = req?.user?.username;

  if (t === undefined) {
    res.send({
      isAuthenticated: false,
      loggedInUsername: null,
      userId: null,
    });
    return;
  }

  try {
    const loggedInUsername = t;
    const mycollection = client.db("mydb").collection("mycollection");
    const userInfo = await mycollection.findOne({ username: loggedInUsername });

    res.send({
      isAuthenticated: true,
      loggedInUsername: loggedInUsername,
      userId: userInfo._id,
    });
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: formatErrorMessage(error) });
  }
});

app.post("/api/is-username-available", async (req, res) => {
  try {
    const { username } = req.body;
    const mycollection = client.db("mydb").collection("mycollection");
    const userInfo = await mycollection.findOne({ username: username });
    res.send({ isAvailable: userInfo === null });
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: formatErrorMessage(error) });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const mycollection = client.db("mydb").collection("mycollection");

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserInfo = {
      username: username,
      password: hashedPassword,
      links: [],
      notes: [],
      tasks: [],
      timetable: createEmptyTimetable(),
      modules: [],

      NUSModsURL: "",
      themeName: "Eighties",
      mappingTagToColourName: {
        Others: "lightPink",
      },
      userTags: ["Others"],
    };

    const updateInfo = await mycollection.insertOne(newUserInfo);

    if (updateInfo.acknowledged) {
      res.send({});
    } else {
      throw new Error("Database failed to acknowledge request");
    }
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: formatErrorMessage(error) });
  }
});

app.delete("/api/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error(error);
      res.send({ error: formatErrorMessage(error) });
    } else {
      res.clearCookie("connect.sid");
      res.send({});
    }
  });
});

app.get("/api/private/links", linksController(client).get);
app.post("/api/private/links", linksController(client).post);
app.put("/api/private/links", linksController(client).put);

app.get("/api/private/notes", notesController(client).get);
app.post("/api/private/notes", notesController(client).post);
app.put("/api/private/notes", notesController(client).put);

app.get("/api/private/tasks", tasksController(client).get);
app.post("/api/private/tasks", tasksController(client).post);
app.put("/api/private/tasks", tasksController(client).put);

app.get("/api/private/modules", modulesController(client).get);
app.put("/api/private/modules", modulesController(client).put);

app.get("/api/private/NUSModsURL", NUSModsURLController(client).get);
app.put("/api/private/NUSModsURL", NUSModsURLController(client).put);

app.get("/api/private/themeName", themeNameController(client).get);
app.put("/api/private/themeName", themeNameController(client).put);

app.get(
  "/api/private/mappingTagToColourName",
  mappingTagToColourNameController(client).get
);
app.put(
  "/api/private/mappingTagToColourName",
  mappingTagToColourNameController(client).put
);

app.get("/api/private/userTags", userTagsController(client).get);
app.post("/api/private/userTags", userTagsController(client).post);
app.put("/api/private/userTags", userTagsController(client).put);

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});

// ===========================================================================

app.post("/api/request-password-reset", async (req, res) => {
  try {
    const { email } = req.body;
    const mycollection = client.db("mydb").collection("mycollection");

    const token = await bcrypt.hash(email, 10);
    const tokenExpireAt = Date.now() + 3600000; // 1 hour

    const updatedUserInfo = mycollection.findOneAndUpdate(
      { email: email },
      {
        $set: { token: token, tokenExpireAt: tokenExpireAt },
      },
      { returnNewDocument: true }
    );

    // send email
    const _id = updatedUserInfo._id;
    const resetPasswordLink = `${process.env.MAIN_URL}/reset-password/${_id}/${token}`;
    await sendEmail(email, resetPasswordLink);
    res.send({});
  } catch (error) {
    console.error(error);
    res.send({ error: formatErrorMessage(error) });
  }
});

async function sendEmail(toEmailAddress, resetPasswordLink) {
  const htmlBody = `
    <body style="font-family: sans-serif">
        <p>
            We have received a request to reset the password for your PlanR account.
        </p>
        <p>To reset your password, please click here:</p>
        <div
            style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 9em;
                padding: 0.5em;
                border: grey 1px solid;
                border-radius: 0.25em;
                background-color: lightblue;
            "
        >
            <a
                href="${resetPasswordLink}"
                target="_blank"
                rel="noopener noreferrer"
                style="text-decoration: none; color: black"
                >Reset password</a
            >
        </div>
        <p>Or copy and paste the following URL into your browser</p>
        <p>
            <a href="${resetPasswordLink}" target="_blank" rel="noopener noreferrer"
                >${resetPasswordLink}</a
            >
        </p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <br />
        <p>-- PlanR Team</p>
    </body>
    `;

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: "<no-reply@orbital-planr.com>", // sender address
    to: toEmailAddress, // list of receivers
    subject: "Password reset for PlanR account", // Subject line
    text: convert(htmlBody), // plain text body
    html: htmlBody, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}

app.post("/api/verify-password-reset-credentials", async (req, res) => {
  try {
    const { _id, token } = req.body;
    const mycollection = client.db("mydb").collection("mycollection");

    const userInfo = await mycollection.findOne({
      _id: mongodb.ObjectId(_id),
    });

    if (!userInfo) {
      res.send({ error: `User with _id="${_id}" does not exist` });
      return;
    }

    if (!userInfo.token) {
      res.send({
        error: `User with _id="${_id}" did not request a password reset`,
      });
      return;
    }

    const isTokenMatched = await bcrypt.compare(token, userInfo.token);
    if (!isTokenMatched) {
      res.send({ error: "Token mismatch" });
      return;
    }

    const isExpired = userInfo.tokenExpireAt < Date.now();
    if (isExpired) {
      res.send({ error: "Token expired" });
      return;
    }

    res.send({});
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: formatErrorMessage(error) });
  }
});

app.put("/api/reset-password", async (req, res) => {
  try {
    const { _id, newPassword } = req.body;
    const mycollection = client.db("mydb").collection("mycollection");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await mycollection.updateOne(
      { _id: mongodb.ObjectId(_id) },
      {
        $set: { password: hashedPassword },
        $unset: { token: "", tokenExpireAt: "" },
      }
    );
    res.send({});
  } catch (error) {
    console.error(error);
    res.send({ error: formatErrorMessage(error) });
  }
});
