package com.example.backend.feature.user;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;
        @Column(nullable = false, unique = true)
        private String email;
        @Column(nullable = false)
        private String password;
        private String username;
        private String description;
        private String avatarUrl;
        private LocalDateTime createdAt;
        public User(){
        }
        public User(String email, String password, String username){
            this.email = email;
            this.password = password;
            this.username = username;
            this.createdAt = LocalDateTime.now();
        }
        //getter
        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public String getAvatarUrl() {
            return avatarUrl;
        }

        public String getDescription() {
            return description;
        }

        public String getUsername() {
            return username;
        }

        public String getPassword() {
            return password;
        }

        public String getEmail() {
            return email;
        }

        public Long getId() {
            return id;
        }
        //seter

        public void setId(Long id) {
            this.id = id;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public void setAvatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }

