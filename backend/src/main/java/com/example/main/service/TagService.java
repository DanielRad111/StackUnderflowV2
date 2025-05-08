package com.example.main.service;

import com.example.main.dto.TagDto;
import com.example.main.model.Tag;
import com.example.main.repository.TagRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TagService {
    @Autowired
    private TagRepository tagRepository;

    public List<TagDto> getAllTags(){
        return tagRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<TagDto> getTagById(Long id){
        return tagRepository.findById(id).map(this::convertToDto);
    }

    public Optional<TagDto> getTagByName(String name){
        return tagRepository.findByName(name).map(this::convertToDto);
    }

    public TagDto createTag(String name){
        Tag tag = new Tag();
        tag.setName(name);

        Tag savedTag = tagRepository.save(tag);
        return convertToDto(savedTag);
    }

    public Optional<TagDto> updateTag(Long id, String name){
        return tagRepository.findById(id)
                .map(tag -> {
                   tag.setName(name);
                   return convertToDto(tagRepository.save(tag));
                });
    }

    public boolean deleteTag(Long id){
        if(tagRepository.existsById(id)){
            tagRepository.deleteById(id);
            return true;
        }
        return false;
    }

     public Tag findOrCreateTag(String name){
        return tagRepository.findByName(name)
                .orElseGet(()->{
                    Tag newTag = new Tag();
                    newTag.setName(name);
                    return tagRepository.save(newTag);
                });
     }

     public Optional<Tag> findTagEntityByName(String name){
        return tagRepository.findByName(name);
     }

    private TagDto convertToDto(Tag tag) {
        TagDto dto = new TagDto();
        dto.setTagId(tag.getTagId());
        dto.setName(tag.getName());
        return dto;
    }

    public Tag findTagEntityById(Long tagId) {
         return tagRepository.findById(tagId).orElse(null);
    }
}

