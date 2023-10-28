import sqlite3 from 'sqlite3';

// Create a new database file named 'bearblog.db'
const db = new sqlite3.Database('./bearblog.db', (err) => {
  if (err) {
    return console.log('Error:', err.message);
  }
  console.log('Connected to the bearblog database.');
});

// Create the ZSFNOTE table with the specified fields
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS ZSFNOTE (
    Z_PK INTEGER PRIMARY KEY,
    ZTITLE VARCHAR,
    ZTEXT VARCHAR,
    ZUNIQUEIDENTIFIER VARCHAR,
    ZMODIFICATIONDATE TIMESTAMP,
    ZARCHIVED INTEGER
  );
`;

db.run(createTableQuery, (err) => {
  if (err) {
    return console.log('Error:', err.message);
  }
  console.log('ZSFNOTE table created.');
});

// Close the database connection
db.close((err) => {
  if (err) {
    return console.log('Error:', err.message);
  }
  console.log('Closed the database connection.');
});
