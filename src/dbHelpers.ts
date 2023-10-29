import os from 'os';
import path from 'path';
import dotenv from 'dotenv';
import sqlite3, { Database } from 'sqlite3';
import { UTILSRow, ZSFNoteRow, ZSFNoteTagRow, Z_5TAGSRow } from './interfaces';

dotenv.config();

export function connectToBearDb(): Database {

    const BEAR_DB_PATH = process.env.BEAR_DB_PATH || ""

    const db = new sqlite3.Database(BEAR_DB_PATH, (err) => {
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
        console.log('Connected to the local database.');
    });

    return localDb;
}

function dbGetAsync(db: Database, query: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
}
  
function dbRunAsync(db: Database, query: string, params: any[]): Promise<void> {
return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
    if (err) reject(err);
    else resolve();
    });
});
}

export async function saveToLocalDatabase(localDb: Database, rows: ZSFNoteRow[]): Promise<void> {

    const taskPromises = rows.map(async (row) => {
        try {
            const existingRow: ZSFNoteRow = await dbGetAsync(localDb, 'SELECT * FROM ZSFNOTE WHERE Z_PK = ?', [row.Z_PK]);

            if (existingRow) {
                if (new Date(row.ZMODIFICATIONDATE) > new Date(existingRow.ZMODIFICATIONDATE)) {
                const updateQuery = `
                    UPDATE ZSFNOTE
                    SET ZTITLE = ?, 
                    ZTEXT = ?, 
                    ZHASIMAGES = ?,
                    ZUNIQUEIDENTIFIER = ?, 
                    ZCREATIONDATE = ?, 
                    ZMODIFICATIONDATE = ?, 
                    ZARCHIVED = ?, 
                    UPDATED = 1
                    WHERE Z_PK = ?;
                `;
                await dbRunAsync(localDb, updateQuery, [
                    row.ZTITLE, 
                    row.ZTEXT, 
                    row.ZHASIMAGES,
                    row.ZUNIQUEIDENTIFIER, 
                    row.ZCREATIONDATE, row.
                    ZMODIFICATIONDATE, 
                    row.ZARCHIVED, 
                    row.Z_PK]);
                }
            } else {
                const insertQuery = `
                INSERT INTO ZSFNOTE (
                    Z_PK, 
                    ZTITLE, 
                    ZTEXT, 
                    ZHASIMAGES,
                    ZUNIQUEIDENTIFIER, 
                    ZCREATIONDATE, 
                    ZMODIFICATIONDATE, 
                    ZARCHIVED)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                `;
                await dbRunAsync(localDb, insertQuery, [
                    row.Z_PK, 
                    row.ZTITLE, 
                    row.ZTEXT, 
                    row.ZHASIMAGES,
                    row.ZUNIQUEIDENTIFIER, 
                    row.ZCREATIONDATE, 
                    row.ZMODIFICATIONDATE, 
                    row.ZARCHIVED]);
            }
        } catch (err) {
            if (err instanceof Error) {
                console.log('Database Error:', err.message);
              } else {
                console.log('An unknown error occurred:', err);
              }
        }
    });

    await Promise.all(taskPromises);
}

// Retrieve the local timestamp for the last check
const getLastUpdateTimestamp = async (localDb: Database): Promise<number | null> => {
    return new Promise((resolve, reject) => {
        localDb.get(`select LASTCHECK from UTILS`, (err, row) => {
            if (err) {
                console.log('Error:', err.message);
                reject(err);
            } else {
                const lastUpdateValue = (row as UTILSRow)?.LASTCHECK ?? null;
                resolve(lastUpdateValue);
            }
        });
    });
};

// Update the local timestamp for the last check
export async function updateLastUpdateTimestamp(localDb: Database, timestamp: number): Promise<number | null> {
    return new Promise((resolve, reject) => {
        localDb.get(`UPDATE UTILS SET LASTCHECK = ?`, timestamp, (err, row) => {
            if (err) {
                console.log('Error:', err.message);
                reject(err);
            } else {
                resolve(timestamp);
            }
        });
    });
};

// Update the local timestamp for the last check
export async function cleanLocalDatabase(localDb: Database): Promise<string | null> {
    return new Promise((resolve, reject) => {
        localDb.get(`DELETE FROM ZSFNOTE WHERE 1=1`, (err, row) => {
            if (err) {
                console.log('Error:', err.message);
                reject(err);
            } else {
                resolve("completed");
            }
        });
    });
};

export function lastUpdateTimestamp(): number {
    // Subtract the difference in seconds (31 years) from the Unix time
    const unixTime = new Date().getTime();
    const coreDataTime = (unixTime / 1000) - 978307200; // Unix time is in milliseconds
    return coreDataTime;
}

// Retrieve the ID of the tag that we're going to be searching for
// This can vary from system to system
const getBloggingTagId = async (bearDb: Database): Promise<number | null> => {

    const BEAR_BLOG_TAG = process.env.BEAR_BLOG_TAG || ''

    return new Promise((resolve, reject) => {
        bearDb.get(`SELECT Z_PK FROM ZSFNOTETAG WHERE ZTITLE = ?`, [BEAR_BLOG_TAG], (err, row) => {
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

// Get all notes IDs that have the tag we're looking for
const getTaggedNoteIds = async (bearDb: Database, tagId: number | null): Promise<number[]> => {
    return new Promise((resolve, reject) => {
        bearDb.all(`SELECT Z_5NOTES FROM Z_5TAGS WHERE Z_13TAGS = ?`, [tagId], (err, rows) => {
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

// Get all notes with the tag we're interested in
// don't get deleted or archived ones
// don't get ones that haven't been modified since the last check
const fetchTaggedNotes = async (bearDb: Database, localDb: Database, z13TagsValues: number[]): Promise<ZSFNoteRow[]> => {

    const lastUpdate = await getLastUpdateTimestamp(localDb);
    
    return new Promise((resolve, reject) => {
        const placeHolders = z13TagsValues.map(() => '?').join(',');
        const sql = `
        SELECT 
            Z_PK, ZTITLE, ZTEXT, ZHASIMAGE, ZUNIQUEIDENTIFIER, ZCREATIONDATE, ZMODIFICATIONDATE, ZARCHIVED 
        FROM 
            ZSFNOTE 
        WHERE 
            Z_PK IN (${placeHolders})
                AND 
            ZARCHIVED != 1
                AND
            ZTRASHED != 1
                AND
            ZPERMANENTLYDELETED != 1
                AND
            ZMODIFICATIONDATE > ${lastUpdate}
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
export async function fetchBearData(bearDb: Database, localDb: Database) {
    try {
        const bloggingTagId = await getBloggingTagId(bearDb);

        const taggedNoteIds = await getTaggedNoteIds(bearDb, bloggingTagId);

        const taggedNotes = await fetchTaggedNotes(bearDb, localDb, taggedNoteIds);

        return taggedNotes

    } catch (err) {
        console.log('An error occurred:', err);
    } finally {
        bearDb.close(err => {
            if (err) {
                console.log('Error:', err.message);
            }
            console.log('BearDB connection closed.');
        });
    }
}

