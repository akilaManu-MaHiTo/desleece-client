import axios from "axios";
// import { z } from "zod";

export type MainCategory = {
  _id: string;
  categoryName: string;
  note?: string;
};

export async function getMainCategory(): Promise<MainCategory[]> {
  const res = await axios.get(`/api/v1/category`);
  return res.data;
}
