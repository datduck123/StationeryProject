package fpt.edu.vn.stationery.controller;

import fpt.edu.vn.stationery.config.SecurityConfig;
import fpt.edu.vn.stationery.dto.request.CreateReviewRequestDTO;
import fpt.edu.vn.stationery.dto.response.PageDTO;
import fpt.edu.vn.stationery.dto.response.ProductReviewSummaryDTO;
import fpt.edu.vn.stationery.dto.response.ReviewResponseDTO;
import fpt.edu.vn.stationery.exception.DuplicateResourceException;
import fpt.edu.vn.stationery.filter.JwtAuthenticationFilter;
import fpt.edu.vn.stationery.security.CustomUserDetailsService;
import fpt.edu.vn.stationery.security.JwtTokenProvider;
import fpt.edu.vn.stationery.service.ReviewService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({ReviewController.class, ReviewPublicController.class, AdminReviewController.class})
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class ReviewApiSecurityTest {
    @Autowired MockMvc mvc;
    @MockBean ReviewService reviewService;
    @MockBean JwtTokenProvider jwtTokenProvider;
    @MockBean CustomUserDetailsService customUserDetailsService;

    private static final String REVIEW = """
            {"orderItemId":20,"rating":5,"comment":"A useful notebook"}
            """;

    @Test
    void publicReviewsDoNotRequireLogin() throws Exception {
        when(reviewService.getProductReviews(30L, 0, 10, "desc")).thenReturn(
                ProductReviewSummaryDTO.builder()
                        .reviews(PageDTO.from(new PageImpl<ReviewResponseDTO>(List.of())))
                        .averageRating(0).reviewCount(0).ratingDistribution(Map.of()).build());

        mvc.perform(get("/api/products/30/reviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reviewCount").value(0))
                .andExpect(jsonPath("$.reviews.content").isArray());
    }

    @Test
    void anonymousCustomerCannotSubmitOrDelete() throws Exception {
        mvc.perform(post("/api/reviews").contentType(MediaType.APPLICATION_JSON).content(REVIEW))
                .andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/admin/reviews/1")).andExpect(status().isUnauthorized());
        verifyNoInteractions(reviewService);
    }

    @Test
    @WithMockUser(username = "buyer@example.com", roles = "CUSTOMER")
    void createUsesAuthenticatedIdentity() throws Exception {
        when(reviewService.createReview(eq("buyer@example.com"), any(CreateReviewRequestDTO.class)))
                .thenReturn(ReviewResponseDTO.builder().reviewId(1L).orderItemId(20L).rating(5).build());
        mvc.perform(post("/api/reviews").contentType(MediaType.APPLICATION_JSON).content(REVIEW))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.reviewId").value(1));
        verify(reviewService).createReview(eq("buyer@example.com"), any(CreateReviewRequestDTO.class));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void invalidRatingNeverReachesService() throws Exception {
        mvc.perform(post("/api/reviews").contentType(MediaType.APPLICATION_JSON)
                        .content(REVIEW.replace("\"rating\":5", "\"rating\":0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.rating").exists());
        verifyNoInteractions(reviewService);
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void duplicateSubmissionReturnsConflict() throws Exception {
        when(reviewService.createReview(any(), any()))
                .thenThrow(new DuplicateResourceException("This order item has already been reviewed"));
        mvc.perform(post("/api/reviews").contentType(MediaType.APPLICATION_JSON).content(REVIEW))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerCannotDeleteReviews() throws Exception {
        mvc.perform(delete("/api/admin/reviews/1")).andExpect(status().isForbidden());
        verifyNoInteractions(reviewService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanModerateReview() throws Exception {
        mvc.perform(delete("/api/admin/reviews/1")).andExpect(status().isNoContent());
        verify(reviewService).deleteReview(1L);
    }
}
