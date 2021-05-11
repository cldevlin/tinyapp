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

//redirects to the actual page when user clicks on short url link
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

//renders URLs page with list of all the URLs currently in the database
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//renders new URL page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//updates an existing url in the database, and redirects back to URLs page
app.post("/urls/:id", (req, res) => {
  //TO DO

  res.redirect("/urls");
});

// removes a URL resource and redirects back to URLs page
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


//renders individual page for a URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//generates a new shortURL, adds it to the database, and redirects to the "show" page
app.post("/urls", (req, res) => {
  // console.log("Line 59 req.body: ", req.body);  // Log the POST request body to the console
  let tempString = generateRandomString();
  urlDatabase[tempString] = req.body.longURL;
  res.redirect(`/urls/${tempString}`);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)

});



// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

