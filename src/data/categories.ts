import type { Product } from "../components/ProductCard";
import type { MainCategory } from "../api/categoryApi";

type CakeCategory = {
  /** URL-safe id, used for the shelf anchor (`#shelf-<id>`). */
  id: string;
  /** Must match `Product.category` exactly. */
  name: string;
  /** Shelf heading, written as `title` + italic `highlight`. */
  title: string;
  highlight: string;
  note: string;
};

type CategoryShelf = CakeCategory & { products: Product[] };

/** Display order of the shelves on the shop page. */
const cakeCategories: CakeCategory[] = [
  {
    id: "wedding-cakes",
    name: "Wedding Cakes",
    title: "For the",
    highlight: "unforgettable moments.",
    note: "Birthdays, anniversaries, the promotion you quietly hoped for. These are cakes that bring everyone to the table.",
  },
  {
    id: "birthday-cakes",
    name: "Birthday Cakes",
    title: "For the",
    highlight: "big days.",
    note: "Birthdays, anniversaries, the promotion you quietly hoped for. These are cakes that bring everyone to the table.",
  },
  {
    id: "party-cakes",
    name: "Party Cakes",
    title: "For the",
    highlight: "chocolate people.",
    note: "Deep, dark and unapologetically rich. Best shared, but we won't tell if you don't.",
  },
  {
    id: "cake-jars",
    name: "Cake Jars",
    title: "Bright, light &",
    highlight: "a little zesty.",
    note: "Seasonal fruit and soft creams for afternoons that need a lift.",
  },
];

const normalizeCategoryName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function getLegacyCategoryName(dbCategoryName: string): string | undefined {
  const name = normalizeCategoryName(dbCategoryName);

  if (name.includes("wedding") || name.includes("birthday") || name.includes("celebration")) {
    return "Celebration";
  }
  if (name.includes("chocolate") || name.includes("party")) {
    return "Chocolate";
  }
  if (name.includes("fruit") || name.includes("cake jar")) {
    return "Fresh & fruity";
  }
  return undefined;
}

/** Groups products under database categories in API display order, skipping empty shelves. */
function groupProductsByCategory(items: Product[], dbCategories?: MainCategory[]): CategoryShelf[] {
  const byCategory = new Map<string, Product[]>();

  for (const product of items) {
    if (!product.category) continue;
    const shelf = byCategory.get(product.category) ?? [];
    shelf.push(product);
    byCategory.set(product.category, shelf);
  }

  if (!dbCategories?.length) {
    return cakeCategories
      .map((category) => ({ ...category, products: byCategory.get(category.name) ?? [] }))
      .filter((shelf) => shelf.products.length > 0);
  }

  return dbCategories
    .map((category) => {
      const exactProducts =
        byCategory.get(category.categoryName) ??
        byCategory.get(
          Array.from(byCategory.keys()).find(
            (name) => normalizeCategoryName(name) === normalizeCategoryName(category.categoryName),
          ) ?? "",
        ) ??
        [];
      const legacyName = getLegacyCategoryName(category.categoryName);
      const products = exactProducts.length
        ? exactProducts
        : legacyName
          ? byCategory.get(legacyName) ?? []
          : [];

      return {
        id: category._id || normalizeCategoryName(category.categoryName).replace(/\s+/g, "-"),
        name: category.categoryName,
        title: "For the",
        highlight: category.categoryName.toLowerCase(),
        note: category.note?.trim() || "A little something special for your next celebration.",
        products,
      };
    })
    .filter((shelf) => shelf.products.length > 0);
}

export type { CakeCategory, CategoryShelf };
export { cakeCategories, groupProductsByCategory };
