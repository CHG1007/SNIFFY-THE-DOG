package com.a407.sniffythedog.adapter.in.http.gamelog.request;

import java.util.List;
import java.util.Map;

public record GmsRequest(String model, List<Map<String, String>> messages) {
}
