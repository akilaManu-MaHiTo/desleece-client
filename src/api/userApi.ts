import axios from 'axios';
import { z } from "zod";

export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  username: z.string(),
  role: z.string(),
});

export type User = z.infer<typeof userSchema>;

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const res = await axios.post("/api/login", {
    email,
    password,
  });
  return res.data;
}

export async function validateUser() {
  const res = await axios.get("/api/me");
  return res.data;
}