const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL of this server. Axios uses it to fetch the book list.
const BASE_URL = "http://localhost:5000";

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Unable to register user. Username and password are required." });
    }
    if (!isValid(username)) {
        return res.status(404).json({ message: "User already exists!" });
    }

    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Data source endpoint: returns the raw books object (used by the Axios requests below)
public_users.get('/books', function (req, res) {
    return res.status(200).json(books);
});

// Helper: fetch all books with Axios (returns a Promise)
const fetchBooks = () => axios.get(`${BASE_URL}/books`);

// Task 1 + Task 10: Get the book list available in the shop
// Implemented with async/await and Axios
public_users.get('/', async function (req, res) {
    try {
        const response = await fetchBooks();
        return res.status(200).send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book list", error: error.message });
    }
});

// Task 2 + Task 11: Get book details based on ISBN
// Implemented with Promise callbacks (.then / .catch) and Axios
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    fetchBooks()
        .then((response) => {
            const book = response.data[isbn];
            if (book) {
                return res.status(200).send(JSON.stringify(book, null, 4));
            }
            return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
        })
        .catch((error) => {
            return res.status(500).json({ message: "Error fetching book details", error: error.message });
        });
});

// Task 3 + Task 12: Get book details based on author
// Implemented with async/await and Axios
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();
    try {
        const response = await fetchBooks();
        const allBooks = response.data;
        let result = {};
        Object.keys(allBooks).forEach((isbn) => {
            if (allBooks[isbn].author.toLowerCase() === author) {
                result[isbn] = allBooks[isbn];
            }
        });
        if (Object.keys(result).length > 0) {
            return res.status(200).send(JSON.stringify(result, null, 4));
        }
        return res.status(404).json({ message: `No books found by author ${req.params.author}` });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by author", error: error.message });
    }
});

// Task 4 + Task 13: Get all books based on title
// Implemented with async/await and Axios
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase();
    try {
        const response = await fetchBooks();
        const allBooks = response.data;
        let result = {};
        Object.keys(allBooks).forEach((isbn) => {
            if (allBooks[isbn].title.toLowerCase() === title) {
                result[isbn] = allBooks[isbn];
            }
        });
        if (Object.keys(result).length > 0) {
            return res.status(200).send(JSON.stringify(result, null, 4));
        }
        return res.status(404).json({ message: `No books found with title ${req.params.title}` });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by title", error: error.message });
    }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    }
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

module.exports.general = public_users;
