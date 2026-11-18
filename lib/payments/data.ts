import "server-only";
import { createHash } from "node:crypto";
import data from "@/data/payments.json";
import type { Payment } from "./types";

export const ALL_PAYMENTS = data as Payment[];
export const DATA_VERSION = createHash("sha256").update(JSON.stringify(ALL_PAYMENTS)).digest("hex").slice(0, 12);
