import * as fs from 'fs';
import * as path from 'path';
import { createBlogContent, createBlogPostFiles } from './postHelpers';
import { saveToLocalDatabase, fetchBearData } from './dbHelpers';
import { connectToBearDb, connectToLocalDb, getNoteContent } from './dbHelpers';


console.log("Running...")

const bearDb = connectToBearDb();
const localDb = connectToLocalDb();

async function main() {

  const taggedNotes = await fetchBearData(bearDb);

  if (taggedNotes) {
    console.log(taggedNotes.length)
    saveToLocalDatabase(localDb, taggedNotes);
  }
  
  const notes = await getNoteContent(localDb);

  const posts = createBlogContent(notes);

  console.log(posts)

  createBlogPostFiles(posts);

}

main().catch((error) => {
  console.error(`An error occurred: ${error}`);
});

