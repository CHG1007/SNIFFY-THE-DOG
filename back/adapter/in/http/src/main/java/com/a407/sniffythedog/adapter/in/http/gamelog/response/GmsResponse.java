package com.a407.sniffythedog.adapter.in.http.gamelog.response;

import java.util.List;

public record GmsResponse(List<Choice> choices) {
    public record Choice(Message message) {}
    public record Message(String content) {}
}
