import type { Category } from "../types/category";
import { apiRequest } from "./api";

type CategoriesResponse = {
    categories: Category[];
};

export async function getCategories(
    token: string,
    signal?: AbortSignal
): Promise<Category[]> {
    const response = await apiRequest<CategoriesResponse>(
        "/categories",
        { token, signal }
    );

    return response.categories;
}