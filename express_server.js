const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.use(express.static('public'));

app.use(cookieParser())

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

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
    password: "purple-monkey-dinosaur"
  },
  "zyxwvu": {
    id: "zyxwvu",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "fght46": {
    id: "fght46",
    email: "user3@example.com",
    password: "654321"
  }
};

function generateRandomString() {
  let output = "";
  for (let i = 0; i < 6; i++) {
    output += String.fromCharCode(Math.floor(Math.random() * 26 + 65 + 32));
  }
  return output;
}

function lookUpEmail(email) {
  console.log("email: ", email);
  for (let id in users) {
    console.log("users[id].email: ", users[id].email);
    if (users[id].email === email) {
      return id;
    }
  }
  return null;
}

function urlsForUser(id) {
  const output = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      output[urlID] = urlDatabase[urlID].longURL;
    }
  }
  // console.log("(urlsForUser function) output: ", output);
  return output;
}

/////////////////
//ACCOUNT STUFF//
/////////////////

//renders login page
app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  // console.log("req.body: ", req.body);
  const user_id = lookUpEmail(req.body.email);
  // console.log("user_id: ", user_id);
  if (!user_id) {
    res.statusCode = 403;
    res.send("<h1>Error: User does not exist</h1>")
  } else if (users[user_id].password !== req.body.password) {
    res.statusCode = 403;
    res.send("Error: incorrect password")
  } else {
    // console.log(users);
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
});

//renders register page
app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 400;
    res.end("Please enter an email and password");
  } else if (users[lookUpEmail(req.body.email)]) {
    res.statusCode = 400;
    res.end("Email already exists");
  } else {
    const id = generateRandomString();
    users[id] = {
      id,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", id);
    // console.log("users: ", users);
    res.redirect("/urls");
  }

  // console.log(users);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});





/////////////
//URL STUFF//
/////////////

//redirects to the actual page when user clicks on short url link
app.get("/u/:shortURL", (req, res) => {
  // console.log("req.params.shortURL", req.params.shortURL);
  // console.log("urlDatabase: ", urlDatabase);
  const urlID = urlDatabase[req.params.shortURL];
  // console.log("longUrl: ", longURL);
  if (urlID === undefined) {
    res.statusCode = 404;
    res.end("Error: shortURL does not exist");
  } else {
    res.redirect(urlID.longURL);
  }
});

//renders new URL page
app.get("/urls/new", (req, res) => {
  if (req.cookies.user_id) {
    res.render("urls_new", { user: users[req.cookies.user_id] });
  } else {
    res.redirect("/login");
  }
});

//EDIT URL: updates an existing url in the database, and redirects back to URLs page
app.post("/urls/:id", (req, res) => {
  if (req.cookies.user_id && req.cookies.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    return res.send("Error: you do not have permission to edit this URL");
  }
});

//DELETE URL: removes a URL resource and redirects back to URLs page
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.user_id && req.cookies.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    return res.send("Error: you do not have permission to delete this URL");
  }
});

//renders individual page for a URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

//renders URLs page with list of all the URLs currently in the database
app.get("/urls", (req, res) => {
  // console.log(req.cookies);
  const templateVars = { urls: urlsForUser(req.cookies.user_id), user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//generates a new shortURL, adds it to the database, and redirects to the "show" page
app.post("/urls", (req, res) => {
  // console.log("Line 59 req.body: ", req.body);  // Log the POST request body to the console
  let tempString = generateRandomString();
  urlDatabase[tempString] = {
    longURL: req.body.longURL,
    userID: req.cookies.user_id
  };
  res.redirect(`/urls/${tempString}`);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


///////////////
//OTHER STUFF//
///////////////

app.get("/", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});



// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

