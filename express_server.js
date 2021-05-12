const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser())

app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "abcdef": {
    id: "abcdef",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "zyxwvu": {
    id: "zyxwvu",
    email: "user2@example.com",
    password: "dishwasher-funk"
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
    console.log("id.email: ", id.email);
    if (users[id].email === email) {
      return id;
    }
  }
  return null;
}

/////////////////
//ACCOUNT STUFF//
/////////////////

//renders login page
app.get("/login", (req, res) => {
  // console.log("req.body: ", req.body);
  const templateVars = { user: users[req.cookies.user_id] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  console.log("req.body: ", req.body);
  const user_id = lookUpEmail(req.body.email);
  console.log("user_id: ", user_id);
  if (!user_id) {
    res.statusCode = 403;
    res.end("Error: User does not exist")
  } else if (users[user_id].password !== req.body.password) {
    res.statusCode = 403;
    res.send("Error: incorrect password")
  } else {
    console.log(users);
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
});

//renders register page
app.get("/register", (req, res) => {
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

  console.log(users);
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
  const longURL = urlDatabase[req.params.shortURL];
  // console.log("longUrl: ", longURL);
  if (longURL === undefined) {
    res.statusCode = 404;
    res.end("Error: shortURL does not exist");
  } else {
    res.redirect(longURL);
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

//updates an existing url in the database, and redirects back to URLs page
app.post("/urls/:id", (req, res) => {
  //TO DO
  // console.log();
  urlDatabase[req.params.id] = req.body.longURL;

  res.redirect("/urls");
});

// removes a URL resource and redirects back to URLs page
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//renders individual page for a URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

//renders URLs page with list of all the URLs currently in the database
app.get("/urls", (req, res) => {
  // console.log(req.cookies);
  const templateVars = { urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//generates a new shortURL, adds it to the database, and redirects to the "show" page
app.post("/urls", (req, res) => {
  // console.log("Line 59 req.body: ", req.body);  // Log the POST request body to the console
  let tempString = generateRandomString();
  urlDatabase[tempString] = req.body.longURL;
  res.redirect(`/urls/${tempString}`);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)

});


///////////////
//OTHER STUFF//
///////////////

app.get("/", (req, res) => {
  res.send("Hello!");
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

