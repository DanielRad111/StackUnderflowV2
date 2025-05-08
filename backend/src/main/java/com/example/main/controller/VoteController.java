package com.example.main.controller;

import com.example.main.dto.VoteDto;
import com.example.main.service.VoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/votes")
public class VoteController {
    @Autowired
    private VoteService voteService;

    @GetMapping("/all")
    public ResponseEntity<List<VoteDto>> getAllVotes(){
        return ResponseEntity.ok(voteService.getAllVotes());
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<VoteDto> getVoteById(@PathVariable Long id){
        return voteService.getVoteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<VoteDto>> getVotesByUser(@PathVariable Long userId){
        return ResponseEntity.ok(voteService.getVotesByUser(userId));
    }

    @PostMapping("/question")
    public ResponseEntity<VoteDto> voteOnQuestion(@RequestBody Map<String,Object> body){
        Long userId = Long.valueOf(body.get("userId").toString());
        Long questionId = Long.valueOf(body.get("questionId").toString());
        String voteType = (String) body.get("voteType");

        if(userId == null || questionId == null || voteType == null){
            return ResponseEntity.noContent().build();
        }

        VoteDto vote = voteService.voteOnQuestion(userId, questionId, voteType);
        if(vote == null){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(vote);
    }

    @PostMapping("/answer")
    public ResponseEntity<VoteDto> voteOnAnswer(@RequestBody Map<String, Object> body){
        Long userId = Long.valueOf(body.get("userId").toString());
        Long answerId = Long.valueOf(body.get("answerId").toString());
        String voteType = (String) body.get("voteType");

        if(userId == null || answerId == null || voteType == null){
            return ResponseEntity.noContent().build();
        }

        VoteDto vote = voteService.voteOnAnswer(userId, answerId, voteType);
        if(vote == null){
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(vote);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteVote(@PathVariable Long id){
        if(voteService.deleteVote(id)){
            return ResponseEntity.noContent().build();
        }else{
            return ResponseEntity.notFound().build();
        }
    }
}
