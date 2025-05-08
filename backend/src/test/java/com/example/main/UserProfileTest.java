package com.example.main;

import com.example.main.dto.UserDto;
import com.example.main.model.User;
import com.example.main.repository.UserRepository;
import com.example.main.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserProfileTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private UserDto testUser;

    @BeforeEach
    public void setUp() {
        // Create a test user
        testUser = userService.createUser(
                "testuser_" + System.currentTimeMillis(),
                "test_" + System.currentTimeMillis() + "@example.com",
                "password123",
                "1234567890"
        );
    }

    @Test
    public void testCreateUser() {
        assertNotNull(testUser);
        assertNotNull(testUser.getId());
        assertEquals(0, testUser.getScore());
        assertFalse(testUser.isBanned());
        assertFalse(testUser.isModerator());
    }

    @Test
    public void testUpdateUserProfile() {
        // Prepare profile data
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("bio", "This is my test bio");
        profileData.put("location", "Test City, Test Country");
        profileData.put("website", "https://testwebsite.com");
        profileData.put("github", "testuser");
        profileData.put("linkedin", "testuser");
        profileData.put("twitter", "testuser");

        // Update profile
        Optional<UserDto> updatedUserOpt = userService.updateUserProfile(testUser.getId(), profileData);
        
        // Assert update was successful
        assertTrue(updatedUserOpt.isPresent());
        
        UserDto updatedUser = updatedUserOpt.get();
        assertEquals("This is my test bio", updatedUser.getBio());
        assertEquals("Test City, Test Country", updatedUser.getLocation());
        assertEquals("https://testwebsite.com", updatedUser.getWebsite());
        assertEquals("testuser", updatedUser.getGithub());
        assertEquals("testuser", updatedUser.getLinkedin());
        assertEquals("testuser", updatedUser.getTwitter());
    }

    @Test
    public void testChangePassword() {
        // Change password
        boolean success = userService.changePassword(testUser.getId(), "password123", "newpassword123");
        
        // Assert password change was successful
        assertTrue(success);
        
        // Verify new password works for authentication
        assertTrue(userService.authenticate(testUser.getUsername(), "newpassword123"));
        
        // Verify old password doesn't work anymore
        assertFalse(userService.authenticate(testUser.getUsername(), "password123"));
    }

    @Test
    public void testInvalidPasswordChange() {
        // Try to change password with incorrect current password
        boolean success = userService.changePassword(testUser.getId(), "wrongpassword", "newpassword123");
        
        // Assert password change failed
        assertFalse(success);
        
        // Verify original password still works
        assertTrue(userService.authenticate(testUser.getUsername(), "password123"));
    }

    @Test
    public void testUpdateReputation() {
        // Get initial reputation
        Integer initialReputation = testUser.getReputation();
        
        // Update reputation
        Optional<UserDto> updatedUserOpt = userService.updateReputation(testUser.getId(), 10);
        
        // Assert update was successful
        assertTrue(updatedUserOpt.isPresent());
        
        UserDto updatedUser = updatedUserOpt.get();
        assertEquals(Integer.valueOf(initialReputation + 10), updatedUser.getReputation());
        
        // Decrease reputation
        updatedUserOpt = userService.updateReputation(testUser.getId(), -5);
        
        // Assert update was successful
        assertTrue(updatedUserOpt.isPresent());
        updatedUser = updatedUserOpt.get();
        assertEquals(Integer.valueOf(initialReputation + 5), updatedUser.getReputation());
    }

    @Test
    public void testDtoContainsAllFields() {
        // Update a user with all fields to ensure the DTO conversion works correctly
        User user = userRepository.findById(testUser.getId()).orElseThrow();
        
        user.setBio("Complete bio");
        user.setLocation("Complete location");
        user.setWebsite("https://complete-website.com");
        user.setGithub("complete-github");
        user.setLinkedin("complete-linkedin");
        user.setTwitter("complete-twitter");
        user.setReputation(100);
        user.setBadges("[{\"name\":\"Test Badge\",\"type\":\"gold\"}]");
        
        User savedUser = userRepository.save(user);
        
        // Get the user DTO through the service
        Optional<UserDto> userDtoOpt = userService.getUserById(savedUser.getId());
        assertTrue(userDtoOpt.isPresent());
        
        UserDto userDto = userDtoOpt.get();
        
        // Verify all fields are correctly mapped to the DTO
        assertEquals("Complete bio", userDto.getBio());
        assertEquals("Complete location", userDto.getLocation());
        assertEquals("https://complete-website.com", userDto.getWebsite());
        assertEquals("complete-github", userDto.getGithub());
        assertEquals("complete-linkedin", userDto.getLinkedin());
        assertEquals("complete-twitter", userDto.getTwitter());
        assertEquals(Integer.valueOf(100), userDto.getReputation());
        assertEquals("[{\"name\":\"Test Badge\",\"type\":\"gold\"}]", userDto.getBadges());
    }
} 