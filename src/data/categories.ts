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

const normalizeCategoryName = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Groups products under database categories in API display order, skipping empty shelves. */
function groupProductsByCategory(items: Product[], dbCategories?: MainCategory[]): CategoryShelf[] {
  const byCategory = new Map<string, Product[]>();

  for (const product of items) {
    if (!product.category) continue;
    const shelf = byCategory.get(product.category) ?? [];
    shelf.push(product);
    byCategory.set(product.category, shelf);
  }

  if (!dbCategories?.length) return [];

  return dbCategories
    .map((category) => {
      const products =
        byCategory.get(category.categoryName) ??
        byCategory.get(
          Array.from(byCategory.keys()).find(
            (name) => normalizeCategoryName(name) === normalizeCategoryName(category.categoryName),
          ) ?? "",
        ) ?? [];

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
export { groupProductsByCategory };
