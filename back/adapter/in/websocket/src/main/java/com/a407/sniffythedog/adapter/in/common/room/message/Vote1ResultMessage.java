package com.a407.sniffythedog.adapter.in.common.room.message;

public record Vote1ResultMessage(String type, long version, Long accusedUserId, boolean isTie) {}
