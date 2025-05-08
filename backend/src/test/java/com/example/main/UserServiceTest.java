package com.example.main;

import com.example.main.dto.UserDto;
import com.example.main.model.User;
import com.example.main.repository.UserRepository;
import com.example.main.service.NotificationService;
import com.example.main.service.UserService;
import com.example.main.utils.PasswordHashingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordHashingService passwordHashingService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp(){
        MockitoAnnotations.openMocks(this);

        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPasswordHash("hashedpassword");
        user.setScore(1.0f);
        user.setBanned(false);
        user.setModerator(false);
        user.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void getAllUsers(){
        List<User> users = new ArrayList<>();
        users.add(user);
        when(userRepository.findAll()).thenReturn(users);

        List<UserDto> result = userService.getAllUsers();

        assertEquals(1,result.size());
        assertEquals("testuser", result.get(0).getUsername());
    }

    @Test
    void getUserById(){
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        Optional<UserDto> result = userService.getUserById(1L);

        assertTrue(result.isPresent());
        assertEquals("testuser", result.get().getUsername());
    }

    @Test
    void createUser(){
        when(passwordHashingService.hashPassword(anyString())).thenReturn("hashedpassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserDto result = userService.createUser("testuser", "test@example.com", "password", "123456789");
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        Optional<UserDto> result = userService.updateUser(1L, "newusername", "newemail@example.com", "9876543210");

        assertTrue(result.isPresent());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void banUser() {
        User moderator = new User();
        moderator.setId(2L);
        moderator.setModerator(true);

        when(userRepository.findById(2L)).thenReturn(Optional.of(moderator));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        Optional<UserDto> result = userService.banUser(1L, true, "Violation", 2L);

        assertTrue(result.isPresent());
        verify(userRepository).save(any(User.class));
        verify(notificationService).sendBanNotification(any(User.class), anyString());
    }

    @Test
    void authenticate() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordHashingService.verifyPassword("password", "hashedpassword")).thenReturn(true);

        boolean result = userService.authenticate("testuser", "password");

        assertTrue(result);
    }
}
