import React, { useEffect, useState } from "react";
import { Col, Container, Pagination, Row } from "react-bootstrap";
import SideBar from "../../components/frontend/SideBar/SideBar";
import ProductCard from "../../components/frontend/ProductCard/ProductCard";

function Product() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(8);
  const [filters, setFilters] = useState({ category: "", priceRange: "" });

  // const apiUrl = "https://fakestoreapi.com";
  const apiUrl = "https://fakestoreapi.in/api";
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${apiUrl}/products?limit=150`);
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
        // setProducts(data);
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

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !filters.category || product.category === filters.category;
    const matchesPrice =
      !filters.priceRange ||
      (filters.priceRange === "low" && product.price < 50) ||
      (filters.priceRange === "medium" &&
        product.price >= 50 &&
        product.price <= 100) ||
      (filters.priceRange === "high" && product.price > 100);
    return matchesCategory && matchesPrice;
  });

  // Get the current page products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Handle pagination click
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate pagination items
  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(filteredProducts.length / productsPerPage);
    i++
  ) {
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
    <Container fluid className="ps-lg-0">
      <Row>
        <Col xs={12} sm={12} md={12} lg={3}>
          <SideBar filters={filters} setFilters={setFilters} />
        </Col>
        <Col xs={12} sm={12} md={12} lg={9} className="pt-lg-5 pt-3" style={{ border: "1px solid #ddd" }}>
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
        </Col>
      </Row>
    </Container>
  );
}

export default Product;
