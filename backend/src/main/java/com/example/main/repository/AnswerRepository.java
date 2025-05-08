package com.example.main.repository;

import com.example.main.model.Question;
import com.example.main.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.main.model.Answer;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long>{
    public List<Answer> findByQuestion(Question question);
    public List<Answer> findByAuthor(User author);
}
