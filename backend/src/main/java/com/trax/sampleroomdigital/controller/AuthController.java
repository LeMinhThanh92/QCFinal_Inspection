package com.trax.sampleroomdigital.controller;

import com.trax.sampleroomdigital.dto.ApiResponse;
import com.trax.sampleroomdigital.dto.LoginRequest;
import com.trax.sampleroomdigital.dto.LoginResponse;
import com.trax.sampleroomdigital.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Login & Logout endpoints")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Login", description = "Authenticate with username & password, returns JWT token")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful",
                    content = @Content(schema = @Schema(implementation = LoginResponse.class))),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        try {
            // Get client IP and User-Agent
            String clientIp = getClientIp(httpRequest);
            String device = httpRequest.getHeader("User-Agent");
            if (device == null) device = "unknown";

            log.info("Login request from IP: {} for user: {}", clientIp, request.getUsername());

            // Authenticate
            LoginResponse loginResponse = authService.login(request, clientIp, device);

            return ResponseEntity.ok(ApiResponse.success(loginResponse));

        } catch (RuntimeException e) {
            log.warn("Login failed: {}", e.getMessage());
            return ResponseEntity
                    .badRequest()
                    .body(ApiResponse.error(401, e.getMessage()));
        }
    }

    @Operation(summary = "Validate Session", description = "Check if the current token is still the active session. Returns 200 if valid, 401 if superseded by another login.")
    @GetMapping("/validate-session")
    public ResponseEntity<ApiResponse<String>> validateSession() {
        return ResponseEntity.ok(ApiResponse.success("valid"));
    }

    @Operation(summary = "Logout", description = "Invalidates the current token on server")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest httpRequest) {
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            authService.logout(authHeader.substring(7));
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out"));
    }

    @Operation(summary = "Refresh Token", description = "Generate new JWT from existing valid token (extends session)")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(HttpServletRequest httpRequest) {
        try {
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body(ApiResponse.error(401, "Missing token"));
            }
            String oldToken = authHeader.substring(7);
            String clientIp = getClientIp(httpRequest);
            String device = httpRequest.getHeader("User-Agent");

            LoginResponse response = authService.refreshToken(oldToken, clientIp, device != null ? device : "unknown");
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(401, e.getMessage()));
        }
    }

    /**
     * Extract real client IP (handles proxies & load balancers)
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
