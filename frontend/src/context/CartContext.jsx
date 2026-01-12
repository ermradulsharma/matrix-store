import React, { createContext, useReducer, useEffect } from 'react';

// Define actions
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const CLEAR_CART = 'CLEAR_CART';

// Initial state loaded from localStorage
const getInitialCart = () => {
  try {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const initialState = {
  items: getInitialCart(),
};

// Reducer handling cart actions
function cartReducer(state, action) {
  switch (action.type) {
    case ADD_TO_CART: {
      const existing = state.items.find(i => i.id === action.payload.id);
      const quantityToAdd = action.payload.quantity || 1;

      if (existing) {
        // Increment quantity if already in cart
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + quantityToAdd } : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: quantityToAdd }],
      };
    }
    case REMOVE_FROM_CART:
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.payload.id),
      };
    case UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    case CLEAR_CART:
      return { ...state, items: [] };
    default:
      return state;
  }
}

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persist cart to localStorage on changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  // Helper actions
  const addToCart = (product, quantity = 1) => dispatch({ type: ADD_TO_CART, payload: { ...product, quantity } });
  const removeFromCart = id => dispatch({ type: REMOVE_FROM_CART, payload: { id } });
  const updateQuantity = (id, quantity) =>
    dispatch({ type: UPDATE_QUANTITY, payload: { id, quantity } });
  const clearCart = () => dispatch({ type: CLEAR_CART });

  const value = {
    cartItems: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount: state.items.reduce((sum, i) => sum + i.quantity, 0),
    cartTotal: state.items.reduce((sum, i) => sum + i.quantity * (i.price || 0), 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
