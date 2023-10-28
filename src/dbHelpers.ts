import os from 'os';
import path from 'path';
import dotenv from 'dotenv';
import sqlite3, { Database } from 'sqlite3';
import { ZSFNoteRow, ZSFNoteTagRow, Z_5TAGSRow } from './interfaces';

dotenv.config();

export function connectToBearDb(): Database {

    const BEAR_DB_PATH = process.env.BEAR_DB_PATH || ""

    const dbPath = path.join(os.homedir(), BEAR_DB_PATH);

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

    const LOCAL_DB_DIR = process.env.LOCAL_DB_DIR || ''
    const LOCAL_DB = process.env.LOCAL_DB || ''

    const localDbPath = path.join(__dirname, '..', LOCAL_DB_DIR, LOCAL_DB);
    
    const localDb = new sqlite3.Database(localDbPath, (err) => {
        if (err) {
            return console.log('Error:', err.message);
        }
        console.log('Connected to the bearblog database.');
    });

    return localDb;
}

export function saveToLocalDatabase(localDb: Database, rows: ZSFNoteRow[]) {
    rows.forEach((row) => {
      // Check if a record with the same Z_PK exists
      localDb.get('SELECT * FROM ZSFNOTE WHERE Z_PK = ?', [row.Z_PK], (err, existingRow: ZSFNoteRow) => {
        if (err) {
          return console.log('Select Error:', err.message);
        }
  
        // If a matching record is found
        if (existingRow) {
          // Compare ZMODIFICATIONDATE
          if (new Date(row.ZMODIFICATIONDATE) > new Date(existingRow.ZMODIFICATIONDATE)) {
            // Update the record if the new ZMODIFICATIONDATE is greater
            const updateQuery = `
              UPDATE ZSFNOTE
              SET ZTITLE = ?, ZTEXT = ?, ZUNIQUEIDENTIFIER = ?, ZMODIFICATIONDATE = ?, ZARCHIVED = ?, UPDATED = 1
              WHERE Z_PK = ?;
            `;
            localDb.run(updateQuery, [row.ZTITLE, row.ZTEXT, row.ZUNIQUEIDENTIFIER, row.ZMODIFICATIONDATE, row.ZARCHIVED, row.Z_PK], (err) => {
              if (err) {
                return console.log('Update Error:', err.message);
              }
              console.log(`Row updated with ID: ${row.Z_PK}`);
            });
          }
        } else {
          // If no matching record is found, insert a new record
          const insertQuery = `
            INSERT INTO ZSFNOTE (Z_PK, ZTITLE, ZTEXT, ZUNIQUEIDENTIFIER, ZMODIFICATIONDATE, ZARCHIVED)
            VALUES (?, ?, ?, ?, ?, ?);
          `;
          localDb.run(insertQuery, [row.Z_PK, row.ZTITLE, row.ZTEXT, row.ZUNIQUEIDENTIFIER, row.ZMODIFICATIONDATE, row.ZARCHIVED], (err) => {
            if (err) {
              return console.log('Insert Error:', err.message);
            }
            console.log(`Row inserted with ID: ${row.Z_PK}`);
          });
        }
      });
    });
}

const getBloggingTagId = async (bearDb: Database): Promise<number | null> => {
    return new Promise((resolve, reject) => {
        bearDb.get(`SELECT Z_PK FROM ZSFNOTETAG WHERE ZTITLE = ?`, ['blog-from-bear'], (err, row) => {
            if (err) {
                console.log('Error:', err.message);
                reject(err);
            } else {
                const zPkValue = (row as ZSFNoteTagRow)?.Z_PK ?? null;
                resolve(zPkValue);
            }
        });
    });
};

const getTaggedNoteIds = async (bearDb: Database, zPkValue: number | null): Promise<number[]> => {
    return new Promise((resolve, reject) => {
        bearDb.all(`SELECT Z_5NOTES FROM Z_5TAGS WHERE Z_13TAGS = ?`, [zPkValue], (err, rows) => {
            if (err) {
                console.log('Error:', err.message);
                reject(err);
            } else {
                const z13TagsValues = (rows as Z_5TAGSRow[]).map(r => r.Z_5NOTES);
                resolve(z13TagsValues);
            }
        });
    });
};

const fetchTaggedNotes = async (bearDb: Database, z13TagsValues: number[]): Promise<ZSFNoteRow[]> => {
    return new Promise((resolve, reject) => {
        const placeHolders = z13TagsValues.map(() => '?').join(',');
        const sql = `
        SELECT 
            Z_PK, ZTITLE, ZTEXT, ZUNIQUEIDENTIFIER, ZMODIFICATIONDATE, ZARCHIVED 
        FROM 
            ZSFNOTE 
        WHERE 
            Z_PK IN (${placeHolders})
            AND 
            ZARCHIVED = 0
        `;

        bearDb.all(sql, z13TagsValues, (err, rows) => {
            if (err) {
                console.log('Error:', err.message);
                reject(err);
            } else {
                resolve(rows as ZSFNoteRow[]);
            }
        });
    });
};

export async function getNoteContent(localDb: Database): Promise<ZSFNoteRow[]> {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                *
            FROM
                ZSFNOTE
            WHERE
                POSTED <> 1
                OR 
                POSTED IS NULL
            `;

        localDb.all(sql, (err, rows) => {
            if (err) {
                console.log('Error:', err.message);
                reject(err);
            } else {
                resolve(rows as ZSFNoteRow[]);
            }
        });
    });
};


// Main function that executes all steps
export async function fetchBearData(bearDb: Database) {
    try {
        const bloggingTagId = await getBloggingTagId(bearDb);
        const taggedNoteIds = await getTaggedNoteIds(bearDb, bloggingTagId);
        const taggedNotes = await fetchTaggedNotes(bearDb, taggedNoteIds);
        return taggedNotes
    } catch (err) {
        console.log('An error occurred:', err);
    } finally {
        bearDb.close(err => {
            if (err) {
                console.log('Error:', err.message);
            }
            console.log('Database connection closed.');
        });
    }
}

