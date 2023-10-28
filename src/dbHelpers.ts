import os from 'os';
import path from 'path';
import sqlite3, { Database } from 'sqlite3';


export function connectToBearDb(): Database {

    const dbPath = path.join(os.homedir(), 'Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite');

    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.log('Error:', err.message);
        } else {
        console.log('Connected to the bearblog database.');
        }
    });
  return db;

}

export function connectToLocalDb(): Database {

    const localDbPath = path.join(__dirname, '..', 'db', 'bearblog.db');
    
    const localDb = new sqlite3.Database(localDbPath, (err) => {
        if (err) {
            return console.log('Error:', err.message);
        }
        console.log('Connected to the bearblog database.');
    });

    return localDb;
}
