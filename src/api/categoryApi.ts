import axios from "axios";
// import { z } from "zod";

export type MainCategory = {
  _id: string;
  categoryName: string;
  note?: string;
};

export async function getMainCategory(): Promise<MainCategory[]> {
  const res = await axios.get(`/api/v1/category`);
  const payload = res.data;

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.categories)) return payload.categories;
  if (Array.isArray(payload?.mainCategories)) return payload.mainCategories;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.categories)) return payload.data.categories;
  if (Array.isArray(payload?.data?.mainCategories)) return payload.data.mainCategories;

  return [];
}
