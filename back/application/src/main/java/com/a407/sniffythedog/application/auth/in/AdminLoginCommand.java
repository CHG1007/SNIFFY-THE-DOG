package com.a407.sniffythedog.application.auth.in;

public record AdminLoginCommand(
    String id,
    String password
) {
}
