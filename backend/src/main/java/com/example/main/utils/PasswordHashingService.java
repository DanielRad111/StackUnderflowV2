package com.example.main.utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashingService {
    private final BCryptPasswordEncoder passwordEncoder;

    private static final int BCRYPT_STRENGTH = 12;

    public PasswordHashingService(){
        this.passwordEncoder = new BCryptPasswordEncoder(BCRYPT_STRENGTH);
    }

    public String hashPassword(String password){
        return passwordEncoder.encode(password);
    }

    public boolean verifyPassword(String password, String hashedPassword){
        return passwordEncoder.matches(password,hashedPassword);
    }
}
