import dotenv from 'dotenv';
import { saveToLocalDatabase, fetchBearData } from './dbHelpers';
import { gitAdd, gitCommit, gitPush, performGitOperations } from './gitHelper';
import { connectToBearDb, connectToLocalDb, getNoteContent } from './dbHelpers';
import { createBlogContent, createBlogPostFiles, gitTimestamp } from './postHelpers';

dotenv.config();

console.log("Running...")

const bearDb = connectToBearDb();
const localDb = connectToLocalDb();

async function main() {

  const taggedNotes = await fetchBearData(bearDb);

  if (taggedNotes) {
    console.log(`taggedNotes.length = ${taggedNotes.length}`)
    await saveToLocalDatabase(localDb, taggedNotes);
  }
  
  const notes = await getNoteContent(localDb);
  console.log(`notes.length = ${notes.length}`)

  const posts = createBlogContent(notes);
  console.log(`posts.length = ${posts.length}`)

  await createBlogPostFiles(posts);

  const directory = process.env.HUGO_REPO_PATH || ''
  const branch = "main"
  const message = `autocommit from bearblog.app at ${gitTimestamp()}`

  //await gitAdd(directory);

  //await gitCommit(message, directory);

  //await gitPush(branch, directory);

}

main().catch((error) => {
  console.error(`An error occurred: ${error}`);
});

