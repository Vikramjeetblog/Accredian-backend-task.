const mysql = require('mysql2');
const express = require("express");
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt'); 

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'Auth',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL server');
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255)
  )
`;

connection.query(createTableQuery, (err, result) => {
  if (err) throw err;
  console.log('Users table created or already exists');
});

// Signup API
app.post('/signup', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check if password and confirm password match
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Password and Confirm Password do not match' });
  }

  // Hash the password before storing it in the database
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO Users (name, email, password) VALUES (?, ?, ?)";
  const values = [name, email, hashedPassword];

  connection.query(sql, values, (err, data) => {
    if (err) {
      console.error('Error during signup:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    console.log('User registered successfully');
    return res.status(201).json({ message: 'User registered successfully' });
  });
});

// Login API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM Users WHERE email = ?";
  const values = [email];

  connection.query(sql, values, async (err, results) => {
    if (err) {
      console.error('Error during login:', err.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      // No user found with the provided email
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    
    const isPasswordValid = await bcrypt.compare(password, results[0].password);

    if (!isPasswordValid) {
   
      return res.status(401).json({ error: 'Invalid email or password' });
    }


    console.log('User logged in successfully');
    return res.status(200).json({ message: 'User logged in successfully' });
  });
});

app.listen(5000, () => {
  console.log("Server listening on port 5000");
});
