package com.example.main.controller;

import com.example.main.dto.AnswerDto;
import com.example.main.model.Question;
import com.example.main.model.User;
import com.example.main.service.AnswerService;
import com.example.main.service.QuestionService;
import com.example.main.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.HashMap;

@RestController
@RequestMapping("/answers")
public class AnswerController {
    @Autowired
    private AnswerService answerService;
    @Autowired
    private UserService userService;
    @Autowired
    private QuestionService questionService;

    @GetMapping("/all")
    public ResponseEntity<List<AnswerDto>> getAllAnswers(){
        return ResponseEntity.ok(answerService.getAllAnswers());
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<AnswerDto> getAnswerById(@PathVariable String id){
        // Check for undefined or invalid ID
        if (id == null || id.equals("undefined") || id.equals("null")) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Long answerId = Long.valueOf(id);
            return answerService.getAnswerById(answerId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/question/{questionId}")
    public ResponseEntity<List<AnswerDto>> getAnswersByQuestion(@PathVariable String questionId){
        // Check for undefined or invalid ID
        if (questionId == null || questionId.equals("undefined") || questionId.equals("null")) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Long qId = Long.valueOf(questionId);
            return ResponseEntity.ok(answerService.getAnswersByQuestion(qId));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<AnswerDto>> getAnswersByAuthor(@PathVariable String authorId){
        // Check for undefined or invalid ID
        if (authorId == null || authorId.equals("undefined") || authorId.equals("null")) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Long aId = Long.valueOf(authorId);
            return ResponseEntity.ok(answerService.getAnswersByAuthor(aId));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createAnswer(@RequestBody Map<String, Object> body){
        try {
            // Validate required parameters
            Map<String, String> errors = new HashMap<>();
            
            if (body.get("id") == null) {
                errors.put("id", "Question ID is required");
            }
            if (body.get("authorId") == null) {
                errors.put("authorId", "Author ID is required");
            }
            if (body.get("text") == null) {
                errors.put("text", "Answer text is required");
            }
            
            if (!errors.isEmpty()) {
                return ResponseEntity.badRequest().body(errors);
            }
            
            // Check if text is empty
            String textValue = String.valueOf(body.get("text"));
            if (textValue.trim().isEmpty()) {
                errors.put("text", "Answer text cannot be empty");
                return ResponseEntity.badRequest().body(errors);
            }
            
            // Convert parameters to expected types
            Long questionId;
            Long authorId;
            try {
                Object idObj = body.get("id");
                Object authorIdObj = body.get("authorId");
                
                if (idObj == null || authorIdObj == null) {
                    errors.put("error", "Missing required IDs");
                    return ResponseEntity.badRequest().body(errors);
                }
                
                // Convert to Long whether the input is String or Number
                if (idObj instanceof String) {
                    questionId = Long.valueOf((String) idObj);
                } else if (idObj instanceof Number) {
                    questionId = ((Number) idObj).longValue();
                } else {
                    questionId = Long.valueOf(String.valueOf(idObj));
                }
                
                if (authorIdObj instanceof String) {
                    authorId = Long.valueOf((String) authorIdObj);
                } else if (authorIdObj instanceof Number) {
                    authorId = ((Number) authorIdObj).longValue();
                } else {
                    authorId = Long.valueOf(String.valueOf(authorIdObj));
                }
            } catch (NumberFormatException e) {
                errors.put("error", "Invalid ID format");
                return ResponseEntity.badRequest().body(errors);
            } catch (Exception e) {
                errors.put("error", "Error processing IDs");
                return ResponseEntity.badRequest().body(errors);
            }
            
            String text = String.valueOf(body.get("text"));
            String image = body.get("image") != null ? String.valueOf(body.get("image")) : "";
            
            // Check entities exist before creating answer
            Question question = questionService.findQuestionEntityById(questionId);
            if (question == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Question not found with ID: " + questionId));
            }
            
            // Check if question is already solved
            if ("solved".equals(question.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Question is already solved and cannot be answered"));
            }
            
            // Check if user exists
            User user = userService.findUserEntityById(authorId);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found with ID: " + authorId));
            }
            
            // Create the answer
            AnswerDto createdAnswer = answerService.createAnswer(questionId, authorId, text, image);
            if (createdAnswer == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to create answer"));
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAnswer);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Exception occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<AnswerDto> updateAnswer(@PathVariable Long id, @RequestBody Map<String, String> body, @RequestParam Long userId){
        if(!isAuthorOrModerator(id, userId)){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String text = body.get("text");
        String image = body.get("image");

        return answerService.updateAnswer(id,text,image)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long id, @RequestParam Long userId){
        if(!isAuthorOrModerator(id,userId)){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if(answerService.deleteAnswer(id)){
            return ResponseEntity.noContent().build();
        }else{
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/debug")
    public ResponseEntity<Map<String, Object>> debugAnswerCreation(@RequestBody Map<String, Object> body) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Extract parameters
            String idStr = body.get("id") != null ? body.get("id").toString() : null;
            String authorIdStr = body.get("authorId") != null ? body.get("authorId").toString() : null;
            String text = body.get("text") != null ? body.get("text").toString() : null;
            
            // Basic validation checks
            boolean idValid = idStr != null;
            boolean authorIdValid = authorIdStr != null;
            boolean textValid = text != null && !text.trim().isEmpty();
            
            // Check question and user existence if IDs are valid
            boolean questionExists = false;
            boolean userExists = false;
            
            if (idValid) {
                try {
                    Long questionId = Long.valueOf(idStr);
                    Question question = questionService.findQuestionEntityById(questionId);
                    questionExists = question != null;
                } catch (NumberFormatException e) {
                    idValid = false;
                }
            }
            
            if (authorIdValid) {
                try {
                    Long authorId = Long.valueOf(authorIdStr);
                    User author = userService.findUserEntityById(authorId);
                    userExists = author != null;
                } catch (NumberFormatException e) {
                    authorIdValid = false;
                }
            }
            
            // Aggregate validation results
            boolean wouldSucceed = idValid && authorIdValid && textValid && questionExists && userExists;
            
            response.put("wouldSucceed", wouldSucceed);
            if (!idValid || !questionExists) {
                response.put("idError", !idValid ? "Invalid question ID format" : "Question not found");
            }
            if (!authorIdValid || !userExists) {
                response.put("authorIdError", !authorIdValid ? "Invalid author ID format" : "User not found");
            }
            if (!textValid) {
                response.put("textError", "Answer text is required");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("error", "Error processing request");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/direct-create")
    public ResponseEntity<?> directCreateAnswer(
            @RequestParam(value = "questionId", required = true) String questionIdStr,
            @RequestParam(value = "authorId", required = true) String authorIdStr,
            @RequestParam(value = "text", required = true) String text,
            @RequestParam(value = "image", required = false) String image) {
        
        // Validate input parameters
        if (questionIdStr == null || questionIdStr.equals("undefined") || questionIdStr.equals("null")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question ID is required and cannot be undefined"));
        }
        
        if (authorIdStr == null || authorIdStr.equals("undefined") || authorIdStr.equals("null")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Author ID is required and cannot be undefined"));
        }
        
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Answer text cannot be empty"));
        }
        
        Long questionId;
        Long authorId;
        
        try {
            questionId = Long.valueOf(questionIdStr);
            authorId = Long.valueOf(authorIdStr);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid ID format"));
        }
        
        // Check entities exist before creating answer
        Question question = questionService.findQuestionEntityById(questionId);
        if (question == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question not found with ID: " + questionId));
        }
        
        // Check if question is already solved
        if ("solved".equals(question.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question is already solved and cannot be answered"));
        }
        
        // Check if user exists
        User user = userService.findUserEntityById(authorId);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found with ID: " + authorId));
        }
        
        // Create the answer
        try {
            AnswerDto createdAnswer = answerService.createAnswer(questionId, authorId, text, image != null ? image : "");
            if (createdAnswer == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to create answer"));
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAnswer);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Exception occurred: " + e.getMessage()));
        }
    }

    private boolean isAuthorOrModerator(Long answerId, Long userId) {
        return answerService.getAnswerById(answerId)
                .map(a -> a.getAuthorId().equals(userId) || userService.isModerator(userService.getUserById(userId).get().getUsername()))
                .orElse(false);
    }
}

