import os from 'os';
import * as fs from 'fs';
import dotenv from 'dotenv';
import * as path from 'path';
import { gitAdd, gitCommit, gitPush } from './gitHelper';
import { saveToLocalDatabase, fetchBearData } from './dbHelpers';
import { connectToBearDb, connectToLocalDb, getNoteContent } from './dbHelpers';
import { createBlogContent, createBlogPostFiles, gitTimestamp } from './postHelpers';

dotenv.config();

console.log("Running...")

const bearDb = connectToBearDb();
const localDb = connectToLocalDb();

const dbPath = process.env.BEAR_DB_PATH || '';

const main = () => {
  setInterval(() => {
    checkModified(dbPath);
  }, 60000);
};

async function triggerFunction() {

  const taggedNotes = await fetchBearData(bearDb);

  if (taggedNotes) {
    await saveToLocalDatabase(localDb, taggedNotes);
  }
  
  const notes = await getNoteContent(localDb);
  
  const posts = createBlogContent(notes);
  
  await createBlogPostFiles(posts);

  const directory = process.env.HUGO_REPO_PATH || ''
  const branch = "main"
  const message = `autocommit from bearblog.app at ${gitTimestamp()}`

  // await gitAdd(directory);
  // await gitCommit(message, directory);
  // await gitPush(branch, directory);

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

