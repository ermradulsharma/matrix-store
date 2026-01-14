import React, { createContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  syncCart
} from '../services/api';

// Define actions
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';
const UPDATE_QUANTITY = 'UPDATE_QUANTITY';
const CLEAR_CART = 'CLEAR_CART';
const SET_CART = 'SET_CART';

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
    case SET_CART:
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  // Persist cart to localStorage on changes (always, for redundancy/guest)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  // Sync with backend on login
  useEffect(() => {
    const syncBackend = async () => {
      if (user) {
        try {
          // Sync local items to backend
          // Map local items to expected backend format if needed. 
          // Backend expects array of objects. Local state has full product objects.
          // We send what we have, controller handles it.
          // Actually controller expects { items: [{ product: id, quantity }] } or similar.
          // Our local items have 'id' which is product ID.
          const itemsToSync = state.items.map(item => ({
            product: item.id || item._id || item.product, // ensure ID
            quantity: item.quantity
          }));

          const syncedCart = await syncCart(itemsToSync);

          // Backend returns populated items: { product: {...}, quantity }
          // Frontend expects: { id: ..., name: ..., price: ..., quantity: ... } (flat object usually, based on AddToCart)
          // We need to normalize standard backend cart response to frontend structure.

          const normalizedCart = syncedCart.map(item => ({
            ...item.product, // Spread product details
            product: item.product._id, // Keep reference
            image: item.product.images?.[0] || item.product.image, // Handle image structure variation
            quantity: item.quantity
          }));

          dispatch({ type: SET_CART, payload: normalizedCart });
        } catch (error) {
          console.error("Failed to sync cart:", error);
        }
      }
    };
    syncBackend();
    // eslint-disable-next-line
  }, [user]); // Run when user logs in

  // Helper actions
  const addToCart = async (product, quantity = 1) => {
    // Optimistic update
    dispatch({ type: ADD_TO_CART, payload: { ...product, quantity } });

    if (user) {
      try {
        await addItemToCart(product.id || product._id, quantity);
      } catch (error) {
        console.error("Failed to add to backend cart", error);
        // potentially rollback?
      }
    }
  };

  const removeFromCart = async (id) => {
    dispatch({ type: REMOVE_FROM_CART, payload: { id } });
    if (user) {
      try {
        await removeItemFromCart(id);
      } catch (error) {
        console.error("Failed to remove from backend cart", error);
      }
    }
  };

  const updateQuantity = async (id, quantity) => {
    dispatch({ type: UPDATE_QUANTITY, payload: { id, quantity } });
    if (user) {
      try {
        await updateCartItemQuantity(id, quantity);
      } catch (error) {
        console.error("Failed to update backend cart quantity", error);
      }
    }
  };

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
