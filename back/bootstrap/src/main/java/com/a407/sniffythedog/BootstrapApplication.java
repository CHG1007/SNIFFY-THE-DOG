package com.a407.sniffythedog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(scanBasePackages = "com.a407.sniffythedog", exclude = {
		UserDetailsServiceAutoConfiguration.class })
public class BootstrapApplication {
	public static void main(String[] args) {
		SpringApplication.run(BootstrapApplication.class, args);
	}
}
