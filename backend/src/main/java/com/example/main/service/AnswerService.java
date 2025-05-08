package com.example.main.service;

import com.example.main.dto.AnswerDto;
import com.example.main.model.Answer;
import com.example.main.model.Question;
import com.example.main.model.User;
import com.example.main.model.Vote;
import com.example.main.repository.AnswerRepository;
import com.example.main.repository.VoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AnswerService {
    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private VoteRepository voteRepository;

    public List<AnswerDto> getAllAnswers() {
        return answerRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<AnswerDto> getAnswerById(Long id){
        return answerRepository.findById(id).map(this::convertToDto);
    }

    public List<AnswerDto> getAnswersByQuestion(Long questionId){
        Question question = questionService.findQuestionEntityById(questionId);

        if(question == null){
            return List.of();
        }

        return answerRepository.findByQuestion(question).stream()
                .sorted((a1,a2) -> {
                    List<Vote> votes1 = voteRepository.findByAnswer(a1);
                    List<Vote> votes2 = voteRepository.findByAnswer(a2);

                    int upvotes1 = (int) votes1.stream().filter(v -> "upvote".equals(v.getVoteType())).count();
                    int downvotes1 = (int) votes1.stream().filter(v -> "downvote".equals(v.getVoteType())).count();
                    int voteCount1 = upvotes1 - downvotes1;

                    int upvotes2 = (int) votes2.stream().filter(v -> "upvote".equals(v.getVoteType())).count();
                    int downvotes2 = (int) votes2.stream().filter(v -> "downvote".equals(v.getVoteType())).count();
                    int voteCount2 = upvotes2 - downvotes2;

                    return Integer.compare(voteCount2, voteCount1);
                })
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<AnswerDto> getAnswersByAuthor(Long authorId){
        User author = userService.findUserEntityById(authorId);
        if(author == null){
            return List.of();
        }

        return answerRepository.findByAuthor(author).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public AnswerDto createAnswer(Long questionId, Long authorId, String text, String image){
        Question question = questionService.findQuestionEntityById(questionId);
        User author = userService.findUserEntityById(authorId);
        
        if(question == null || author == null){
            return null;
        }

        //cannot answer a solved question
        if("solved".equals(question.getStatus())){
            return null;
        }

        try {
            Answer answer = new Answer();
            answer.setQuestion(question);
            answer.setAuthor(author);
            answer.setText(text);
            answer.setImage(image);
            
            Answer savedAnswer = answerRepository.save(answer);
            
            //update question status to "in progress" if this is the first answer
            if(answerRepository.findByQuestion(question).size() == 1 && "received".equals(question.getStatus())){
                question.setStatus("in progress");
                questionService.updateQuestion(question.getId(), null, null, null, null, "in progress");
            }
            
            return convertToDto(savedAnswer);
        } catch (Exception e) {
            System.out.println("Error saving answer: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public Optional<AnswerDto> updateAnswer(Long id, String text, String image){
        return answerRepository.findById(id)
                .map(answer -> {
                    if(text != null){
                        answer.setText(text);
                    }
                    if (image != null) {
                        answer.setImage(image);
                    }
                    return convertToDto(answerRepository.save(answer));
                });
    }

    public boolean deleteAnswer(Long id) {
        if (answerRepository.existsById(id)) {
            answerRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private AnswerDto convertToDto(Answer answer) {
        AnswerDto dto = new AnswerDto();
        dto.setAnswerId(answer.getId());
        dto.setId(answer.getId());
        dto.setQuestionId(answer.getQuestion().getId());
        dto.setAuthorId(answer.getAuthor().getId());
        dto.setAuthorUsername(answer.getAuthor().getUsername());
        dto.setText(answer.getText());
        dto.setImage(answer.getImage());
        dto.setCreatedAt(answer.getCreatedAt());

        // Check if this answer is the accepted answer
        if (answer.getQuestion().getAcceptedAnswerId() != null &&
                answer.getQuestion().getAcceptedAnswerId().equals(answer.getId())) {
            dto.setAccepted(true);
        } else {
            dto.setAccepted(false);
        }

        // Count votes
        List<Vote> votes = voteRepository.findByAnswer(answer);
        dto.setUpvotes((int) votes.stream().filter(v -> "upvote".equals(v.getVoteType())).count());
        dto.setDownvotes((int) votes.stream().filter(v -> "downvote".equals(v.getVoteType())).count());

        return dto;
    }

    public Answer findAnswerEntityById(Long id) {
        return answerRepository.findById(id).orElse(null);
    }
}
