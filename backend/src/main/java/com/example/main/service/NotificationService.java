package com.example.main.service;

import com.example.main.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    @Autowired
    private JavaMailSender javaMailSender;

    public void sendBanNotification(User user, String reason){
        if(user.getEmail() != null && !user.getEmail().isEmpty()){
            sendEmailNotification(user, reason);
        }

        if(user.getPhoneNumber() != null && !user.getPhoneNumber().isEmpty()){
            sendSmsNotification(user, reason);
        }
    }

    private void sendEmailNotification(User user, String reason){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("You have been banned");
        message.setText("You have been banned from the platform for the following reason: " + reason);

        try{
            javaMailSender.send(message);
        }catch (Exception e){
            System.err.println("Failed to send ban email notification: " + e.getMessage());
        }
    }

    private void sendSmsNotification(User user, String reason) {
        String messageText = "StackUnderflow: Your account has been banned. " +
                "Reason: " + (reason != null ? reason : "No reason specified") +
                ". Check your email for details.";

        try {
            // Implement SMS sending logic here
            // Example with Twilio:
            // twilioClient.sendSms(user.getPhoneNumber(), messageText);

            // For now, just log it
            System.out.println("SMS would be sent to " + user.getPhoneNumber() + ": " + messageText);
        } catch (Exception e) {
            // Log the exception but don't fail the ban process
            System.err.println("Failed to send ban SMS notification: " + e.getMessage());
        }
    }
}
