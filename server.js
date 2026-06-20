const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Middleware
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database at:', DB_PATH);
    initializeDatabase();
  }
});

// Seed data
const DEFAULT_TRANSACTIONS = [
  {
    id: 'tx-1',
    description: 'Monthly Salary',
    amount: 3500.00,
    type: 'income',
    category: 'Salary',
    date: '2026-06-01'
  },
  {
    id: 'tx-2',
    description: 'Apartment Rent',
    amount: 1200.00,
    type: 'expense',
    category: 'Housing',
    date: '2026-06-02'
  },
  {
    id: 'tx-3',
    description: 'Weekly Groceries',
    amount: 145.50,
    type: 'expense',
    category: 'Food',
    date: '2026-06-05'
  },
  {
    id: 'tx-4',
    description: 'Electricity Bill',
    amount: 85.20,
    type: 'expense',
    category: 'Utilities',
    date: '2026-06-08'
  },
  {
    id: 'tx-5',
    description: 'Cinemas Movie Tickets',
    amount: 32.00,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-06-12'
  }
];

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      category TEXT NOT NULL,
      date TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Transactions table ready.');
      seedDatabaseIfEmpty();
    }
  });
}

function seedDatabaseIfEmpty() {
  db.get('SELECT COUNT(*) AS count FROM transactions', [], (err, row) => {
    if (err) {
      console.error('Error checking row count:', err.message);
      return;
    }
    
    if (row.count === 0) {
      console.log('Seeding initial mock database rows...');
      const stmt = db.prepare(`
        INSERT INTO transactions (id, description, amount, type, category, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      DEFAULT_TRANSACTIONS.forEach(tx => {
        stmt.run(tx.id, tx.description, tx.amount, tx.type, tx.category, tx.date);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error seeding database:', err.message);
        } else {
          console.log('Initial seeding complete!');
        }
      });
    }
  });
}

// --- API ROUTES ---

// GET: Fetch all transactions
app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST: Add new transaction
app.post('/api/transactions', (req, res) => {
  const { id, description, amount, type, category, date } = req.body;
  
  // Validation
  if (!id || !description || typeof amount !== 'number' || amount <= 0 || !['income', 'expense'].includes(type) || !category || !date) {
    return res.status(400).json({ error: 'Validation failed. Missing or invalid transaction data.' });
  }
  
  db.run(`
    INSERT INTO transactions (id, description, amount, type, category, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id, description, amount, type, category, date], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id, description, amount, type, category, date });
  });
});

// DELETE: Single transaction
app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM transactions WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Transaction deleted successfully', changes: this.changes });
  });
});

// DELETE: Clear all transactions
app.delete('/api/transactions', (req, res) => {
  db.run('DELETE FROM transactions', [], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'All transactions cleared successfully', changes: this.changes });
  });
});

// POST: Bulk Import transactions (clears old ones first)
app.post('/api/transactions/import', (req, res) => {
  const transactions = req.body;
  
  if (!Array.isArray(transactions)) {
    return res.status(400).json({ error: 'Import payload must be a JSON array.' });
  }
  
  // Validate items
  const isValid = transactions.every(tx => {
    return tx.id && tx.description && typeof tx.amount === 'number' && tx.amount > 0 &&
           ['income', 'expense'].includes(tx.type) && tx.category && tx.date;
  });
  
  if (!isValid) {
    return res.status(400).json({ error: 'Invalid schema detected on one or more transactions.' });
  }
  
  // Process in a transaction wrapper
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run('DELETE FROM transactions');
    
    const stmt = db.prepare(`
      INSERT INTO transactions (id, description, amount, type, category, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    let errorOccurred = false;
    transactions.forEach(tx => {
      stmt.run(tx.id, tx.description, tx.amount, tx.type, tx.category, tx.date, (err) => {
        if (err) errorOccurred = true;
      });
    });
    
    stmt.finalize();
    
    if (errorOccurred) {
      db.run('ROLLBACK');
      res.status(500).json({ error: 'Error inserting data during import. Rolled back.' });
    } else {
      db.run('COMMIT');
      res.json({ message: 'Import completed successfully', count: transactions.length });
    }
  });
});

// Serve static frontend assets
app.use(express.static(path.join(__dirname)));

// Fallback all routes to index.html (SPA style, if needed)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`ChaitanyaFinance Server running at http://localhost:${PORT}`);
  console.log(`==================================================`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Closed SQLite database connection.');
    }
    process.exit(0);
  });
});
