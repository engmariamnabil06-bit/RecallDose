import { Temporal } from "@js-temporal/polyfill";

Object.assign(globalThis, { Temporal });

import dotenv from "dotenv";
import postgres from "@prisma/orm-postgres/runtime";
import type { Contract } from "../src/prisma/contract.d.js";
import contractJson from "../src/prisma/contract.json" with { type: "json" };

dotenv.config();

export const db = postgres<Contract>({
  contractJson,
  url: process.env.DATABASE_URL!,
});