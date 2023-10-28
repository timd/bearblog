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
Object.defineProperty(exports, "__esModule", { value: true });
const dbHelpers_1 = require("./dbHelpers");
const dbHelpers_2 = require("./dbHelpers");
console.log("Running...");
const bearDb = (0, dbHelpers_1.connectToBearDb)();
const localDb = (0, dbHelpers_1.connectToLocalDb)();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const taggedNotes = yield (0, dbHelpers_2.fetchBearData)(bearDb);
        if (taggedNotes) {
            console.log(taggedNotes.length);
            (0, dbHelpers_2.saveToLocalDatabase)(localDb, taggedNotes);
        }
        createBlogContent();
    });
}
main().catch((error) => {
    console.error(`An error occurred: ${error}`);
});
function createBlogContent() {
    return __awaiter(this, void 0, void 0, function* () {
        // select all notes awaiting posting
        const notes = yield (0, dbHelpers_1.getNoteContent)(localDb);
        const posts = Array();
        // iterate across notes and create post content
        notes.forEach(note => {
            const post = `
      +++
      title = ${note.ZTITLE}
      date = ${createDate()}
      draft = false
      +++
      ${note.ZTEXT}
    `;
            posts.push(post);
        });
        console.log(posts);
    });
}
function createDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const offsetHours = '+02:00'; // replace this with your desired time zone offset
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetHours}`;
}
