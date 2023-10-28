"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToLocalDb = exports.connectToBearDb = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const sqlite3_1 = __importDefault(require("sqlite3"));
function connectToBearDb() {
    const dbPath = path_1.default.join(os_1.default.homedir(), 'Library/Group Containers/9K33E3U3T4.net.shinyfrog.bear/Application Data/database.sqlite');
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
    const localDbPath = path_1.default.join(__dirname, '..', 'db', 'bearblog.db');
    const localDb = new sqlite3_1.default.Database(localDbPath, (err) => {
        if (err) {
            return console.log('Error:', err.message);
        }
        console.log('Connected to the bearblog database.');
    });
    return localDb;
}
exports.connectToLocalDb = connectToLocalDb;
