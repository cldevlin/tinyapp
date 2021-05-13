// searchs user database for an email and returns the user object
const getUserByEmail = function(email, database) {
  for (let id in database) {
    console.log("users[id].email: ", database[id].email);
    if (database[id].email === email) {
      return id;
    }
  }
  return undefined;
};

// generates 6-character random string
const generateRandomString = function() {
  let output = "";
  for (let i = 0; i < 6; i++) {
    output += String.fromCharCode(Math.floor(Math.random() * 26 + 65 + 32));
  }
  return output;
};

// returns object of url IDs (keys) with associated long URLs (values) of a given user
const urlsForUser = function(id, urlDatabase) {
  const output = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      output[urlID] = urlDatabase[urlID].longURL;
    }
  }
  return output;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };