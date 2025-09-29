import React from "react";
import { Carousel, Image } from "react-bootstrap";
import "./CasualSlider.css";

function CasualSlider() {
    const slides = [
        { src: "/assets/img/slider/slider.png", alt: "First slide" },
        { src: "/assets/img/slider/slider-2.png", alt: "Second slide" },
        { src: "/assets/img/slider/slider-3.png", alt: "Third slide" },
        { src: "/assets/img/slider/slider-4.png", alt: "Fourth slide" },
        { src: "/assets/img/slider/slider-5.png", alt: "Fifth slide" },
        { src: "/assets/img/slider/slider-6.png", alt: "Sixth slide" },
    ];

    return (
        <Carousel indicators={false} controls={false} interval={3000}>
            {slides.map((slide, index) => (
                <Carousel.Item className="slider" key={index}>
                    <Image className="d-block w-100 slider-img" src={slide.src} alt={slide.alt} loading={index === 0 ? "eager" : "lazy"} fluid />
                </Carousel.Item>
            ))}
        </Carousel>
    );
}
export default CasualSlider;
