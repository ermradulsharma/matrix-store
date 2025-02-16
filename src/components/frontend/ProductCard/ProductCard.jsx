import React from "react";
import { Button, Card } from "react-bootstrap";

function ProductCard({ title, description, imageUrl, price, buttonLink }) {
  return (
    <Card>
      <Card.Img variant="top" src={imageUrl} alt={title} height={239} style={{ objectFit:"contain" }} className="p-3" />
      <Card.Body className="text-center">
        <Card.Title className="fw-bold" style={{ fontSize: "16px", minHeight: "39px"}}>{title.length > 45 ? `${title.substring(0, 45)}...` : title }</Card.Title>
        <Card.Text style={{ fontSize: "12px", fontWeight: "normal", minHeight: "55px"}}>{description.length > 70 ? `${description.substring(0, 70)}...` : description}</Card.Text>
        <Button variant="primary" href={buttonLink}>{ 'Details' }</Button>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
