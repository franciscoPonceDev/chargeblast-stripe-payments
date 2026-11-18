import "server-only";
import data from "@/data/payments.json";
import type { Payment } from "./types";

export const ALL_PAYMENTS = data as Payment[];
