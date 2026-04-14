package com.Streaming.repository;

import com.Streaming.entity.User;
import com.Streaming.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    // 🔹 PARA LOGIN (NO TOCAR)
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // 🔹 LISTAR SOLO USERS
    Page<User> findByRole(Role role, Pageable pageable);

    // 🔹 BUSCADOR "yo" (nombre o email PERO SOLO USER)
    Page<User> findByRoleAndNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
            Role role1, String name,
            Role role2, String email,
            Pageable pageable
    );

    long countByActiveTrue();
}