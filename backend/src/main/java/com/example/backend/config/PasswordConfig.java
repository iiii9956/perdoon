
package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
//@Configuration — сообщает Spring, что это класс с настройками.
@Configuration
public class PasswordConfig {
//@Bean — создаёт объект, которым Spring сможет пользоваться в других классах.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    //PasswordEncoder — интерфейс для работы с хешированием паролей.
    //BCryptPasswordEncoder — реализация, которая будет создавать хеши паролей.
}

