const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;


app.use(express.json());

let books = [];


app.post('/api/books', (req, res) => {
  const { id, title, author, category, quantity, available } = req.body;

 
  if (id === undefined || !title || !author || !category || quantity === undefined) {
    return res.status(400).json({
      message: 'id, title, author, category and quantity are required'
    });
  }

 
  if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0) {
    return res.status(400).json({ message: 'quantity must be a non-negative whole number' });
  }

 
  const exists = books.find((b) => b.id === id);
  if (exists) {
    return res.status(409).json({ message: 'Book with this id already exists' });
  }

 
  let availableCopies = available === undefined ? quantity : available;

  if (typeof availableCopies !== 'number' || availableCopies < 0 || availableCopies > quantity) {
    return res.status(400).json({ message: 'available must be a number between 0 and quantity' });
  }

  const newBook = { id, title, author, category, quantity, available: availableCopies };
  books.push(newBook);

  res.status(201).json({ message: 'Book added successfully', book: newBook });
});

//  search books 
app.get('/api/books/search', (req, res) => {
  const { title, author, category } = req.query;

  let result = books;

  if (title) {
    result = result.filter((b) => b.title.toLowerCase().includes(title.toLowerCase()));
  }
  if (author) {
    result = result.filter((b) => b.author.toLowerCase().includes(author.toLowerCase()));
  }
  if (category) {
    result = result.filter((b) => b.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (result.length === 0) {
    return res.status(404).json({ message: 'No books found' });
  }

  res.json(result);
});


app.get('/api/books', (req, res) => {
  if (books.length === 0) {
    return res.status(200).json({ message: 'No books available', books: [] });
  }
  res.json(books);
});


app.get('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  res.json(book);
});


app.put('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }


  if (req.body.id !== undefined && req.body.id !== book.id) {
    return res.status(400).json({ message: 'Book id cannot be changed' });
  }

  const { title, author, category, quantity, available } = req.body;

  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({ message: 'quantity must be a non-negative whole number' });
    }
  }

  const newQuantity = quantity !== undefined ? quantity : book.quantity;
  const newAvailable = available !== undefined ? available : book.available;

  if (typeof newAvailable !== 'number' || newAvailable < 0 || newAvailable > newQuantity) {
    return res.status(400).json({ message: 'available must be between 0 and quantity' });
  }

 
  if (title) book.title = title;
  if (author) book.author = author;
  if (category) book.category = category;
  book.quantity = newQuantity;
  book.available = newAvailable;

  res.json({ message: 'Book updated successfully', book });
});


app.delete('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = books.findIndex((b) => b.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const deleted = books.splice(index, 1);
  res.json({ message: 'Book deleted successfully', book: deleted[0] });
});


app.post('/api/books/:id/issue', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (book.available === 0) {
    return res.status(400).json({ message: 'No copies available to issue' });
  }

  book.available -= 1;
  res.json({ message: 'Book issued successfully', book });
});


app.post('/api/books/:id/return', (req, res) => {
  const id = Number(req.params.id);
  const book = books.find((b) => b.id === id);

  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (book.available >= book.quantity) {
    return res.status(400).json({ message: 'All copies are already in the library' });
  }

  book.available += 1;
  res.json({ message: 'Book returned successfully', book });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});