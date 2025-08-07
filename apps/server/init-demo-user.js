import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'events.db');
const db = new sqlite3.Database(DB_PATH);

async function createDemoUser() {
  try {
    // Hash the demo password
    const passwordHash = await bcrypt.hash('demo123', 10);
    
    // Insert demo user
    db.run(
      'INSERT OR IGNORE INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      ['demo@example.com', passwordHash, 'Demo User'],
      function(err) {
        if (err) {
          console.error('Error creating demo user:', err);
        } else {
          console.log('✅ Demo user created successfully!');
          console.log('Email: demo@example.com');
          console.log('Password: demo123');
        }
        db.close();
      }
    );
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
}

// Wait a bit for tables to be created
setTimeout(createDemoUser, 1000);