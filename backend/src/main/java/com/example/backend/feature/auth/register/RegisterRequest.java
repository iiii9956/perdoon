
package com.example.backend.feature.auth.register;

public class RegisterRequest {

    private String username;
    private String email;
    private String phone;
    private String password;

    public RegisterRequest(String email, String phone, String password, String username) {
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.username = username;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
