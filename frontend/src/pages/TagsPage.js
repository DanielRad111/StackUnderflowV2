import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, InputGroup, FormControl } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { tagService } from '../services/api';

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        console.log("Fetching all tags");
        const response = await tagService.getAllTags();
        console.log("Tags response:", response);
        
        const tagsData = response.data || [];
        console.log("Tags data:", tagsData);
        
        setTags(tagsData);
        setFilteredTags(tagsData);
        setError(null);
      } catch (err) {
        console.error('Error details:', err.response || err);
        setError('Failed to load tags. Please try again later.');
        console.error('Error fetching tags:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTags(tags);
    } else {
      const filtered = tags.filter(tag => 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTags(filtered);
    }
  }, [searchQuery, tags]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) {
    return <Container className="py-5 text-center">Loading...</Container>;
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Tags</h1>
      <p className="mb-4">
        A tag is a keyword or label that categorizes your question with other, similar questions.
        Using the right tags helps others find and answer your question.
      </p>
      
      <InputGroup className="mb-4">
        <FormControl
          placeholder="Filter by tag name"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </InputGroup>
      
      {filteredTags.length === 0 ? (
        <div className="text-center py-5">
          <p>No tags found matching your criteria.</p>
        </div>
      ) : (
        <Row>
          {filteredTags.map(tag => (
            <Col md={4} sm={6} key={tag.id} className="mb-4">
              <Card>
                <Card.Body>
                  <Badge
                    as={Link}
                    to={`/tags/${tag.name}`}
                    bg="secondary"
                    className="tag-badge text-decoration-none mb-2"
                    style={{ fontSize: '1.1rem' }}
                  >
                    {tag.name}
                  </Badge>
                  
                  <Card.Text className="text-muted">
                    {tag.questionCount || 0} questions
                  </Card.Text>
                  
                  {tag.description && (
                    <Card.Text className="mt-2">
                      {tag.description.length > 100 
                        ? `${tag.description.substring(0, 100)}...`
                        : tag.description}
                    </Card.Text>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default TagsPage; 