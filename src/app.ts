import os from 'os';
import * as fs from 'fs';
import dotenv from 'dotenv';
import * as path from 'path';
import { gitAdd, gitCommit, gitPush } from './gitHelper';
import { createBlogContent, createBlogPostFiles, gitTimestamp } from './postHelpers';
import { saveToLocalDatabase, fetchBearData, lastUpdateTimestamp, cleanLocalDatabase } from './dbHelpers';
import { connectToBearDb, connectToLocalDb, getNoteContent, updateLastUpdateTimestamp } from './dbHelpers';


dotenv.config();

console.log("Running...")

const bearDb = connectToBearDb();
const localDb = connectToLocalDb();

const dbPath = process.env.BEAR_DB_PATH || '';

const main = () => {
  triggerFunction()
  // setInterval(() => {
  //   checkModified(dbPath);
  // }, 60000);
};

async function triggerFunction() {

  // Get tagged notes from Bear DB
  const taggedNotes = await fetchBearData(bearDb, localDb);
  console.log(`${taggedNotes?.length} tagged notes found`)

  // Push tagged notes into local database
  if (taggedNotes) {
    await saveToLocalDatabase(localDb, taggedNotes);
  }
  
  // Create the content for notes
  const notes = await getNoteContent(localDb);
  
  // Create post files from note content
  const posts = createBlogContent(notes);
  
  await createBlogPostFiles(posts);
  console.log(`${posts.length} posts created`)

  const directory = process.env.HUGO_REPO_PATH || ''
  const branch = "main"
  const message = `autocommit from bearblog.app at ${gitTimestamp()}`

  // await gitAdd(directory);
  // await gitCommit(message, directory);
  // await gitPush(branch, directory);

  const timestamp = lastUpdateTimestamp();
  const tsUpdate = await updateLastUpdateTimestamp(localDb, timestamp);

  // Delete notes from local DB so they don't get recreated
  await cleanLocalDatabase(localDb);

}

main();

let lastModified: Date | null = null;

async function checkModified(filePath: string) {
  
  try {
    const stats = fs.statSync(filePath);
    const currentModified = stats.mtime;

    if (!lastModified) {
      lastModified = currentModified;
      return;
    }

    if ((lastModified as Date).getTime() !== currentModified.getTime()) {
      console.log(`File ${filePath} has changed. Performing action.`);
      lastModified = currentModified;
      console.log("trigger")
      await triggerFunction()
    } else {
      console.log("File timestamp is unchanged.");
    }
  } catch (err) {
    console.error(`Error while checking file: ${(err as Error).message}`);
  }
};

