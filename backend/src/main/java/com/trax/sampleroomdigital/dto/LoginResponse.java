package com.trax.sampleroomdigital.dto;

public class LoginResponse {
    private String id_emp;
    private String full_name;
    private String token;
    private String ip;
    private String device;

    public LoginResponse() {}
    public LoginResponse(String id_emp, String full_name, String token, String ip, String device) {
        this.id_emp = id_emp;
        this.full_name = full_name;
        this.token = token;
        this.ip = ip;
        this.device = device;
    }

    public String getId_emp() { return id_emp; }
    public void setId_emp(String id_emp) { this.id_emp = id_emp; }
    public String getFull_name() { return full_name; }
    public void setFull_name(String full_name) { this.full_name = full_name; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }
    public String getDevice() { return device; }
    public void setDevice(String device) { this.device = device; }
}
