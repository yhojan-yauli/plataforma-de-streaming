package com.Streaming.service;

import com.Streaming.dto.response.UserResponse;
import com.Streaming.entity.Role;
import com.Streaming.entity.User;
import com.Streaming.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // 🔹 LISTAR + BUSCAR + PAGINAR
    public Page<UserResponse> getUsers(String search, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<User> users;

        if (search != null && !search.isEmpty()) {
            users = userRepository
                    .findByRoleAndNameContainingIgnoreCaseOrRoleAndEmailContainingIgnoreCase(
                            Role.USER, search,
                            Role.USER, search,
                            pageable
                    );
        } else {
            users = userRepository.findByRole(Role.USER, pageable);
        }

        return users.map(UserResponse::new);
    }

    // 🔹 TOGGLE ACTIVO
    public void toggleUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setActive(!user.isActive());
        userRepository.save(user);
    }
}