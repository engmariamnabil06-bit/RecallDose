import bcrypt from "bcryptjs";
import { db } from "./server/db";

async function resetTestPassword() {
  const email = "test@recalldose.com";
  const password = "Test1234!";

  const user = await db.orm.public.User
    .where({ email })
    .first();

  if (!user) {
    console.log("USER NOT FOUND");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.orm.public.User
    .where({ id: user.id })
    .update({
      passwordHash,
    });

  console.log("✅ Test password reset successfully!");
  console.log("Email:", email);
  console.log("Password:", password);
}

resetTestPassword().catch((error) => {
  console.error("❌ Password reset failed:");
  console.error(error);
  process.exit(1);
});