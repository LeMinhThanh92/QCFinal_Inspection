package com.trax.sampleroomdigital.model;

public class Account {
    private int accountId;
    private String accountCode;
    private String accountShortCode;
    private String accountName;
    private String password;
    private String department;

    public Account() {}

    public int getAccountId() { return accountId; }
    public void setAccountId(int accountId) { this.accountId = accountId; }
    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
    public String getAccountShortCode() { return accountShortCode; }
    public void setAccountShortCode(String accountShortCode) { this.accountShortCode = accountShortCode; }
    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
}
