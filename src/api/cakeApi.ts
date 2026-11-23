import axios from "axios";

export type Cake = {
  _id: string;
  name: string;
  description: string;
  price: number;
  tag?: string;
  category: string;
  image: string;
  oneKilo?: number;
  oneAndHalfKilo?: number;
  twoKilo?: number;
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

  const optionalPrice = (value: unknown) => {
    if (typeof value !== "number" && typeof value !== "string") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  return {
    _id: cake._id || "",
    name: cake.name,
    description: cake.description,
    price,
    tag: typeof cake.tag === "string" ? cake.tag : "",
    category: cake.category,
    image: cake.image,
    oneKilo: optionalPrice((cake as Record<string, unknown>).oneKilo),
    oneAndHalfKilo: optionalPrice(
      (cake as Record<string, unknown>).oneAndHalfKilo,
    ),
    twoKilo: optionalPrice((cake as Record<string, unknown>).twoKilo),
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
