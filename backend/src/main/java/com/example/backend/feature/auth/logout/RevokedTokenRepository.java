
package com.example.backend.feature.auth.logout;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RevokedTokenRepository
        extends JpaRepository<RevokedToken, Long> {

    boolean existsByTokenHash(String tokenHash);
}
