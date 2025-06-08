
import { db } from "./server/db";
import { users } from "./shared/schema";

async function clearUsers() {
  try {
    console.log("Deleting all users from the database...");
    const result = await db.delete(users);
    console.log("All users have been deleted successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error deleting users:", error);
    process.exit(1);
  }
}

clearUsers();
