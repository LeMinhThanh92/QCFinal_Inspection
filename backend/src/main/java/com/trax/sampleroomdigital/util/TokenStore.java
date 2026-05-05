package com.trax.sampleroomdigital.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory token store — enforces single-session per user.
 * Stores the latest token ID (jti) for each username.
 * When a user logs in again, the old token ID is replaced → old token becomes invalid.
 */
@Component
public class TokenStore {

    private static final Logger log = LoggerFactory.getLogger(TokenStore.class);

    /** Map: username → latest token ID (jti) */
    private final ConcurrentHashMap<String, String> activeTokens = new ConcurrentHashMap<>();

    public void registerToken(String username, String tokenId) {
        String oldTokenId = activeTokens.put(username, tokenId);
        if (oldTokenId != null) {
            log.info("User '{}' re-logged in. Old token invalidated: {}", username, oldTokenId.substring(0, 8) + "...");
        }
        log.debug("Registered token for '{}': {}", username, tokenId.substring(0, 8) + "...");
    }

    public boolean isActiveToken(String username, String tokenId) {
        String activeTokenId = activeTokens.get(username);

        if (activeTokenId == null) {
            activeTokens.put(username, tokenId);
            log.debug("Auto-registered token for '{}' (no previous entry)", username);
            return true;
        }

        return tokenId.equals(activeTokenId);
    }

    public void removeToken(String username) {
        activeTokens.remove(username);
        log.info("Token removed for user: {}", username);
    }
}
