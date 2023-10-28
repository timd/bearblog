"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbHelpers_1 = require("./dbHelpers");
console.log("Running...");
const bearDb = (0, dbHelpers_1.connectToBearDb)();
const localDb = (0, dbHelpers_1.connectToLocalDb)();
// const bearBlogDbPath = path.join(__dirname, '..', 'db', 'bearblog.db');
// console.log(bearBlogDbPath)
// const localDb = new sqlite3.Database(bearBlogDbPath, (err) => {
//   if (err) {
//     return console.log('Error:', err.message);
//   }
//   console.log('Connected to the bearblog database.');
// });
// Access the database
bearDb.serialize(() => {
    // Step 1: Retrieve the Z_PK value from the ZSFNOTETAG table where the ZTITLE field = "blog-from-bear"
    bearDb.get(`SELECT Z_PK FROM ZSFNOTETAG WHERE ZTITLE = ?`, ['blog-from-bear'], (err, row) => {
        var _a;
        if (err) {
            console.log('Error:', err.message);
            return;
        }
        const zPkValue = (_a = row === null || row === void 0 ? void 0 : row.Z_PK) !== null && _a !== void 0 ? _a : null;
        // Step 2: Retrieve all Z_13TAGS values from the Z_5TAGS table where the Z_13TAGS value is the Z_PK value retrieved from the previous step
        bearDb.all(`SELECT Z_5NOTES FROM Z_5TAGS WHERE Z_13TAGS = ?`, [zPkValue], (err, rows) => {
            if (err) {
                console.log('Error:', err.message);
                return;
            }
            const z13TagsValues = rows.map(r => r.Z_5NOTES);
            // Step 3: Retrieve all fields for all records from the ZSFNOTE table where the Z_PK values are included in the set returned in the previous step
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
                    return;
                }
                // Print the retrieved records
                console.log('Retrieved Records:', rows);
                saveToBearBlogDatabase(rows);
                bearDb.close((err) => {
                    if (err) {
                        console.log('Error:', err.message);
                    }
                    console.log('Database connection closed.');
                });
            });
        });
    });
});
const saveToBearBlogDatabase = (rows) => {
    rows.forEach((row) => {
        // Check if a record with the same Z_PK exists
        localDb.get('SELECT * FROM ZSFNOTE WHERE Z_PK = ?', [row.Z_PK], (err, existingRow) => {
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
            }
            else {
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
};
