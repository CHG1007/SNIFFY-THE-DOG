package com.a407.sniffythedog.room.repository;


import com.a407.sniffythedog.room.entity.RoomEntity;
import org.springframework.data.repository.CrudRepository;


public interface RoomRedisRepository extends CrudRepository<RoomEntity, String> {
}
