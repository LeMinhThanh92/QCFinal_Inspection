package com.trax.sampleroomdigital.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Map /ImageQCFINAL/** to the absolute path of ./uploads/ImageQCFINAL/
        String resourcePath = java.nio.file.Paths.get("./uploads/ImageQCFINAL").toAbsolutePath().toUri().toString();
        
        registry.addResourceHandler("/ImageQCFINAL/**")
                .addResourceLocations(resourcePath);
    }
}
