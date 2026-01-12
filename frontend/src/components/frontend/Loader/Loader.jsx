import React from 'react';
import { Spinner } from 'react-bootstrap';
import '../../../styles/components/Loader.css';

/**
 * Loader component displays a centered spinner.
 * Use it while data is being fetched or during async operations.
 */
const Loader = () => (
    <div className="loader-container">
        <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </div>
);

export default Loader;
