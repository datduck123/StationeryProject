import api from "./api";

const reviewService = {
  async getProductReviews(productId, params = {}) {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  async getReviewEligibility(productId) {
    const response = await api.get(`/products/${productId}/reviews/eligibility`);
    return response.data;
  },

  async createReview({ orderItemId, rating, comment }) {
    const response = await api.post("/reviews", { orderItemId, rating, comment });
    return response.data;
  },
};

export default reviewService;
