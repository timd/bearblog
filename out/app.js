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
    });
}
main().catch((error) => {
    console.error(`An error occurred: ${error}`);
});
