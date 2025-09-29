import React from "react";
import { Carousel, Image } from "react-bootstrap";
import './CasualSlider.css'

function CasualSlider() {
    return (
        <Carousel>
            <Carousel.Item className="slider">
                <Image className="d-block w-100 slider-img" src="/assets/img/slider/slider.png" alt="First slide" />
            </Carousel.Item>

            <Carousel.Item className="slider">
                <Image className="d-block w-100 slider-img" src="/assets/img/slider/slider-2.png" alt="Second slide" />
            </Carousel.Item>

            <Carousel.Item className="slider">
                <Image className="d-block w-100 slider-img" src="/assets/img/slider/slider-3.png" alt="Third slide" />
            </Carousel.Item>

            <Carousel.Item className="slider">
                <Image className="d-block w-100 slider-img" src="/assets/img/slider/slider-4.png" alt="Third slide" />
            </Carousel.Item>

            <Carousel.Item className="slider">
                <Image className="d-block w-100 slider-img" src="/assets/img/slider/slider-5.png" alt="Third slide" />
            </Carousel.Item>

            <Carousel.Item className="slider">
                <Image className="d-block w-100 slider-img" src="/assets/img/slider/slider-6.png" alt="Third slide" />
            </Carousel.Item>
        </Carousel>
    );
}

export default CasualSlider;
