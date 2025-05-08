package com.example.main.controller;

import com.example.main.dto.UserDto;
import com.example.main.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/all")
    public ResponseEntity<List<UserDto>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        List<UserDto> users = userService.searchUsers(keyword);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable String id){
        // Check for undefined or invalid ID
        if (id == null || id.equals("undefined") || id.equals("null")) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Long userId = Long.valueOf(id);
            return userService.getUserById(userId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username){
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        return userService.getUserByUsername(username)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<UserDto> createUser(@RequestBody Map<String,String> body){
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        String phoneNumber = body.get("phoneNumber");

        if(username == null || email == null || password == null){
            return ResponseEntity.badRequest().build();
        }

        UserDto userDto = userService.createUser(username,email,password,phoneNumber);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody Map<String,String> body){
        String username = body.get("username");
        String email = body.get("email");
        String phoneNumber = body.get("phoneNumber");

        return userService.updateUser(id,username,email,phoneNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update a user's profile information
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateUserProfile(@PathVariable String id, @RequestBody Map<String, Object> profileData) {
        // Check for undefined or invalid ID
        if (id == null || id.equals("undefined") || id.equals("null")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID"));
        }
        
        try {
            Long userId = Long.valueOf(id);
            return userService.updateUserProfile(userId, profileData)
                    .map(userDto -> ResponseEntity.ok(Map.of("message", "Profile updated successfully", "user", userDto)))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update profile", "message", e.getMessage()));
        }
    }

    /**
     * Change a user's password
     */
    @PostMapping("/{id}/changePassword")
    public ResponseEntity<?> changePassword(
            @PathVariable String id,
            @RequestBody Map<String, String> passwordData) {

        // Check for undefined or invalid ID
        if (id == null || id.equals("undefined") || id.equals("null")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID"));
        }
        
        // Validate input data
        String currentPassword = passwordData.get("currentPassword");
        String newPassword = passwordData.get("newPassword");
        
        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Both current and new passwords are required"));
        }
        
        try {
            Long userId = Long.valueOf(id);
            
            boolean success = userService.changePassword(userId, currentPassword, newPassword);
            
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Failed to change password. Current password may be incorrect."));
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to change password", "message", e.getMessage()));
        }
    }

    /**
     * Get user statistics
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<?> getUserStatistics(@PathVariable String id) {
        // Check for undefined or invalid ID
        if (id == null || id.equals("undefined") || id.equals("null")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID"));
        }
        
        try {
            Long userId = Long.valueOf(id);
            
            return userService.getUserById(userId)
                    .map(user -> {
                        Map<String, Object> stats = new HashMap<>();
                        stats.put("userId", user.getId());
                        stats.put("username", user.getUsername());
                        stats.put("reputation", user.getReputation() != null ? user.getReputation() : 0);
                        stats.put("joinDate", user.getCreatedAt());
                        
                        // In a real implementation, you would calculate these from the database
                        // For now, we'll return placeholder values
                        stats.put("questionsCount", 0);
                        stats.put("answersCount", 0);
                        stats.put("acceptedAnswersCount", 0);
                        stats.put("totalVotes", 0);
                        
                        // Badge data - in a real implementation, this would come from the database
                        List<Map<String, String>> badges = new ArrayList<>();
                        if (user.getBadges() != null && !user.getBadges().isEmpty()) {
                            // Parse JSON string to object and add to badges list
                            // Example: badges.add(Map.of("name", "First Question", "type", "bronze"));
                        }
                        stats.put("badges", badges);
                        
                        return ResponseEntity.ok(stats);
                    })
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found")));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch user statistics", "message", e.getMessage()));
        }
    }

    @PutMapping("/ban/{id}")
    public ResponseEntity<UserDto> banUser(@PathVariable Long id, @RequestBody Map<String, Object> body){
        Boolean banned = (Boolean) body.get("banned");
        String reason = (String) body.get("reason");
        Number moderatorIdNumber = (Number) body.get("moderatorId");
        Long moderatorId = moderatorIdNumber != null ? moderatorIdNumber.longValue() : null;

        if(banned == null){
            return ResponseEntity.badRequest().build();
        }

        return userService.banUser(id, banned, reason, moderatorId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @PutMapping("/{id}/moderator")
    public ResponseEntity<UserDto> setModerator(@PathVariable Long id, @RequestBody Map<String, Object> body){
        Boolean isModerator = (Boolean) body.get("isModerator");
        Number moderatorIdNumber = (Number) body.get("moderatorId");
        Long moderatorId = moderatorIdNumber != null ? moderatorIdNumber.longValue() : null;

        if(isModerator == null){
            return ResponseEntity.badRequest().build();
        }

        return userService.setModerator(id, isModerator, moderatorId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, @RequestParam Long moderatorId){
        if(userService.deleteUser(id,moderatorId)){
            return ResponseEntity.noContent().build();
        }else{
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String,String> body){
        String username = body.get("username");
        String password = body.get("password");

        if(username == null || password == null){
            return ResponseEntity.badRequest().build();
        }

        if(userService.isBanned(username)){
            String reason = userService.getBanReason(username);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Your account has been banned",
                                 "reason", reason != null ? reason : "No reason provided"
                    ));
        }

        boolean authenticated = userService.authenticate(username, password);
        if (authenticated) {
            // Return user information on successful login
            return userService.getUserByUsername(username)
                    .map(user -> ResponseEntity.ok(Map.of(
                            "authenticated", true,
                            "user", user
                    )))
                    .orElse(ResponseEntity.ok(Map.of("authenticated", true)));
        } else {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
    }

    @GetMapping("/debug-id/{id}")
    public ResponseEntity<Map<String, Object>> debugUserId(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        userService.getUserById(id).ifPresent(user -> {
            Map<String, Object> userData = new HashMap<>();
            userData.put("userId", user.getUserId());
            userData.put("id", user.getUserId()); // Add 'id' field to the response
            userData.put("username", user.getUsername());
            userData.put("email", user.getEmail());
            userData.put("isModerator", user.isModerator());
            response.put("user", userData);
        });
        
        if (response.isEmpty()) {
            response.put("error", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        return ResponseEntity.ok(response);
    }
}
