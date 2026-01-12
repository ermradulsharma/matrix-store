import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';
import '../../../styles/components/Pagination.css';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
    if (totalPages <= 1) return null;

    const handleSelect = (page) => {
        if (page !== currentPage && page >= 1 && page <= totalPages) {
            onPageChange(page);
        }
    };

    const items = [];
    const delta = 2;
    const range = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
    }
    if (currentPage - delta > 2) range.unshift('...');
    if (currentPage + delta < totalPages - 1) range.push('...');
    range.unshift(1);
    if (totalPages > 1) range.push(totalPages);

    range.forEach((page, idx) => {
        if (page === '...') {
            items.push(
                <BootstrapPagination.Ellipsis key={`ellipsis-${idx}`} disabled />
            );
        } else {
            items.push(
                <BootstrapPagination.Item
                    key={page}
                    active={page === currentPage}
                    onClick={() => handleSelect(page)}
                >
                    {page}
                </BootstrapPagination.Item>
            );
        }
    });

    return (
        <BootstrapPagination className="justify-content-center my-3">
            <BootstrapPagination.Prev
                disabled={currentPage === 1}
                onClick={() => handleSelect(currentPage - 1)}
            />
            {items}
            <BootstrapPagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handleSelect(currentPage + 1)}
            />
        </BootstrapPagination>
    );
};

export default Pagination;
