package com.a407.sniffythedog.adapter.out.mongo.gamelog.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoRepositories(basePackages = "com.a407.sniffythedog")
public class MongoConfig {
}