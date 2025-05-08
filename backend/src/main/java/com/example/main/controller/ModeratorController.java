package com.example.main.controller;

import com.example.main.dto.AnswerDto;
import com.example.main.dto.QuestionDto;
import com.example.main.service.AnswerService;
import com.example.main.service.QuestionService;
import com.example.main.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/moderator")
public class ModeratorController {
    @Autowired
    private UserService userService;

    @Autowired
    private QuestionService questionService;

    @Autowired
    private AnswerService answerService;

    @PutMapping("/questions/{id}")
    public ResponseEntity<QuestionDto> editQuestion(@PathVariable Long id, @RequestBody Map<String, String> body, @RequestParam Long moderatorId){
        if(!userService.isModerator(userService.findUserEntityById(moderatorId).getUsername())){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String title = body.get("title");
        String text = body.get("text");
        String image = body.get("image");
        String tags = body.get("tags");
        String status = body.get("status");

        return questionService.updateQuestion(id, title, text, image, tags, status)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id, @RequestParam Long moderatorId){
        if(!userService.isModerator(userService.findUserEntityById(moderatorId).getUsername())){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if(questionService.deleteQuestion(id)){
            return ResponseEntity.noContent().build();
        }else{
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/answers/{id}")
    public ResponseEntity<AnswerDto> editAnswer(@PathVariable Long id, @RequestBody Map<String,String> body, @RequestParam Long moderatorId){
        if(!userService.isModerator(userService.findUserEntityById(moderatorId).getUsername())){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String text = body.get("text");
        String image = body.get("image");

        return answerService.updateAnswer(id, text, image)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/answers/{id}")
    public ResponseEntity<Void> deleteAnswer(@PathVariable Long id, @RequestParam Long moderatorId){
        if(!userService.isModerator(userService.findUserEntityById(moderatorId).getUsername())){
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        if(answerService.deleteAnswer(id)){
            return ResponseEntity.noContent().build();
        }else{
            return ResponseEntity.notFound().build();
        }
    }
}
