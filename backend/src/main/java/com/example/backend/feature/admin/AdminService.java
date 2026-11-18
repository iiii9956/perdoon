
package com.example.backend.feature.admin;


import com.example.backend.feature.role.Role;
import com.example.backend.feature.user.User;
import com.example.backend.feature.user.UserCleanupService;
import com.example.backend.feature.user.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final UserCleanupService userCleanupService;

    public AdminService(UserRepository userRepository, UserCleanupService userCleanupService) {
        this.userRepository = userRepository;
        this.userCleanupService = userCleanupService;
    }

    @Transactional
    public AdminUserResponse changeUserRole(
            Long targetUserId,
            String currentAdminId,
            Role newRole
    ) {

        // Проверяем, что новая роль указана
        if (newRole == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Необходимо указать новую роль"
            );
        }

        // Не разрешаем администратору менять собственную роль
        if (targetUserId.equals(Long.parseLong(currentAdminId))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Нельзя изменять собственную роль"
            );
        }

        // Ищем пользователя, которому меняем роль
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        // Если пользователь уже имеет нужную роль, ничего не меняем
        if (user.getRole() == newRole) {
            return new AdminUserResponse(user);
        }

        // Не разрешаем понизить последнего администратора
        if (user.getRole() == Role.ADMIN && newRole != Role.ADMIN) {

            long adminCount = userRepository.countByRole(Role.ADMIN);

            if (adminCount <= 1) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Нельзя изменить роль последнего администратора"
                );
            }
        }

        // Назначаем новую роль
        user.setRole(newRole);

        // Сохраняем изменения в базе данных
        User updatedUser = userRepository.save(user);

        return new AdminUserResponse(updatedUser);
    }
    @Transactional
    public void deleteUser(Long targetUserId, String currentAdminId) {

        // Запрещаем удалять собственный аккаунт
        if (targetUserId.equals(Long.parseLong(currentAdminId))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Нельзя удалить собственный аккаунт"
            );
        }

        // Ищем пользователя
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Пользователь не найден"
                ));

        // Не разрешаем удалить последнего администратора
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);

            if (adminCount <= 1) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Нельзя удалить последнего администратора"
                );
            }
        }

        userCleanupService.deleteUserAndRelatedData(user);
    }
}
