import React, { useState, useEffect } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import '../../../styles/components/SearchBar.css';

const SearchBar = ({ onSearch, placeholder = 'Search products...', debounceMs = 500 }) => {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, debounceMs);
        return () => clearTimeout(timer);
    }, [query, debounceMs, onSearch]);

    return (
        <InputGroup className="search-bar">
            <InputGroup.Text>
                <Search />
            </InputGroup.Text>
            <Form.Control
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </InputGroup>
    );
};

export default SearchBar;
