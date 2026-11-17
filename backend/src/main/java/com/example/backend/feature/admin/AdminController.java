
package com.example.backend.feature.admin;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Изменение роли пользователя
    @PatchMapping("/users/{id}/role")
    public AdminUserResponse changeUserRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request,
            @AuthenticationPrincipal String currentUserId
    ) {

        return adminService.changeUserRole(
                id,
                currentUserId,
                request.getRole()
        );
    }
}
