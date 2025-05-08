package com.example.main.controller;

import com.example.main.dto.QuestionDto;
import com.example.main.model.User;
import com.example.main.service.QuestionService;
import com.example.main.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/questions")
public class QuestionController {
    @Autowired
    private QuestionService questionService;

    @Autowired
    private UserService userService;

    @GetMapping("/all")
    public ResponseEntity<List<QuestionDto>> getAllQuestions(){
        return ResponseEntity.ok(questionService.getAllQuestions());
    }

    @GetMapping("/find/{id}")
    public ResponseEntity<QuestionDto> getQuestionById(@PathVariable String id){
        // Check for undefined or invalid ID
        if (id == null || id.equals("undefined") || id.equals("null")) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Long questionId = Long.valueOf(id);
            return questionService.getQuestionById(questionId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<QuestionDto>> getQuestionsByAuthor(@PathVariable String authorId){
        // Check for undefined or invalid ID
        if (authorId == null || authorId.equals("undefined") || authorId.equals("null")) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Long userId = Long.valueOf(authorId);
            return ResponseEntity.ok(questionService.getQuestionsByAuthor(userId));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/tag/{tagName}")
    public ResponseEntity<List<QuestionDto>> getQuestionsByTag(@PathVariable String tagName){
        return ResponseEntity.ok(questionService.getQuestionsByTag(tagName));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<QuestionDto>> getQuestionsByStatus(@PathVariable String status){
        return ResponseEntity.ok(questionService.getQuestionsByStatus(status));
    }

    @GetMapping("/search")
    public ResponseEntity<List<QuestionDto>> searchQuestions(@RequestParam String keyword){
        if (keyword == null || keyword.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<QuestionDto> questions = questionService.searchQuestions(keyword);
        return ResponseEntity.ok(questions);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createQuestion(@RequestBody Map<String,Object> body){
        try {
            // Check for null values in the request
            if (body.get("authorId") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Author ID is required"));
            }
            if (body.get("title") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Title is required"));
            }
            if (body.get("text") == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Question text is required"));
            }

            // Convert authorId to Long safely
            Long authorId;
            try {
                authorId = Long.valueOf(body.get("authorId").toString());
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid author ID format"));
            }

            // Get other fields with safe defaults
            String title = body.get("title").toString();
            String text = body.get("text").toString();
            String image = body.get("image") != null ? body.get("image").toString() : "";
            String tags = body.get("tags") != null ? body.get("tags").toString() : "";

            // Validate fields
            if (title.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Title cannot be empty"));
            }
            if (text.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Question text cannot be empty"));
            }

            // Check if user exists
            User user = userService.findUserEntityById(authorId);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found with ID: " + authorId));
            }

            // Create the question
            QuestionDto createdQuestion = questionService.createQuestion(authorId, title, text, image, tags);
            if (createdQuestion == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to create question"));
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(createdQuestion);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating question: " + e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<QuestionDto> updateQuestion(@PathVariable String id, @RequestBody Map<String, String> body, @RequestParam(required = false) String userId){
        // Check for undefined or invalid IDs
        if (id == null || id.equals("undefined") || id.equals("null")) {
            return ResponseEntity.badRequest().build();
        }
        
        if (userId == null || userId.equals("undefined") || userId.equals("null")) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Long questionId = Long.valueOf(id);
            Long userIdLong = Long.valueOf(userId);
            
            if(!isAuthorOrModerator(questionId, userIdLong)){
                return ResponseEntity.badRequest().build();
            }
            
            String title = body.get("title");
            String text = body.get("text");
            String image = body.get("image");
            String tags = body.get("tags");
            String status = body.get("status");
            
            return questionService.updateQuestion(questionId,title,text,image,tags,status)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.badRequest().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{questionId}/accept/{answerId}")
    public ResponseEntity<QuestionDto> acceptAnswer(@PathVariable String questionId, @PathVariable String answerId){
        // Check for undefined or invalid IDs
        if (questionId == null || questionId.equals("undefined") || questionId.equals("null") ||
            answerId == null || answerId.equals("undefined") || answerId.equals("null")) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Long qId = Long.valueOf(questionId);
            Long aId = Long.valueOf(answerId);
            
            return questionService.acceptAnswer(qId, aId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.badRequest().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String id, @RequestParam(required = false) String userId){
        // Check for undefined or invalid IDs
        if (id == null || id.equals("undefined") || id.equals("null") ||
            userId == null || userId.equals("undefined") || userId.equals("null")) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Long questionId = Long.valueOf(id);
            Long userIdLong = Long.valueOf(userId);
            
            if(!isAuthorOrModerator(questionId, userIdLong)){
                return ResponseEntity.badRequest().build();
            }
            
            return questionService.deleteQuestion(questionId) ? 
                   ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private boolean isAuthorOrModerator(Long questionId, Long userId){
        if (questionId == null || userId == null) {
            return false;
        }
        
        User user = userService.findUserEntityById(userId);
        if (user == null) {
            return false;
        }
        
        return questionService.getQuestionById(questionId)
                .map(question -> question.getAuthorId().equals(userId) || userService.isModerator(user.getUsername()))
                .orElse(false);
    }
}
