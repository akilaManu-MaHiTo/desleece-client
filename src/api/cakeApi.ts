import axios from "axios";

export type Cake = {
  _id: string;
  name: string;
  description: string;
  price: number;
  tag?: string;
  category: string;
  image: string;
};

type CakePayload = Partial<Cake>;

function unwrapCakeList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.cakes)) return record.cakes;
  if (Array.isArray(record.data)) return record.data;
  if (record.data && typeof record.data === "object") {
    const data = record.data as Record<string, unknown>;
    if (Array.isArray(data.cakes)) return data.cakes;
  }
  return [];
}

function normalizeCake(value: unknown): Cake | null {
  if (!value || typeof value !== "object") return null;

  const cake = value as CakePayload;
  if (
    typeof cake.name !== "string" ||
    typeof cake.description !== "string" ||
    typeof cake.image !== "string" ||
    typeof cake.category !== "string"
  ) {
    return null;
  }

  const price =
    typeof cake.price === "number"
      ? cake.price
      : typeof cake.price === "string"
        ? Number(cake.price)
        : NaN;

  if (!Number.isFinite(price)) return null;

  return {
    _id: cake._id || "",
    name: cake.name,
    description: cake.description,
    price,
    tag: typeof cake.tag === "string" ? cake.tag : "",
    category: cake.category,
    image: cake.image,
  };
}

export async function getCakes(): Promise<Cake[]> {
  const res = await axios.get("/api/v1/cake/");
  return unwrapCakeList(res.data)
    .map(normalizeCake)
    .filter((cake): cake is Cake => cake !== null);
}

export async function getCakesByCategory(category: string): Promise<Cake[]> {
  const res = await axios.get(
    `/api/v1/cake/category/${encodeURIComponent(category.trim())}`,
  );
  return unwrapCakeList(res.data)
    .map(normalizeCake)
    .filter((cake): cake is Cake => cake !== null);
}
