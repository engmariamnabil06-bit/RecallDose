import { Temporal } from "@js-temporal/polyfill";

globalThis.Temporal = Temporal;

import dotenv from "dotenv";
import postgres from "@prisma/orm-postgres/runtime";
import contractJson from "../src/prisma/contract.json" with { type: "json" };

dotenv.config();

export const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL!,
});