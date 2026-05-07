package com.Streaming.repository;

import com.Streaming.entity.UserMyList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserMyListRepository extends JpaRepository<UserMyList, String> {

    List<UserMyList> findByUserIdOrderByAddedAtDesc(String userId);

    boolean existsByUserIdAndContentId(String userId, String contentId);

    Optional<UserMyList> findByUserIdAndContentId(String userId, String contentId);
}
