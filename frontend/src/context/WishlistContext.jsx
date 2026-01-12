import React, { createContext, useReducer, useEffect } from 'react';

// Wishlist actions
const ADD_TO_WISHLIST = 'ADD_TO_WISHLIST';
const REMOVE_FROM_WISHLIST = 'REMOVE_FROM_WISHLIST';
const CLEAR_WISHLIST = 'CLEAR_WISHLIST';

// Load initial wishlist from localStorage
const getInitialWishlist = () => {
    try {
        const stored = localStorage.getItem('wishlist');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

const initialState = {
    items: getInitialWishlist(),
};

function wishlistReducer(state, action) {
    switch (action.type) {
        case ADD_TO_WISHLIST:
            if (state.items.find(i => i.id === action.payload.id)) {
                return state; // already in wishlist
            }
            return { ...state, items: [...state.items, action.payload] };
        case REMOVE_FROM_WISHLIST:
            return { ...state, items: state.items.filter(i => i.id !== action.payload.id) };
        case CLEAR_WISHLIST:
            return { ...state, items: [] };
        default:
            return state;
    }
}

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [state, dispatch] = useReducer(wishlistReducer, initialState);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(state.items));
    }, [state.items]);

    // Helper actions
    const addToWishlist = product => dispatch({ type: ADD_TO_WISHLIST, payload: product });
    const removeFromWishlist = id => dispatch({ type: REMOVE_FROM_WISHLIST, payload: { id } });
    const clearWishlist = () => dispatch({ type: CLEAR_WISHLIST });

    const value = {
        wishlistItems: state.items,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        wishlistCount: state.items.length,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
