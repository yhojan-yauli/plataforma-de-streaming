package com.Streaming.repository;

import com.Streaming.entity.Content;
import com.Streaming.entity.ContentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            SELECT c
            FROM Content c
            WHERE c.active = true
              AND (:search IS NULL
                OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')))
              AND (:type IS NULL OR c.type = :type)
              AND (:year IS NULL OR c.year = :year)
              AND (:genre IS NULL OR LOWER(c.genre) LIKE LOWER(CONCAT('%', :genre, '%')))
            """)
    Page<Content> browseActive(
            @Param("search") String search,
            @Param("type") ContentType type,
            @Param("year") Integer year,
            @Param("genre") String genre,
            Pageable pageable
    );

    Optional<Content> findByIdAndActiveTrue(String id);

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
