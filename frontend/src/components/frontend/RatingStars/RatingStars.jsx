import React from 'react';
import '../../../styles/components/RatingStars.css';

const RatingStars = ({ rating = 0, size = '1rem' }) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    const starStyle = { width: size, height: size, marginRight: '2px' };

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
        stars.push(
            <svg
                key={`full-${i}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-warning"
                style={starStyle}
            >
                <path d="M12 .587l3.668 7.568L24 9.423l-6 5.847 1.416 8.27L12 18.896l-7.416 4.644L6 15.27 0 9.423l8.332-1.268z" />
            </svg>
        );
    }
    if (hasHalf) {
        stars.push(
            <svg
                key="half"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-warning"
                style={starStyle}
            >
                <path d="M12 .587l3.668 7.568L24 9.423l-6 5.847 1.416 8.27L12 18.896V.587z" />
            </svg>
        );
    }
    for (let i = 0; i < emptyStars; i++) {
        stars.push(
            <svg
                key={`empty-${i}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-muted"
                style={starStyle}
            >
                <path d="M12 .587l3.668 7.568L24 9.423l-6 5.847 1.416 8.27L12 18.896l-7.416 4.644L6 15.27 0 9.423l8.332-1.268z" />
            </svg>
        );
    }

    return <div className="rating-stars d-flex align-items-center">{stars}</div>;
};

export default RatingStars;
