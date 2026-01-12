import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { fetchCategories } from '../../../services/api';
import '../../../styles/components/CategoryFilter.css';

const CategoryFilter = ({ onCategoryChange }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                setCategories(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to load categories:', error);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    const handleChange = (e) => {
        onCategoryChange(e.target.value);
    };

    const getCategoryName = (cat) => {
        if (typeof cat === 'string') {
            return cat;
        }
        if (typeof cat === 'object' && cat !== null) {
            return cat.name || cat.slug || cat.category || String(cat);
        }
        return String(cat);
    };

    const formatCategoryName = (name) => {
        if (!name) return '';
        const str = String(name);
        return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
    };

    return (
        <Form.Select onChange={handleChange} disabled={loading} className="category-filter">
            <option value="">All Categories</option>
            {categories.map((cat, index) => {
                const categoryName = getCategoryName(cat);
                return (
                    <option key={index} value={categoryName}>
                        {formatCategoryName(categoryName)}
                    </option>
                );
            })}
        </Form.Select>
    );
};

export default CategoryFilter;
