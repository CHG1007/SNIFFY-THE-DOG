package com.a407.sniffythedog.adapter.out.mongo.gamelog.repository;

import com.a407.sniffythedog.adapter.out.mongo.gamelog.document.GameLogDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface GameLogMongoRepository extends MongoRepository<GameLogDocument, String> {

    Optional<GameLogDocument> findByRoomId(String roomId);
}
