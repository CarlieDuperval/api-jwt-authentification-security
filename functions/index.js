import functions from "firebase-functions";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mySecretKey from "./secret.js";

const users = [
  // fake database
  { id: 1, email: "todd@bocacode.com", password: "abc123" },
  { id: 1, email: "damien@bocacode.com", password: "def456" },
  { id: 1, email: "vitoriad@bocacode.com", password: "ghi123" },
];

const app = express();
app.use(cors());
app.use(express.json());

// get from the body email and password
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  // Check if that email and password exist in our data base
  // I they do , create and send back a token
  // i they dont, send back an error massage

  let user = users.find(
    (user) => user.email === email && user.password === password
  );
  if (!user) {
    res.status(401).send("Invalid Request");
    return;
  }
  user.password = undefined; // remove password from the user object
  // now we want to sing and create a token...(create a json web token)
  const token = jwt.sign(user, mySecretKey, { expiresIn: "1d" });
  res.send(token);
});

// any one can access this
app.get("/public", (req, res) => {
  res.send("Welcome");
});

app.get("/private", (req, res) => {
  // let require a valid token to see this
  const token = req.headers.authorization || "";
  if (!token) {
    res.status(401).send("You must be log in to see this");
    return;
  }
  jwt.verify(token, mySecretKey, (err, decoded) => {
    if (err) {
      res.status(401).send("You must be log in to see this");
      return;
    }
    // here we know that the token is valid
    res.send(`Welcome ${decoded.email}!`); // put info that we want to allow user to do
  });
});

export const api = functions.https.onRequest(app);
