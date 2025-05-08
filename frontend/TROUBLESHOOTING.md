# StackUnderflow Frontend Troubleshooting

This guide covers common issues that might arise when using the StackUnderflow frontend and how to resolve them.

## API Connection Issues

If you can log in but can't access user profiles, question details, or other functionality, it's likely due to API connectivity issues.

### Solution 1: Check Backend Server

Make sure the Spring Boot backend is running on port 8080. You can verify by accessing:
```
http://localhost:8080/questions/all
```

If this doesn't return JSON data, the backend server may not be running or configured properly.

### Solution 2: CORS Configuration

If you're seeing CORS errors in the browser console, you need to configure CORS on the backend.

Add a CORS configuration class to your Spring Boot application:

```java
package com.example.main.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow all origins, headers, and methods for development
        config.addAllowedOrigin("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### Solution 3: Use the Proxy Server

The application should now be configured to use a proxy server to handle CORS issues. If you made changes to the API configuration, restart the frontend development server:

```bash
npm start
```

## Data Not Loading

If data isn't loading but there are no obvious errors:

1. Open the browser developer console (F12) to check for errors
2. Verify that your backend API endpoints match what the frontend is expecting
3. Check that your data has the expected properties (e.g., id, title, text, authorId, etc.)

## Authentication Issues

If you're having trouble staying authenticated:

1. Check the localStorage implementation to make sure the token is being stored correctly
2. Make sure your backend authentication endpoints are returning the expected data
3. Verify that the user object is correctly structured with all expected properties

## Custom Backend URL

If your backend is running on a different port, update the API_URL in `frontend/src/services/api.js`:

```javascript
const API_URL = '/api';  // Change this to match your backend URL
```

And update the proxy target in `setupProxy.js`:

```javascript
target: 'http://localhost:8080', // Change to your backend URL
``` 