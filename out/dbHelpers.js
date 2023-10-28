"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchBearData = exports.saveToLocalDatabase = exports.connectToLocalDb = exports.connectToBearDb = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const sqlite3_1 = __importDefault(require("sqlite3"));
dotenv_1.default.config();
function connectToBearDb() {
    const BEAR_DB_PATH = process.env.BEAR_DB_PATH || "";
    const dbPath = path_1.default.join(os_1.default.homedir(), BEAR_DB_PATH);
    const db = new sqlite3_1.default.Database(dbPath, (err) => {
        if (err) {
            console.log('Error:', err.message);
        }
        else {
            console.log('Connected to the bearblog database.');
        }
    });
    return db;
}
exports.connectToBearDb = connectToBearDb;
function connectToLocalDb() {
    const LOCAL_DB_DIR = process.env.LOCAL_DB_DIR || '';
    const LOCAL_DB = process.env.LOCAL_DB || '';
    const localDbPath = path_1.default.join(__dirname, '..', LOCAL_DB_DIR, LOCAL_DB);
    const localDb = new sqlite3_1.default.Database(localDbPath, (err) => {
        if (err) {
            return console.log('Error:', err.message);
        }
        console.log('Connected to the bearblog database.');
    });
    return localDb;
}
exports.connectToLocalDb = connectToLocalDb;
function saveToLocalDatabase(localDb, rows) {
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
}
exports.saveToLocalDatabase = saveToLocalDatabase;
const getBloggingTagId = (bearDb) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        bearDb.get(`SELECT Z_PK FROM ZSFNOTETAG WHERE ZTITLE = ?`, ['blog-from-bear'], (err, row) => {
            var _a;
            if (err) {
                console.log('Error:', err.message);
                reject(err);
            }
            else {
                const zPkValue = (_a = row === null || row === void 0 ? void 0 : row.Z_PK) !== null && _a !== void 0 ? _a : null;
                resolve(zPkValue);
            }
        });
    });
});
const getTaggedNoteIds = (bearDb, zPkValue) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        bearDb.all(`SELECT Z_5NOTES FROM Z_5TAGS WHERE Z_13TAGS = ?`, [zPkValue], (err, rows) => {
            if (err) {
                console.log('Error:', err.message);
                reject(err);
            }
            else {
                const z13TagsValues = rows.map(r => r.Z_5NOTES);
                resolve(z13TagsValues);
            }
        });
    });
});
const fetchTaggedNotes = (bearDb, z13TagsValues) => __awaiter(void 0, void 0, void 0, function* () {
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
            }
            else {
                resolve(rows);
            }
        });
    });
});
// Main function that executes all steps
function fetchBearData(bearDb) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const bloggingTagId = yield getBloggingTagId(bearDb);
            const taggedNoteIds = yield getTaggedNoteIds(bearDb, bloggingTagId);
            const taggedNotes = yield fetchTaggedNotes(bearDb, taggedNoteIds);
            return taggedNotes;
        }
        catch (err) {
            console.log('An error occurred:', err);
        }
        finally {
            bearDb.close(err => {
                if (err) {
                    console.log('Error:', err.message);
                }
                console.log('Database connection closed.');
            });
        }
    });
}
exports.fetchBearData = fetchBearData;
