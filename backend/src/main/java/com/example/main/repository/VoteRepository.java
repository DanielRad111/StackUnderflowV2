package com.example.main.repository;

import com.example.main.model.Answer;
import com.example.main.model.Question;
import com.example.main.model.User;
import com.example.main.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {
    List<Vote> findByUser(User user);
    List<Vote> findByQuestion(Question question);
    List<Vote> findByAnswer(Answer answer);
    Optional<Vote> findByUserAndQuestion(User user, Question question);
    Optional<Vote> findByUserAndAnswer(User user, Answer answer);
}
