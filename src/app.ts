import { connectToBearDb, connectToLocalDb, getNoteContent } from './dbHelpers';
import { saveToLocalDatabase, fetchBearData } from './dbHelpers';

console.log("Running...")

const bearDb = connectToBearDb();
const localDb = connectToLocalDb();

async function main() {

  const taggedNotes = await fetchBearData(bearDb);

  if (taggedNotes) {
    console.log(taggedNotes.length)
    saveToLocalDatabase(localDb, taggedNotes);
  }

  createBlogContent()

}

main().catch((error) => {
  console.error(`An error occurred: ${error}`);
});

async function createBlogContent() {
  
  // select all notes awaiting posting
  const notes = await getNoteContent(localDb);

  const posts = Array<String>()

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

    posts.push(post)

  })

  console.log(posts)

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