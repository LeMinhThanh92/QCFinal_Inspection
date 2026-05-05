package com.trax.sampleroomdigital.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * JWT utility — generates tokens with unique ID (jti) for single-session enforcement
 */
@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate JWT token with unique jti for single-session enforcement.
     */
    public String generateToken(String username, String fullname, String department,
                                String ip, String device) {

        Map<String, String> accountClaim = new HashMap<>();
        accountClaim.put("username", username);
        accountClaim.put("fullname", fullname);
        accountClaim.put("department", department);

        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        String tokenId = UUID.randomUUID().toString();

        return Jwts.builder()
                .id(tokenId)
                .claim("account", accountClaim)
                .claim("ip", ip)
                .claim("device", device)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Validate a JWT token (signature + expiry only, not session)
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Extract username from JWT token
     */
    @SuppressWarnings("unchecked")
    public String getUsernameFromToken(String token) {
        Map<String, String> account = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("account", Map.class);
        return account != null ? account.get("username") : null;
    }

    /**
     * Extract token ID (jti) from JWT token
     */
    public String getTokenIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getId();
    }
}
