const getUserByEmail = function (email, database) {
  // console.log("email: ", email);
  for (let id in database) {
    console.log("users[id].email: ", database[id].email);
    if (database[id].email === email) {
      return id;
    }
  }
  return undefined;
}

function generateRandomString() {
  let output = "";
  for (let i = 0; i < 6; i++) {
    output += String.fromCharCode(Math.floor(Math.random() * 26 + 65 + 32));
  }
  return output;
}

function urlsForUser(id) {
  const output = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      output[urlID] = urlDatabase[urlID].longURL;
    }
  }
  return output;
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser };