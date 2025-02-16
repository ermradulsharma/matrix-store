import React from "react";
import { Carousel, Image } from "react-bootstrap";
import './CasualSlider.css'

function CasualSlider() {
  return (
    <Carousel>
      <Carousel.Item className="slider">
        <Image className="d-block w-100" height={ 520 } src="/assets/img/slider/slider-1.jpg" alt="First slide" />
        <Carousel.Caption>
            <h3>First Slide</h3>
            <p>This is a simple caption for the first slide.</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item className="slider">
        <Image className="d-block w-100" height={ 520 } src="/assets/img/slider/slider-2.jpg" alt="Second slide" />
        <Carousel.Caption>
            <h3>Second Slide</h3>
            <p>This is a simple caption for the second slide.</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item className="slider">
        <Image className="d-block w-100" height={ 520 } src="/assets/img/slider/slider-3.jpg" alt="Third slide" />
        <Carousel.Caption>
            <h3>Third Slide</h3>
            <p>This is a simple caption for the third slide.</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default CasualSlider;
