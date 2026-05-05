package com.trax.sampleroomdigital.repository;

import com.trax.sampleroomdigital.model.Account;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for querying [DtradeProduction].[ppa].[vwAccount]
 */
@Repository
public class AccountRepository {

    private static final Logger log = LoggerFactory.getLogger(AccountRepository.class);

    private final JdbcTemplate jdbcTemplate;

    public AccountRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Account> accountRowMapper = (rs, rowNum) -> {
        Account account = new Account();
        account.setAccountId(rs.getInt("AccountId"));
        account.setAccountCode(rs.getString("AccountCode"));
        account.setAccountShortCode(rs.getString("AccountShortCode"));
        account.setAccountName(rs.getString("AccountName"));
        account.setDepartment(rs.getString("Department"));

        byte[] pwdBytes = rs.getBytes("Password");
        if (pwdBytes != null) {
            account.setPassword(new String(pwdBytes, java.nio.charset.StandardCharsets.UTF_8));
        }

        return account;
    };

    public Optional<Account> findByAccountCode(String accountCode) {
        try {
            String sql = "SELECT AccountId, AccountCode, AccountShortCode, AccountName, " +
                         "       Password, Department " +
                         "FROM [DtradeProduction].[ppa].[vwAccount] " +
                         "WHERE AccountCode = ? AND IsActive = 1";

            log.debug("Finding account by AccountCode: {}", accountCode);

            Account account = jdbcTemplate.queryForObject(sql, accountRowMapper, accountCode);

            log.debug("Found account: {} — {}", account.getAccountCode(), account.getAccountName());

            return Optional.ofNullable(account);

        } catch (Exception e) {
            log.warn("Account not found or error: {} — {}", accountCode, e.getMessage());
            return Optional.empty();
        }
    }
}
