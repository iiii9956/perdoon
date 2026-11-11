
package com.example.backend.feature.admin;

import com.example.backend.feature.role.Role;

public class RoleUpdateRequest {

    private Role role;

    public RoleUpdateRequest() {
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
