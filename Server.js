const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;
const dirName = 'data';
const fileName = 'book-directory.json';
const filePath = path.join(__dirname, dirName, fileName);
// Middleware to parse JSON bodies
app.use(express.json());
// Initialize directory and file
function initializeFileSystem() {
  if (!fs.existsSync(path.join(__dirname, dirName))) {
    fs.mkdirSync(path.join(__dirname, dirName));
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}
// Read all books
function readBooks() {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}
// Write the updated book directory
function writeBooks(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
// GET: Retrieve the list of all books
app.get('/books', (req, res) => {
  const books = readBooks();
  res.status(200).json(books);
});
// POST: Add a new book to the directory
app.post('/books', (req, res) => {
  const newBook = req.body;
  const books = readBooks();
  books.push(newBook); // Add the new book
  writeBooks(books);
  res.status(201).json(newBook);
});
// PUT: Update an existing book's details using the ISBN
app.put('/books/:isbn', (req, res) => {
  const updatedBook = req.body;
  const { isbn } = req.params;
  let books = readBooks();
  const index = books.findIndex(book => book.isbn === isbn);
  if (index !== -1) {
    books[index] = updatedBook; // Update the book details
    writeBooks(books);
    res.status(200).json(updatedBook);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});
// DELETE: Remove a book from the directory by ISBN
app.delete('/books/:isbn', (req, res) => {
  const { isbn } = req.params;
  let books = readBooks();
  const updatedBooks = books.filter(book => book.isbn !== isbn); // Remove the book
  if (books.length !== updatedBooks.length) {
    writeBooks(updatedBooks);
    res.status(204).end(); // No content, meaning successful deletion
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});
// Initialize the filesystem
initializeFileSystem();
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/books`);
});