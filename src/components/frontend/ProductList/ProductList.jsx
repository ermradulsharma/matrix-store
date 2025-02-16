import React, { useEffect, useState } from "react";
import { Col, Container, Pagination, Row } from "react-bootstrap";
import ProductCard from "../ProductCard/ProductCard";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);

  // const apiUrl = "https://fakestoreapi.com";
  const apiUrl = "https://fakestoreapi.in/api";
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiUrl}/products`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.products && Array.isArray(data.products)) {
          setProducts(data.products); // Adjust if products are nested under a key
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [apiUrl]);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  // Get the current page products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Handle pagination click
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate pagination items
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(products.length / productsPerPage); i++) {
    pageNumbers.push(
      <Pagination.Item
        key={i}
        active={i === currentPage}
        onClick={() => paginate(i)}
      >
        {i}
      </Pagination.Item>
    );
  }
  return (
    <Container>
      <Row className="text-center pb-5">
        <h2>Explore Our Features</h2>
        <p>Here are some amazing things you can do on our website.</p>
      </Row>
      <Row className="g-3">
        {currentProducts.map((product) => (
          <Col xs={12} sm={6} md={4} lg={3} key={product.id}>
            <ProductCard
              title={product.title}
              description={product.description}
              imageUrl={product.image}
              price={product.price}
              buttonLink={`/product/${product.id}`}
            />
          </Col>
        ))}
      </Row>
      <Row className="mt-4">
        <Col>
          <Pagination className="justify-content-center">
            {pageNumbers}
          </Pagination>
        </Col>
      </Row>
    </Container>
  );
}

export default ProductList;
