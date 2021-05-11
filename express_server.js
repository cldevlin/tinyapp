const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let output = "";
  for (let i = 0; i < 6; i++) {
    output += String.fromCharCode(Math.floor(Math.random() * 26 + 65 + 32));
  }
  return output;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/u/:shortURL", (req, res) => {
  // console.log("req.params.shortURL", req.params.shortURL);
  // console.log("urlDatabase: ", urlDatabase);
  const longURL = urlDatabase[req.params.shortURL];
  // console.log("longUrl: ", longURL);
  if (longURL === undefined) {
    res.statusCode = 404;
    res.end("Error: shortURL does not exist");
  } else {
    res.redirect(longURL);
  }
});

app.get("/urls", (req, res) => {

  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log("Line 59 req.body: ", req.body);  // Log the POST request body to the console
  let tempString = generateRandomString();
  urlDatabase[tempString] = req.body.longURL;
  res.redirect(`/urls/${tempString}`);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)

});

// removes a URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

