const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL of this server. Axios sends its requests here.
const BASE_URL = "http://localhost:5000";

/* ------------------------------------------------------------------
   Helper functions (shared by all routes to avoid repeated code)
   ------------------------------------------------------------------ */

/**
 * Fetches the whole book list with Axios.
 * @returns {Promise<Object>} Promise that resolves to the books object
 */
const fetchBooks = () => axios.get(`${BASE_URL}/books`).then((response) => response.data);

/**
 * Returns only the books whose given field (author or title)
 * matches the value (case-insensitive).
 */
const filterBooks = (allBooks, field, value) => {
    const result = {};
    Object.keys(allBooks).forEach((isbn) => {
        if (allBooks[isbn][field].toLowerCase() === value.toLowerCase()) {
            result[isbn] = allBooks[isbn];
        }
    });
    return result;
};

/** Sends data as nicely formatted JSON */
const sendJSON = (res, data) => res.status(200).send(JSON.stringify(data, null, 4));

/** Centralized error handler: one consistent error format for all routes */
const handleError = (res, error, status = 500) => {
    return res.status(status).json({ message: "Error retrieving books", error: error.message });
};

/** Consistent "not found" message for all routes */
const notFound = (res, what) => res.status(404).json({ message: `No books found for ${what}` });

/* ------------------------------------------------------------------
   Task 6: Register a new user
   ------------------------------------------------------------------ */
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(404).json({ message: "Unable to register user. Username and password are required." });
    }
    if (!isValid(username)) {
        return res.status(404).json({ message: "User already exists!" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

/* ------------------------------------------------------------------
   Data source endpoint: returns the raw books object.
   All Axios requests below get the data from here.
   ------------------------------------------------------------------ */
public_users.get('/books', (req, res) => res.status(200).json(books));

/* ------------------------------------------------------------------
   Task 1 + Task 10: Get the list of all books
   Uses async/await with Axios
   ------------------------------------------------------------------ */
public_users.get('/', async (req, res) => {
    try {
        const allBooks = await fetchBooks();
        return sendJSON(res, allBooks);
    } catch (error) {
        return handleError(res, error);
    }
});

/* ------------------------------------------------------------------
   Task 2 + Task 11: Get book details based on ISBN
   Uses Promise callbacks (.then / .catch) with Axios
   ------------------------------------------------------------------ */
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    fetchBooks()
        .then((allBooks) => {
            const book = allBooks[isbn];
            return book ? sendJSON(res, book) : notFound(res, `ISBN ${isbn}`);
        })
        .catch((error) => handleError(res, error));
});

/* ------------------------------------------------------------------
   Task 3 + Task 12: Get book details based on author
   Uses async/await with Axios
   ------------------------------------------------------------------ */
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const allBooks = await fetchBooks();
        const result = filterBooks(allBooks, "author", author);
        return Object.keys(result).length > 0 ? sendJSON(res, result) : notFound(res, `author ${author}`);
    } catch (error) {
        return handleError(res, error);
    }
});

/* ------------------------------------------------------------------
   Task 4 + Task 13: Get book details based on title
   Uses async/await with Axios
   ------------------------------------------------------------------ */
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const allBooks = await fetchBooks();
        const result = filterBooks(allBooks, "title", title);
        return Object.keys(result).length > 0 ? sendJSON(res, result) : notFound(res, `title ${title}`);
    } catch (error) {
        return handleError(res, error);
    }
});

/* ------------------------------------------------------------------
   Task 5: Get book reviews based on ISBN
   ------------------------------------------------------------------ */
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    return books[isbn] ? sendJSON(res, books[isbn].reviews) : notFound(res, `ISBN ${isbn}`);
});

module.exports.general = public_users;
