package com.Streaming.repository;

import com.Streaming.entity.Content;
import com.Streaming.entity.ContentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ContentRepository extends JpaRepository<Content, String> {

    Page<Content> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Content> findByType(ContentType type, Pageable pageable);

    Page<Content> findByTitleContainingIgnoreCaseAndType(
            String title,
            ContentType type,
            Pageable pageable
    );


    // 🔥 ESTE MÉTODO ES EL QUE TE FALTA
    long countByActiveTrue();
    @Query("SELECT COALESCE(SUM(c.views), 0) FROM Content c")
    long getTotalViews();

    @Query(value = """
SELECT DATE(updated_at) as day, SUM(views) as views
FROM content
WHERE updated_at IS NOT NULL
GROUP BY DATE(updated_at)
ORDER BY DATE(updated_at) DESC
LIMIT 7
""", nativeQuery = true)
    List<Object[]> getViewsRaw();

    //para el usuario
    List<Content> findByActiveTrue();
    Optional<Content> findTopByActiveTrueOrderByViewsDesc();
    List<Content> findTop10ByActiveTrueOrderByViewsDesc();

}