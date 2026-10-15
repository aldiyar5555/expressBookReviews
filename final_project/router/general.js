const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

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

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn], null, 4));
    }
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
    let result = {};
    Object.keys(books).forEach((isbn) => {
        if (books[isbn].author.toLowerCase() === author) {
            result[isbn] = books[isbn];
        }
    });
    if (Object.keys(result).length > 0) {
        return res.status(200).send(JSON.stringify(result, null, 4));
    }
    return res.status(404).json({ message: `No books found by author ${req.params.author}` });
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
    let result = {};
    Object.keys(books).forEach((isbn) => {
        if (books[isbn].title.toLowerCase() === title) {
            result[isbn] = books[isbn];
        }
    });
    if (Object.keys(result).length > 0) {
        return res.status(200).send(JSON.stringify(result, null, 4));
    }
    return res.status(404).json({ message: `No books found with title ${req.params.title}` });
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
    }
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

/* ======================================================================
   Tasks 10–13: the same operations using async/await (and Promises) with Axios.
   Each function makes an HTTP request to the routes above.
   They are also exposed as routes under /async/... so they can be tested with cURL.
   ====================================================================== */

// Task 10: Get all books — async/await with Axios
const getAllBooks = async () => {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
};

// Task 11: Get book details by ISBN — Promise callbacks with Axios
const getBookByISBN = (isbn) => {
    return axios.get(`${BASE_URL}/isbn/${isbn}`)
        .then((response) => response.data)
        .catch((error) => { throw error; });
};

// Task 12: Get book details by author — async/await with Axios
const getBooksByAuthor = async (author) => {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
};

// Task 13: Get book details by title — async/await with Axios
const getBooksByTitle = async (title) => {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
};

// Helper: send an Axios error back to the client
const sendError = (res, error) => {
    if (error.response) {
        return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ message: "Error fetching data", error: error.message });
};

public_users.get('/async/books', async (req, res) => {
    try {
        const data = await getAllBooks();
        return res.status(200).json(data);
    } catch (error) {
        return sendError(res, error);
    }
});

public_users.get('/async/isbn/:isbn', (req, res) => {
    getBookByISBN(req.params.isbn)
        .then((data) => res.status(200).json(data))
        .catch((error) => sendError(res, error));
});

public_users.get('/async/author/:author', async (req, res) => {
    try {
        const data = await getBooksByAuthor(req.params.author);
        return res.status(200).json(data);
    } catch (error) {
        return sendError(res, error);
    }
});

public_users.get('/async/title/:title', async (req, res) => {
    try {
        const data = await getBooksByTitle(req.params.title);
        return res.status(200).json(data);
    } catch (error) {
        return sendError(res, error);
    }
});

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
