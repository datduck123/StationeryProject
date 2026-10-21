package fpt.edu.vn.stationery.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private final String validSecret = "9a4f2c8d3b7a1e6f4c8d2e9a7b1c3d5e7f9a2b4c6d8e0f1a3b5c7d9e1f3a5b7c";

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
    }

    @Test
    @DisplayName("validateSecret should throw IllegalStateException when jwtSecret is null or blank")
    void testValidateSecret_MissingSecret() {
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", null);
        assertThrows(IllegalStateException.class, () -> jwtTokenProvider.validateSecret());

        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "   ");
        assertThrows(IllegalStateException.class, () -> jwtTokenProvider.validateSecret());
    }

    @Test
    @DisplayName("validateSecret should throw IllegalStateException when jwtSecret is shorter than 32 bytes")
    void testValidateSecret_ShortSecret() {
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "too-short-secret");
        assertThrows(IllegalStateException.class, () -> jwtTokenProvider.validateSecret());
    }

    @Test
    @DisplayName("validateSecret should succeed when jwtSecret has at least 32 bytes")
    void testValidateSecret_ValidSecret() {
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", validSecret);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", 86400000L);
        assertDoesNotThrow(() -> jwtTokenProvider.validateSecret());
    }

    @Test
    @DisplayName("generateToken and validateToken should work properly with valid secret")
    void testGenerateAndValidateToken() {
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", validSecret);
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpiration", 86400000L);

        String token = jwtTokenProvider.generateToken("user@example.com", 1L, "ROLE_CUSTOMER");
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("user@example.com", jwtTokenProvider.getEmailFromToken(token));
        assertEquals("ROLE_CUSTOMER", jwtTokenProvider.getRoleFromToken(token));
    }
}

