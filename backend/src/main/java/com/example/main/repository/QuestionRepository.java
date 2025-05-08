package com.example.main.repository;

import com.example.main.model.Question;
import com.example.main.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question,Long> {
    List<Question> findByAuthor(User author);
    List<Question> findByStatus(String status);
    
    // Replace simple findByTitleOrText with a more robust search using LIKE
    @Query("SELECT q FROM Question q WHERE " +
           "LOWER(q.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(q.text) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Question> searchByKeyword(@Param("keyword") String keyword);
    
    // Keep the original method for backward compatibility
    List<Question> findByTitleOrText(String title, String text);
}
