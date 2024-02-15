const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDb = require("./connect");
dotenv.config();
const url = require("./models/schema");
const cors = require("cors");
const userRouter = require("./routes/users");

connectDb();
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: false }));
//app.use(express.json());
app.use(express.json());
app.get("/", async (req, res) => {
  const shortUrls = await url.find();
  res.send({ short: shortUrls });
});

app.get("/:shortUrl", async (req, res) => {
  const shortUrl = await url.findOne({ short: req.params.shortUrl });
  if (shortUrl == null) return res.sendStatus(404);

  shortUrl.clicks++;

  shortUrl.save();
  //problem here cannot send header something
  res.redirect("/");
});

app.post("/shorturl", async (req, res) => {
  await url.create({ full: req.body.full });
  res.redirect("/");
});
app.use("/api/user", userRouter);

app.listen(process.env.PORT, async (req, res) => {
  console.log("connected to backend");
});
