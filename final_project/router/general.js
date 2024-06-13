const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  // console.log("registered\n" + JSON.stringify(users));
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({message: "Must provide username and password to register new user."});
  } else if (isValid(username)) {
    return res.status(404).json({message: `User '${username}' is already registered.`});
  } else {
    users.push({"username": username, "password": password});
    return res.status(200).json({message: `New user registered: '${username}'`});
  }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  //return res.send(JSON.stringify(books, null, 4));
  async function getBooks() {
    return books;
  }
  return getBooks()
  .then((result) => res.json(result))
  .catch((err) => res.status(404).send({message: "Failed to get books database, err: " + err.toString()}));
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here 
  const prom = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;
    const info = books[isbn];
    if (info) {
      resolve(info);
    } else {
      throw new Error(`Book with ISBN ${isbn} is not found in database.`);
    }
  });
  return prom
  .then((result) => res.json(result))
  .catch((err) => res.status(404).send({message: err.toString()}));
  /*
  const info = books[isbn];
  if (info) {
    res.json(info);
  } else {
    res.status(404).send({message: `Book with ISBN ${isbn} is not found.`})
  }
  */
 });


async function getBooksByKeyValue(key, value) {
  return new Promise((resolve, reject) => {
    var out = [];
    for (const [isbn_, info_] of Object.entries(books)) {
      if (info_[key] == value) {
        out.push(info_);
      }
    }
    if (out.length > 0) {
      resolve(out);
    } else {
      reject(`Unknown ${key}='${value}'`);
    }
  });
}
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  return getBooksByKeyValue("author", req.params.author)
  .then((value) => res.send(value))
  .catch((err) => res.status(404).send({message: err.toString()}))
  /*
  //Write your code here
  const author = req.params.author;
  var out = []; 
  for (const [idx_, info_] of Object.entries(books)) {
      if (info_.author == author) {
        out.push(info_);
      }
  }
  res.send(out);
  */
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  return getBooksByKeyValue("title", req.params.title)
  .then((value) => res.send(value))
  .catch((err) => res.status(404).send({message: err.toString()}))
  /*
  //Write your code here
  const title = req.params.title.toLowerCase();
  var out = [];
  for (const [_, info_] of Object.entries(books)) {
    if (info_.title.toLowerCase() == title) {
      out.push(info_);
    }
  }
  res.send(out);
  */
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const info = books[isbn];
  if (info) {
    return res.json(info.reviews);
  } else {
    return res.status(404).send({message: `Book with ISBN ${isbn} is not found.`});
  }

});

module.exports.general = public_users;
