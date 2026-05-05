package com.trax.sampleroomdigital.service;

import com.trax.sampleroomdigital.dto.LoginRequest;
import com.trax.sampleroomdigital.dto.LoginResponse;
import com.trax.sampleroomdigital.model.Account;
import com.trax.sampleroomdigital.repository.AccountRepository;
import com.trax.sampleroomdigital.util.JwtUtil;
import com.trax.sampleroomdigital.util.TokenStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Authentication service — handles login, refresh, and single-session enforcement
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AccountRepository accountRepository;
    private final JwtUtil jwtUtil;
    private final TokenStore tokenStore;
    private final BCryptPasswordEncoder bCryptEncoder = new BCryptPasswordEncoder();

    public AuthService(AccountRepository accountRepository, JwtUtil jwtUtil, TokenStore tokenStore) {
        this.accountRepository = accountRepository;
        this.jwtUtil = jwtUtil;
        this.tokenStore = tokenStore;
    }

    /**
     * Authenticate user and return LoginResponse with JWT token.
     * Invalidates any previous token for the same user (single-session).
     */
    public LoginResponse login(LoginRequest request, String clientIp, String device) {
        String username = request.getUsername();
        String password = request.getPassword();

        log.info("Login attempt for user: {}", username);

        // 1. Find account
        Account account = accountRepository.findByAccountCode(username)
                .orElseThrow(() -> {
                    log.warn("User not found: {}", username);
                    return new RuntimeException("Tài khoản không tồn tại");
                });

        log.info("Found account: code={}, name={}, dept={}",
                account.getAccountCode(), account.getAccountName(), account.getDepartment());

        // 2. Verify password
        if (!verifyPassword(password, account.getPassword())) {
            log.warn("Invalid password for user: {}", username);
            throw new RuntimeException("Mật khẩu không đúng");
        }

        log.info("Login successful for user: {} ({})", username, account.getAccountName());

        // 3. Generate JWT token (contains unique jti)
        String token = jwtUtil.generateToken(
                account.getAccountCode(),
                account.getAccountName(),
                account.getDepartment(),
                clientIp,
                device
        );

        // 4. Register token in store → invalidates any previous token for this user
        String tokenId = jwtUtil.getTokenIdFromToken(token);
        tokenStore.registerToken(account.getAccountCode(), tokenId);

        // 5. Build response
        LoginResponse response = new LoginResponse();
        response.setId_emp(account.getAccountCode());
        response.setFull_name(account.getAccountName());
        response.setToken(token);
        response.setIp(clientIp);
        response.setDevice(device);

        return response;
    }

    /**
     * Refresh token — generate a new JWT and register in store (invalidates old one).
     */
    public LoginResponse refreshToken(String oldToken, String clientIp, String device) {
        if (!jwtUtil.validateToken(oldToken)) {
            throw new RuntimeException("Token không hợp lệ hoặc đã hết hạn");
        }

        String username = jwtUtil.getUsernameFromToken(oldToken);
        String oldTokenId = jwtUtil.getTokenIdFromToken(oldToken);

        if (!tokenStore.isActiveToken(username, oldTokenId)) {
            throw new RuntimeException("Token đã bị vô hiệu hóa (user đã đăng nhập ở nơi khác)");
        }

        Account account = accountRepository.findByAccountCode(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        String newToken = jwtUtil.generateToken(
                account.getAccountCode(),
                account.getAccountName(),
                account.getDepartment(),
                clientIp,
                device
        );

        String newTokenId = jwtUtil.getTokenIdFromToken(newToken);
        tokenStore.registerToken(username, newTokenId);

        LoginResponse response = new LoginResponse();
        response.setId_emp(account.getAccountCode());
        response.setFull_name(account.getAccountName());
        response.setToken(newToken);
        response.setIp(clientIp);
        response.setDevice(device);

        log.info("Token refreshed for user: {}", username);
        return response;
    }

    /**
     * Logout — remove token from store
     */
    public void logout(String token) {
        if (jwtUtil.validateToken(token)) {
            String username = jwtUtil.getUsernameFromToken(token);
            if (username != null) {
                tokenStore.removeToken(username);
            }
        }
    }

    private boolean verifyPassword(String rawPassword, String storedPassword) {
        if (storedPassword == null || storedPassword.isEmpty()) {
            return false;
        }

        if (storedPassword.startsWith("$2")) {
            try {
                return bCryptEncoder.matches(rawPassword, storedPassword);
            } catch (Exception e) {
                log.warn("BCrypt comparison failed: {}", e.getMessage());
            }
        }

        return rawPassword.equals(storedPassword);
    }
}
