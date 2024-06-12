const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const { access } = require('fs');
const regd_users = express.Router();

let users = [];
const JWT_SECRET = "secret__"

const isValid = (username)=>{ //returns boolean
  if (username) {
    let valid_users = users.filter((u) => u.username == username);
    if (valid_users.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validusers = users.filter((ur) => (ur.username == username && ur.password == password));
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const usr = req.body.username;
  const pwd = req.body.password;
  if (!(usr && pwd)) {
    return res.status(404).json({message: "Error logging in. Please provide both username and password."});
  } else if (!authenticatedUser(usr, pwd)){
    return res.status(208).json({message: "Invalid login."});
  } else {
    // authenticated user, generating session token
    let token = jwt.sign(
      {data: pwd},
      JWT_SECRET,
      {expiresIn: 60 * 60}
    );
    req.session.authorization = {"accessToken": token, "username": usr};
    return res.status(200).send("User successfully logged in. Welcome " + usr);
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  var info = books[isbn];
  if (info) {
    const username = req.session.authorization.username;
    const addedreview = req.body.review;
    if (addedreview) {
      let reviews = info.reviews;
      reviews[username] = addedreview;
      books[isbn].reviews = reviews;
    }
    return res.send(`Book ISBN=${isbn} is updated with review from user '${username}'.`)
  } else {
    return res.status(404).json({message: `Trying to operate reviews on unknown book, ISBN=${isbn}`})
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  var info = books[isbn];
  if (info) {
    const username = req.session.authorization.username;
    delete info.reviews[username];
    res.send(`Deleted user ${username}'s review of book ISBN=${isbn}. The book is left with ${Object.keys(info.reviews).length} reviews now.`);
  } else {
    return res.status(404).json({message: `Trying to operate on unknown book, ISBN=${isbn}`})
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.JWT_SECRET = JWT_SECRET;
