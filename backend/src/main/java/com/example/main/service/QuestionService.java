package com.example.main.service;

import com.example.main.dto.QuestionDto;
import com.example.main.model.Question;
import com.example.main.model.Tag;
import com.example.main.model.User;
import com.example.main.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuestionService {
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private TagService tagService;

    public List<QuestionDto> getAllQuestions(){
        return questionRepository.findAll().stream()
                .sorted((q1,q2) -> q2.getCreatedAt().compareTo(q1.getCreatedAt()))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<QuestionDto> getQuestionById(Long id){
        return questionRepository.findById(id).map(this::convertToDto);
    }

    public List<QuestionDto> getQuestionsByAuthor(Long authorId){
        User author = userService.findUserEntityById(authorId);
        if(author == null){
            return List.of();
        }
        return questionRepository.findByAuthor(author).stream()
                .sorted((q1,q2) -> q2.getCreatedAt().compareTo(q1.getCreatedAt()))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<QuestionDto> getQuestionsByTag(String tagName){
        Optional<Tag> tag = tagService.findTagEntityByName(tagName);
        if(tag.isEmpty()){
            return List.of();
        }
        return tag.get().getQuestions().stream()
                .sorted((q1,q2) -> q2.getCreatedAt().compareTo(q1.getCreatedAt()))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<QuestionDto> getQuestionsByStatus(String status) {
        return questionRepository.findByStatus(status).stream()
                .sorted((q1, q2) -> q2.getCreatedAt().compareTo(q1.getCreatedAt()))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<QuestionDto> searchQuestions(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Use the improved search method
        return questionRepository.searchByKeyword(keyword).stream()
                .sorted((q1, q2) -> q2.getCreatedAt().compareTo(q1.getCreatedAt()))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public QuestionDto createQuestion(Long authorId, String title, String text, String image, String tagName){
        User author = userService.findUserEntityById(authorId);
        if(author == null){
            return null;
        }

        Question question = new Question();
        question.setAuthor(author);
        question.setTitle(title);
        question.setText(text);
        question.setImage(image);
        question.setStatus("received");

        if(tagName != null && !tagName.trim().isEmpty()){
            List<String> tagNames = Arrays.asList(tagName.split(","));
            List<Tag> tags = new ArrayList<>();

            for(String name : tagNames){
                String trimmedName = name.trim();
                if(!trimmedName.isEmpty()){
                    Tag tag = tagService.findOrCreateTag(trimmedName);
                    tags.add(tag);
                }
            }
            question.setTags(tags);
        }

        question = questionRepository.save(question);
        return convertToDto(question);
    }

    public Optional<QuestionDto> updateQuestion(Long id, String title, String text, String image, String tagName, String status){
        return questionRepository.findById(id)
                .map(question ->{
                    if(title != null){
                        question.setTitle(title);
                    }
                    if(text != null){
                        question.setText(text);
                    }
                    if(image != null){
                        question.setImage(image);
                    }
                    if(status != null){
                        question.setStatus(status);
                    }

                    if (tagName != null) {
                        List<String> tagNames = Arrays.asList(tagName.split(","));
                        List<Tag> tags = new ArrayList<>();

                        for (String name : tagNames) {
                            String trimmedName = name.trim();
                            if (!trimmedName.isEmpty()) {
                                Tag tag = tagService.findOrCreateTag(trimmedName);
                                tags.add(tag);
                            }
                        }

                        question.setTags(tags);
                    }

                    question = questionRepository.save(question);
                    return convertToDto(question);
                });
    }

    public Optional<QuestionDto> acceptAnswer(Long questionId, Long answerId){
        return questionRepository.findById(questionId)
                .map(question -> {
                    question.setAcceptedAnswerId(answerId);
                    question.setStatus("solved");
                    return convertToDto(questionRepository.save(question));
                });
    }

    public boolean deleteQuestion(Long id){
        if(questionRepository.existsById(id)){
            questionRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private QuestionDto convertToDto(Question question){
        QuestionDto questionDto = new QuestionDto();
        questionDto.setQuestionId(question.getId());
        questionDto.setAuthorId(question.getAuthor().getId());
        questionDto.setAuthorUsername(question.getAuthor().getUsername());
        questionDto.setTitle(question.getTitle());
        questionDto.setText(question.getText());
        questionDto.setImage(question.getImage());
        questionDto.setStatus(question.getStatus());
        questionDto.setCreatedAt(question.getCreatedAt());

        return questionDto;
    }

    public Question findQuestionEntityById(Long questionId) {
        if (questionId == null) {
            return null;
        }
        
        return questionRepository.findById(questionId).orElse(null);
    }
}
