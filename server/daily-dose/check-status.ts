import { db } from "../db";

const doseId = "bef85fe1-8782-423f-877f-22e3d4614395";
const sessionId = "e500f064-5a73-4a76-98c1-777dad01822a";

const dose = await db.orm.public.DailyDose
  .where({ id: doseId })
  .first();

const session = await db.orm.public.RecallSession
  .where({ id: sessionId })
  .first();

console.log(JSON.stringify({ dose, session }, null, 2));
