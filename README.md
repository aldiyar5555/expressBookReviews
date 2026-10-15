# expressBookReviews — Online Book Shop (Server-side)

Final project: server-side application for an online book shop built with **Node.js + Express**,
**express-session** and **JWT** authentication. Forked from `ibm-developer-skills-network/expressBookReviews`.

## Features
| # | Feature | Method & route |
|---|---------|----------------|
| 1 | Get all books | `GET /` |
| 2 | Get book by ISBN | `GET /isbn/:isbn` |
| 3 | Get books by author | `GET /author/:author` |
| 4 | Get books by title | `GET /title/:title` |
| 5 | Get book reviews | `GET /review/:isbn` |
| 6 | Register a new user | `POST /register` |
| 7 | Login (registered users) | `POST /customer/login` |
| 8 | Add / modify a review | `PUT /customer/auth/review/:isbn?review=...` |
| 9 | Delete own review | `DELETE /customer/auth/review/:isbn` |
| 10–13 | Same queries with **Axios** (async/await & Promises) | `GET /async/books`, `/async/isbn/:isbn`, `/async/author/:author`, `/async/title/:title` |

## Run
```bash
cd final_project
npm install
npm start          # server on http://localhost:5000
```

## Example
```bash
curl -X POST localhost:5000/register -H "Content-Type: application/json" -d '{"username":"maksim","password":"pass123"}'
curl -c cookies.txt -X POST localhost:5000/customer/login -H "Content-Type: application/json" -d '{"username":"maksim","password":"pass123"}'
curl -b cookies.txt -X PUT "localhost:5000/customer/auth/review/1?review=Great%20book!"
curl -b cookies.txt -X DELETE localhost:5000/customer/auth/review/1
```

The cURL outputs for every task are saved in the `outputs/` folder.
