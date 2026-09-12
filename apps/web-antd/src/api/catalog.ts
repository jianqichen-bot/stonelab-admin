import { requestClient } from '#/api/request';

export type RecordStatus = 'DISABLED' | 'ENABLED';
export type BeadShape = 'CHARM' | 'CHIP' | 'CUBE' | 'ROUND';

export interface Category {
  id: number;
  name: string;
  parentId: null | number;
  sort: number;
  status: RecordStatus;
}

export interface Variant {
  diameterMm: null | string;
  id: number;
  status: RecordStatus;
  stock: number;
  unitPriceCents: number;
}

export interface Product {
  category: Category;
  categoryId: number;
  id: number;
  imageKey: null | string;
  imageUrl: null | string;
  name: string;
  shape: BeadShape;
  sort: number;
  status: RecordStatus;
  variants: Variant[];
}

export interface ProductList {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ImageAsset {
  key: string;
  name: string;
  size: number;
  updatedAt: string;
  url: string;
}

export interface CategoryInput {
  name: string;
  parentId?: number;
  sort?: number;
  status?: RecordStatus;
}

export interface ProductInput {
  categoryId: number;
  imageKey?: null | string;
  name: string;
  shape?: BeadShape;
  sort?: number;
  status?: RecordStatus;
}

export interface VariantInput {
  diameterMm: number;
  status?: RecordStatus;
  stock?: number;
  unitPriceCents: number;
}

export function listCategoriesApi() {
  return requestClient.get<Category[]>('/admin/catalog/categories');
}

export function createCategoryApi(data: CategoryInput) {
  return requestClient.post<Category>('/admin/catalog/categories', data);
}

export function updateCategoryApi(id: number, data: Partial<CategoryInput>) {
  return requestClient.request<Category>(`/admin/catalog/categories/${id}`, {
    data,
    method: 'PATCH',
  });
}

export function deleteCategoryApi(id: number) {
  return requestClient.delete<boolean>(`/admin/catalog/categories/${id}`);
}

export function listProductsApi(params: {
  categoryId?: number;
  keyword?: string;
  page: number;
  pageSize: number;
  status?: RecordStatus;
}) {
  return requestClient.get<ProductList>('/admin/catalog/products', { params });
}

export function getProductApi(id: number) {
  return requestClient.get<Product>(`/admin/catalog/products/${id}`);
}

export function createProductApi(data: ProductInput) {
  return requestClient.post<Product>('/admin/catalog/products', data);
}

export function updateProductApi(id: number, data: Partial<ProductInput>) {
  return requestClient.request<Product>(`/admin/catalog/products/${id}`, {
    data,
    method: 'PATCH',
  });
}

export function deleteProductApi(id: number) {
  return requestClient.delete<boolean>(`/admin/catalog/products/${id}`);
}

export function listImageAssetsApi() {
  return requestClient.get<ImageAsset[]>('/admin/catalog/assets');
}

export function uploadImageAssetApi(file: File) {
  return requestClient.upload<ImageAsset>('/admin/catalog/assets', { file });
}

export function createVariantApi(productId: number, data: VariantInput) {
  return requestClient.post<Variant>(
    `/admin/catalog/products/${productId}/variants`,
    data,
  );
}

export function updateVariantApi(
  id: number,
  data: Partial<Omit<VariantInput, 'stock'>>,
) {
  return requestClient.request<Variant>(`/admin/catalog/variants/${id}`, {
    data,
    method: 'PATCH',
  });
}

export function deleteVariantApi(id: number) {
  return requestClient.delete<boolean>(`/admin/catalog/variants/${id}`);
}

export function adjustInventoryApi(
  id: number,
  data: {
    change: number;
    remark?: string;
    type: 'ADJUSTMENT' | 'PURCHASE' | 'RETURN' | 'SALE';
  },
) {
  return requestClient.post<Variant>(
    `/admin/catalog/variants/${id}/inventory`,
    data,
  );
}
