import api, { API_BASE_URL } from "./api";

/**
 * Fetch paginated, filtered, sorted product list.
 * @param {Object} params
 * @param {number}  params.page       - 0-based page index
 * @param {number}  params.size       - items per page (default 9)
 * @param {string}  params.keyword    - product name search
 * @param {number}  params.categoryId - filter by category
 * @param {number}  params.brandId    - filter by brand
 * @param {string}  params.sort       - e.g. "price,asc" | "price,desc"
 * @returns {Promise<import("axios").AxiosResponse>}
 */
export const getProducts = (params = {}) => {
  const query = {};
  if (params.page !== undefined) query.page = params.page;
  if (params.size !== undefined) query.size = params.size;
  if (params.keyword) query.keyword = params.keyword;
  if (params.categoryId) query.categoryId = params.categoryId;
  if (params.brandId) query.brandId = params.brandId;
  if (params.minPrice !== undefined && params.minPrice !== null && params.minPrice !== "") query.minPrice = params.minPrice;
  if (params.maxPrice !== undefined && params.maxPrice !== null && params.maxPrice !== "") query.maxPrice = params.maxPrice;
  if (params.sort) query.sort = params.sort;

  return api.get("/products", { params: query });
};

/**
 * Fetch a single product by ID.
 * @param {number|string} id
 */
export const getProductById = (id) => api.get(`/products/${id}`);

/**
 * Fetch top featured products ordered by average review rating.
 * @param {number} limit - max number of products (default 8)
 */
export const getFeaturedProducts = (limit = 8) =>
  api.get("/products/featured", { params: { limit } });

/**
 * Fetch best-selling products ordered by sold count descending.
 * @param {number} limit - max number of products (default 8)
 */
export const getBestSellerProducts = (limit = 8) =>
  api.get("/products/bestseller", { params: { limit } });

/**
 * Fetch all public categories.
 */
export const getCategories = () => api.get("/categories");

/**
 * Fetch all public brands.
 */
export const getBrands = () => api.get("/brands");

// ==========================================
// Admin Product APIs (/api/admin/products)
// ==========================================

/**
 * Admin: Fetch paginated, filtered product list (includes INACTIVE).
 */
export const adminGetProducts = (params = {}) => {
  const query = {};
  if (params.page !== undefined) query.page = params.page;
  if (params.size !== undefined) query.size = params.size;
  if (params.keyword) query.keyword = params.keyword;
  if (params.categoryId) query.categoryId = params.categoryId;
  if (params.brandId) query.brandId = params.brandId;
  if (params.status && params.status !== "ALL") query.status = params.status;
  if (params.sort) query.sort = params.sort;

  return api.get("/admin/products", { params: query });
};

/**
 * Admin: Fetch product by ID (including inactive).
 * @param {number|string} id
 */
export const adminGetProductById = (id) => api.get(`/admin/products/${id}`);

/**
 * Admin: Create a new product.
 * @param {Object} data - ProductRequestDTO
 */
export const adminCreateProduct = (data) => api.post("/admin/products", data);

/**
 * Admin: Update an existing product.
 * @param {number|string} id
 * @param {Object} data - ProductRequestDTO
 */
export const adminUpdateProduct = (id, data) => api.put(`/admin/products/${id}`, data);

/**
 * Admin: Delete a product.
 * @param {number|string} id
 */
export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`);

/**
 * Admin: Quick update product stock quantity.
 * @param {number|string} id
 * @param {number} stockQuantity
 */
export const adminUpdateStock = (id, stockQuantity) =>
  api.patch(`/admin/products/${id}/stock`, { stockQuantity });

/**
 * Upload an image file to server.
 * @param {File} file
 * @returns {Promise<import("axios").AxiosResponse<{url: string, fileName: string}>>}
 */
export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ==========================================
// Admin Category APIs (/api/admin/categories)
// ==========================================
export const adminGetCategories = () => api.get("/admin/categories");
export const adminCreateCategory = (data) => api.post("/admin/categories", data);
export const adminUpdateCategory = (id, data) => api.put(`/admin/categories/${id}`, data);
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`);

// ==========================================
// Admin Brand APIs (/api/admin/brands)
// ==========================================
export const adminGetBrands = () => api.get("/admin/brands");
export const adminCreateBrand = (data) => api.post("/admin/brands", data);
export const adminUpdateBrand = (id, data) => api.put(`/admin/brands/${id}`, data);
export const adminDeleteBrand = (id) => api.delete(`/admin/brands/${id}`);

/**
 * Standardize and resolve image URL for a product so name and image match 100%.
 * @param {Object} product
 * @returns {string}
 */
export const getProductImage = (product) => {
  if (product?.imageUrl && !product.imageUrl.includes("example.com")) {
    if (product.imageUrl.startsWith("/uploads/")) {
      return new URL(product.imageUrl, API_BASE_URL).href;
    }
    return product.imageUrl;
  }
  const idMap = {
    1: "/assets/media/products/product-7.png",  // Thien Long Pen -> Wooden pen stand with pen
    2: "/assets/media/products/product-10.png", // Pentel Gel Pen -> Metallic pens set
    3: "/assets/media/products/product-11.png", // Maruman Notebook -> A5 notebooks stack
    4: "/assets/media/products/product-9.png",  // Deli Notes / Clipboard -> Document clipboard & notes
    5: "/assets/media/products/product-4.png",  // Stabilo Highlighter -> Highlighters case
    6: "/assets/media/products/product-6.png",  // Deli Puncher / Office Tool -> Blue desktop puncher
    7: "/assets/media/products/product-1.png",  // Desk bookshelf
    8: "/assets/media/products/product-8.png",  // Calculator
    9: "/assets/media/products/product-3.png",  // Backpack
    10: "/assets/media/products/product-5.png", // Colored pencil box
    11: "/assets/media/products/product-2.png", // Desk stationery set
    12: "/assets/media/products/product-12.png", // Pencil pouch with scissors
  };
  if (product?.id && idMap[product.id]) {
    return idMap[product.id];
  }
  const name = (product?.name || "").toLowerCase();
  if (name.includes("scissor") || name.includes("kéo")) return "/assets/media/products/product-12.png";
  if (name.includes("puncher") || name.includes("dập lỗ") || name.includes("bấm lỗ")) return "/assets/media/products/product-6.png";
  if (name.includes("calculator") || name.includes("máy tính")) return "/assets/media/products/product-8.png";
  if (name.includes("backpack") || name.includes("balo")) return "/assets/media/products/product-3.png";
  if (name.includes("notebook") || name.includes("sổ")) return "/assets/media/products/product-11.png";
  if (name.includes("notes") || name.includes("clipboard") || name.includes("giấy")) return "/assets/media/products/product-9.png";
  if (name.includes("highlighter") || name.includes("dạ quang")) return "/assets/media/products/product-4.png";
  if (name.includes("color") || name.includes("màu")) return "/assets/media/products/product-5.png";
  if (name.includes("pentel") || name.includes("gel")) return "/assets/media/products/product-10.png";
  if (name.includes("pen") || name.includes("bút")) return "/assets/media/products/product-7.png";
  return "/assets/media/products/product-1.png";
};

