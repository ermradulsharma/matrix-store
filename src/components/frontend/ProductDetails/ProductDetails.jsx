import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Col, Container, Image, Row } from "react-bootstrap";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container className="mx-auto">
        <Row className="pt-5 mx-auto">
            <Col xs={12} sm={6} md={4} lg={3} className="text-center">
            <Image src={product.image} alt={product.title} style={{ width: "300px" }} />
            </Col>
            <Col xs={12} sm={6} md={8} lg={9}>
            <h1>{product.title}</h1>
            <p>{product.description}</p>
            <h3>${product.price.toFixed(2)}</h3>
            </Col>
        </Row>
      
    </Container>
  );
}

export default ProductDetails;
