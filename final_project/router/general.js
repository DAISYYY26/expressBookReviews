const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// --- Task 6: Register a new user ---
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some(user => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "User already exists!" });
    }

    users.push({ "username": username, "password": password });
    return res.status(201).json({ message: "Customer successfully registered. Now you can login" });
});

// --- Task 10: Get the book list available in the shop using Async/Await ---
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve) => {
                resolve(books);
            });
        };
        const allBooks = await getBooks();
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books" });
    }
});

// --- Task 11: Get book details based on ISBN using Promises ---
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const findBook = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    });

    findBook
        .then(book => res.status(200).json(book))
        .catch(err => res.status(404).json({ message: err }));
});

// --- Task 12: Get book details based on author using Promises ---
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const findByAuthor = new Promise((resolve) => {
        const filteredBooks = Object.values(books).filter(book => book.author === author);
        resolve(filteredBooks);
    });

    findByAuthor.then(booksFound => {
        return res.status(200).json({ booksbyauthor: booksFound });
    });
});

// --- Task 13: Get all books based on title using Promises ---
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const findByTitle = new Promise((resolve) => {
        const filteredBooks = Object.values(books).filter(book => book.title === title);
        resolve(filteredBooks);
    });

    findByTitle.then(booksFound => {
        return res.status(200).json({ booksbytitle: booksFound });
    });
});

// --- Task 5: Get book review ---
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this ISBN" });
    }
});
// --- Add a review for a book by ISBN ---
public_users.post('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const { username, review } = req.body;

    if (!username || !review) {
        return res.status(400).json({ message: "Username and review are required" });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Add the review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: `Review added/updated successfully for ISBN ${isbn}`,
        reviews: books[isbn].reviews
    });
});

module.exports.general = public_users;
