// Builds the full ancestor chain of a category so admins can see exactly
// where an item sits, e.g. Clothing → Men → T-Shirt.

export interface CategoryPathItem {
  id: string;
  name?: string | null;
  name_en?: string | null;
  name_bn?: string | null;
  parent_id?: string | null;
}

// Returns the names from the top-most parent down to the given category.
// e.g. ["Clothing", "Men", "T-Shirt"]. A `guard` set stops any accidental
// parent loop from hanging the walk.
export function getCategoryPath<T extends CategoryPathItem>(
  categories: T[],
  id: string | null | undefined,
): string[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const names: string[] = [];
  const guard = new Set<string>();
  let current = id ? byId.get(id) : undefined;
  while (current && !guard.has(current.id)) {
    guard.add(current.id);
    names.unshift(current.name || current.name_en || current.name_bn || "");
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }
  return names;
}

// Same as getCategoryPath but joined into a single readable string.
export function formatCategoryPath<T extends CategoryPathItem>(
  categories: T[],
  id: string | null | undefined,
  separator = " → ",
): string {
  return getCategoryPath(categories, id).join(separator);
}

// Bangla label for how deep a category sits (0 = main, 1 = sub, 2+ = sub-sub).
export function categoryLevelLabel(depth: number): string {
  if (depth <= 0) return "মেইন";
  if (depth === 1) return "সাব";
  return "সাব-সাব";
}
