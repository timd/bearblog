import dotenv from 'dotenv';
import { gitAdd, gitCommit, gitPush } from './gitHelper';
import { saveToLocalDatabase, fetchBearData } from './dbHelpers';
import { connectToBearDb, connectToLocalDb, getNoteContent } from './dbHelpers';
import { createBlogContent, createBlogPostFiles, gitTimestamp } from './postHelpers';

dotenv.config();

console.log("Running...")

const bearDb = connectToBearDb();
const localDb = connectToLocalDb();

async function main() {

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

  await gitAdd(directory);
  await gitCommit(message, directory);
  await gitPush(branch, directory);

}

main().catch((error) => {
  console.error(`An error occurred: ${error}`);
});

