package com.example.main.repository;

import com.example.main.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    
    // Add search methods
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "(u.bio IS NOT NULL AND LOWER(u.bio) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
           "(u.location IS NOT NULL AND LOWER(u.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<User> searchUsers(@Param("keyword") String keyword);
}
