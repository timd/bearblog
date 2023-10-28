import { connectToBearDb, connectToLocalDb } from './dbHelpers';
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

  


}

main().catch((error) => {
  console.error(`An error occurred: ${error}`);
});