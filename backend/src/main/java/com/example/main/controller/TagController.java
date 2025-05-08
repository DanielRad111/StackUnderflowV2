package com.example.main.controller;

import com.example.main.dto.TagDto;
import com.example.main.model.Tag;
import com.example.main.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tag")
public class TagController {
    @Autowired
    private TagService tagService;

    @GetMapping("/all")
    public ResponseEntity<List<TagDto>> getAllTags(){
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<TagDto> getTagById(@PathVariable Long id) {
        return tagService.getTagById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<TagDto> getTagByName(@PathVariable String name) {
        return tagService.getTagByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create")
    public ResponseEntity<TagDto> createTag(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");

        if (name == null) {
            return ResponseEntity.badRequest().build();
        }

        TagDto createdTag = tagService.createTag(name);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTag);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<TagDto> updateTag(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String name = body.get("name");

        if (name == null) {
            return ResponseEntity.badRequest().build();
        }

        return tagService.updateTag(id, name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        if (tagService.deleteTag(id)) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
