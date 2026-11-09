
package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
public class SecurityBeansConfig {

    @Bean
    public UserDetailsService userDetailsService() {

        // В нашем проекте авторизация выполняется через JWT.
        // Встроенный механизм поиска пользователей Spring Security
        // нам не требуется.

        return username -> {
            throw new UsernameNotFoundException(
                    "Пользователь не найден"
            );
        };
    }
}
