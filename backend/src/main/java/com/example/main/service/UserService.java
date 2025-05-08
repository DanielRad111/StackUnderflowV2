package com.example.main.service;

import com.example.main.dto.UserDto;
import com.example.main.model.User;
import com.example.main.repository.UserRepository;
import com.example.main.utils.PasswordHashingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordHashingService passwordHashingService;
    @Autowired
    private NotificationService notificationService;

    public List<UserDto> getAllUsers(){
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Search for users by keyword
     * @param keyword The search term to match against username, email, bio, location, etc.
     * @return List of matching users
     */
    public List<UserDto> searchUsers(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return new ArrayList<>();
        }
        
        // Use the repository method instead of manual filtering
        List<User> users = userRepository.searchUsers(keyword);
        
        return users.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<UserDto> getUserById(Long id){
        return this.userRepository.findById(id).map(this::convertToDto);
    }

    public Optional<UserDto> getUserByEmail(String email){
        return this.userRepository.findByEmail(email).map(this::convertToDto);
    }

    public Optional<UserDto> getUserByUsername(String username){
        return this.userRepository.findByUsername(username).map(this::convertToDto);
    }

    public UserDto createUser(String username, String email, String password, String phoneNumber){
        String hashedPassword = passwordHashingService.hashPassword(password);
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(hashedPassword);
        user.setPhoneNumber(phoneNumber);
        user.setScore(0);
        user.setBanned(false);
        user.setModerator(false);
        // Default reputation
        user.setReputation(0);

        this.userRepository.save(user);
        return convertToDto(user);
    }

    public Optional<UserDto> updateUser(Long id, String username, String email, String phoneNumber) {
        return userRepository.findById(id)
                .map(user -> {
                    if (username != null) {
                        user.setUsername(username);
                    }
                    if (email != null) {
                        user.setEmail(email);
                    }
                    if (phoneNumber != null) {
                        user.setPhoneNumber(phoneNumber);
                    }
                    return convertToDto(userRepository.save(user));
                });
    }

    /**
     * Update a user's profile with the provided data
     * @param id The user ID
     * @param profileData Map containing profile data to update
     * @return Updated UserDto or empty if user not found
     */
    public Optional<UserDto> updateUserProfile(Long id, Map<String, Object> profileData) {
        return userRepository.findById(id)
                .map(user -> {
                    // Update basic fields
                    if (profileData.containsKey("username")) {
                        user.setUsername((String) profileData.get("username"));
                    }
                    if (profileData.containsKey("email")) {
                        user.setEmail((String) profileData.get("email"));
                    }
                    if (profileData.containsKey("phoneNumber")) {
                        user.setPhoneNumber((String) profileData.get("phoneNumber"));
                    }
                    
                    // Update new profile fields
                    if (profileData.containsKey("bio")) {
                        user.setBio((String) profileData.get("bio"));
                    }
                    if (profileData.containsKey("location")) {
                        user.setLocation((String) profileData.get("location"));
                    }
                    if (profileData.containsKey("website")) {
                        user.setWebsite((String) profileData.get("website"));
                    }
                    if (profileData.containsKey("github")) {
                        user.setGithub((String) profileData.get("github"));
                    }
                    if (profileData.containsKey("linkedin")) {
                        user.setLinkedin((String) profileData.get("linkedin"));
                    }
                    if (profileData.containsKey("twitter")) {
                        user.setTwitter((String) profileData.get("twitter"));
                    }
                    
                    // Only moderators should be able to update these
                    if (profileData.containsKey("isModerator") && profileData.containsKey("moderatorId")) {
                        Long moderatorId = Long.valueOf(profileData.get("moderatorId").toString());
                        boolean isModerator = (boolean) profileData.get("isModerator");
                        setModerator(id, isModerator, moderatorId);
                    }
                    
                    if (profileData.containsKey("isBanned") && profileData.containsKey("moderatorId")) {
                        Long moderatorId = Long.valueOf(profileData.get("moderatorId").toString());
                        boolean isBanned = (boolean) profileData.get("isBanned");
                        String reason = (String) profileData.getOrDefault("banReason", "");
                        banUser(id, isBanned, reason, moderatorId);
                    }

                    return convertToDto(userRepository.save(user));
                });
    }

    /**
     * Change a user's password
     * @param id The user ID
     * @param currentPassword The current password for verification
     * @param newPassword The new password
     * @return true if password was changed successfully, false otherwise
     */
    public boolean changePassword(Long id, String currentPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Verify current password
        if (!passwordHashingService.verifyPassword(currentPassword, user.getPasswordHash())) {
            return false;
        }
        
        // Set new password
        String newHashedPassword = passwordHashingService.hashPassword(newPassword);
        user.setPasswordHash(newHashedPassword);
        userRepository.save(user);
        
        return true;
    }

    public Optional<UserDto> banUser(Long id, boolean banned, String reason, Long moderatorId){
        Optional<User> moderatorOpt = userRepository.findById(moderatorId);
        if(moderatorOpt.isEmpty() || !moderatorOpt.get().isModerator()){
            return Optional.empty(); //you have to be a moderator to ban users
        }

        return userRepository.findById(id)
                .map(user -> {
                    if(user.isModerator()){
                        return convertToDto(user);//don't ban moderators
                    }

                    boolean wasBanned = user.isBanned();

                    user.setBanned(banned);
                    if(banned){
                        user.setBanReason(reason);
                        if(!wasBanned){
                            notificationService.sendBanNotification(user,reason);
                        }
                    }else{
                        user.setBanReason(null);
                    }

                    return convertToDto(userRepository.save(user));
                });
    }

    public Optional<UserDto> setModerator(Long id, boolean isModerator, Long moderatorId){
        boolean hasModerators = userRepository.findAll().stream().anyMatch(User::isModerator);
        if(hasModerators) {
            Optional<User> adminOpt = userRepository.findById(moderatorId);
            if (adminOpt.isEmpty() || !adminOpt.get().isModerator()) {
                return Optional.empty(); //you have to be a moderator to make other users moderators
            }
        }
        return userRepository.findById(id)
                .map(user -> {
                    user.setModerator(isModerator);
                    return convertToDto(userRepository.save(user));
                });
    }

    public Optional<UserDto> updateScore(Long id, float scoreChange){
        return userRepository.findById(id)
                .map(user -> {
                    user.setScore(user.getScore() + scoreChange);
                    return convertToDto(userRepository.save(user));
                });
    }

    /**
     * Update a user's reputation
     * @param id The user ID
     * @param reputationChange The amount to change (positive or negative)
     * @return Updated UserDto or empty if user not found
     */
    public Optional<UserDto> updateReputation(Long id, int reputationChange) {
        return userRepository.findById(id)
                .map(user -> {
                    Integer currentRep = user.getReputation() != null ? user.getReputation() : 0;
                    user.setReputation(currentRep + reputationChange);
                    return convertToDto(userRepository.save(user));
                });
    }

    public boolean deleteUser(Long id, Long moderatorId){
        Optional<User> moderatorOpt = this.userRepository.findById(moderatorId);
        if(moderatorOpt.isEmpty() || !moderatorOpt.get().isModerator()){
            return false; //you have to be a moderator to delete users
        }
        if(userRepository.existsById(id)){
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean authenticate(String username, String password){
        User user = userRepository.findByUsername(username).orElse(null);
        if(user == null){
            return false;
        }
        return passwordHashingService.verifyPassword(password, user.getPasswordHash());
    }

    public boolean isBanned(String username){
        return userRepository.findByUsername(username)
                .map(User::isBanned)
                .orElse(true);
    }

    public String getBanReason(String username){
        return userRepository.findByUsername(username)
                .map(User::getBanReason)
                .orElse(null);
    }

    public boolean isModerator(String username){
        return userRepository.findByUsername(username)
                .map(User::isModerator)
                .orElse(false);
    }

    private UserDto convertToDto(User user){
        UserDto dto = new UserDto();
        dto.setUserId(user.getId());
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setModerator(user.isModerator());
        dto.setScore(user.getScore());
        dto.setBanned(user.isBanned());
        dto.setBanReason(user.getBanReason());
        
        // Add new profile fields
        dto.setBio(user.getBio());
        dto.setLocation(user.getLocation());
        dto.setWebsite(user.getWebsite());
        dto.setGithub(user.getGithub());
        dto.setLinkedin(user.getLinkedin());
        dto.setTwitter(user.getTwitter());
        dto.setReputation(user.getReputation());
        dto.setBadges(user.getBadges());
        
        return dto;
    }

    public User findUserEntityById(Long id){
        if (id == null) {
            return null;
        }
        
        return userRepository.findById(id).orElse(null);
    }
}
