import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";

function SideBar({ filters, setFilters }) {
  const [categories, setCategories] = useState([]);
  const apiUrl = "https://fakestoreapi.in/api";
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiUrl}/products/category`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setCategories(data);
        } else if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <div className="p-3">
      <h3>Filters</h3>
      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Control as="select" name="category" value={filters.category} onChange={handleFilterChange}>
          <option value="">All</option>
          {Array.isArray(categories) && categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Price Range</Form.Label>
        <Form.Control as="select" name="priceRange" value={filters.priceRange} onChange={handleFilterChange}>
          <option value="">All</option>
          <option value="low">Below $50</option>
          <option value="medium">$50 - $100</option>
          <option value="high">Above $100</option>
        </Form.Control>
      </Form.Group>
    </div>
  );
}

export default SideBar;
