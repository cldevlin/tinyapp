const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express');
const app = express();
const PORT = 8080;

const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");


/////////////
//DATABASES//
/////////////

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW" },
  "di5jrf": { longURL: "http://www.abc.com", userID: "zyxwvu" },
  "kww95he": { longURL: "http://www.def.com", userID: "fght46" }
};

const users = {
  "aJ48lW": {
    id: "aJ48lW",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "zyxwvu": {
    id: "zyxwvu",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", saltRounds)
  },
  "fght46": {
    id: "fght46",
    email: "user3@example.com",
    password: bcrypt.hashSync("654321", saltRounds)
  }
};


//////////////////
//ACCOUNT ROUTES//
//////////////////

//renders login page (unless user is already logged in)
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

// Logs in user by creating encrypted cookie, then redirects to /urls
app.post("/login", (req, res) => {
  const userId = getUserByEmail(req.body.email, users);
  if (!userId) {
    res.statusCode = 403;
    return res.send("<html><h1>Error: User does not exist</h1></html>");
  } else if (!bcrypt.compareSync(req.body.password, users[userId].password)) {
    res.statusCode = 403;
    return res.send("<html><h1>Error: incorrect password</h1></html>");
  } else {
    req.session["user_id"] = userId;
    return res.redirect("/urls");
  }
});

//renders register page (unless user is already logged in)
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id] };
  return res.render("register", templateVars);
});

// Adds user to database with hashed password, creates encrypted cookie (login), then redirects to /urls
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    return res.send("<html><h1>Error: Please enter an email and password</h1></html>");
  } else if (users[getUserByEmail(req.body.email, users)]) {
    res.statusCode = 400;
    return res.send("<html><h1>Error: Email already exists</h1></html>");
  } else {
    const id = generateRandomString();
    users[id] = {
      id,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, saltRounds)
    };
    req.session["user_id"] = id;
    return res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});





//////////////
//URL ROUTES//
//////////////

//redirects to the actual page when user clicks on short url link
app.get("/u/:id", (req, res) => {
  const urlID = urlDatabase[req.params.id];
  if (urlID === undefined) {
    res.statusCode = 404;
    return res.send("<html><h1>Error: shortURL does not exist</h1></html>");
  } else {
    res.redirect(urlID.longURL);
  }
});

//renders new URL page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    res.render("urls_new", { user: users[req.session.user_id] });
  } else {
    res.redirect("/login");
  }
});

//DELETE URL: removes a URL resource and redirects back to URLs page
app.post("/urls/:id/delete", (req, res) => {
  console.log("req.session", req.session);
  if (req.session.user_id && req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  }
  return res.send("<html><h1>Error: you do not have permission to delete this URL</h1></html>");
});

//EDIT URL: updates an existing url in the database, and redirects back to URLs page
app.post("/urls/:id", (req, res) => {
  if (req.session.user_id && req.session.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    return res.send("<html><h1>Error: you do not have permission to edit this URL</h1></html>");
  }
});

//renders individual page for a URL
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.send("<html><h1>Error: this URL does not exist</h1></html> ");
  } else if (!req.session.user_id) {
    return res.send("<html><h1>Error: please login to view this page</h1></html> ");
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.send('<html><h1>Error: you do not have permission to view this URL</h1></html>');
  }
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

//renders URLs page with list of all the URLs currently in the database
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlsForUser(req.session.user_id, urlDatabase), user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

//generates a new shortURL, adds it to the database, and redirects to the "show" page
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send('<html><h1>Error: please login to view this page</h1></html>');
  }
  let tempString = generateRandomString();
  urlDatabase[tempString] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  return res.redirect(`/urls/${tempString}`);
});


///////////////
//OTHER STUFF//
///////////////

// redirects to /urls if logged in, or /login if not logged in
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

