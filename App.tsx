
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Package, LogOut, Menu, X, Star, Sparkles } from 'lucide-react';
import { User as UserType, CartItem, Product, AuthStatus } from './types';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

const App: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.LOADING);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Initialize
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setAuthStatus(AuthStatus.AUTHENTICATED);
    } else {
      setAuthStatus(AuthStatus.UNAUTHENTICATED);
    }

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Sync Cart
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { productId: product.id, product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setAuthStatus(AuthStatus.UNAUTHENTICATED);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-2">
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                    <Sparkles className="text-white w-6 h-6" />
                  </div>
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                    Lumina
                  </span>
                </Link>
              </div>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-600 hover:text-indigo-600 transition font-medium">Shop</Link>
                {authStatus === AuthStatus.AUTHENTICATED ? (
                  <>
                    <Link to="/orders" className="text-gray-600 hover:text-indigo-600 transition font-medium">Orders</Link>
                    <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 transition font-medium flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition font-medium">Sign In</Link>
                )}
                <Link to="/cart" className="relative group">
                  <div className="p-2 rounded-full hover:bg-indigo-50 transition">
                    <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-indigo-600" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center space-x-4">
                <Link to="/cart" className="relative">
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-700">
                  {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Nav */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 py-4 px-4 space-y-4 shadow-xl">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 font-medium py-2">Home</Link>
              <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block text-gray-700 font-medium py-2">Orders</Link>
              {authStatus === AuthStatus.AUTHENTICATED ? (
                <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left text-red-600 font-medium py-2">Sign Out</button>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-indigo-600 font-medium py-2">Sign In</Link>
              )}
            </div>
          )}
        </nav>

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home addToCart={addToCart} />} />
            <Route path="/product/:id" element={<ProductDetail addToCart={addToCart} />} />
            <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />} />
            <Route path="/login" element={<Login setUser={setUser} setAuthStatus={setAuthStatus} />} />
            <Route path="/register" element={<Register setUser={setUser} setAuthStatus={setAuthStatus} />} />
            <Route path="/checkout" element={<Checkout cart={cart} user={user} clearCart={clearCart} />} />
            <Route path="/orders" element={<Orders user={user} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Sparkles className="text-indigo-400 w-6 h-6" />
              <span className="text-xl font-bold">Lumina Market</span>
            </div>
            <p className="text-gray-400 max-w-md mx-auto mb-8 text-sm">
              Providing modern, minimalist hardware and software accessories for the discerning digital architect.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white">About</a>
              <a href="#" className="hover:text-white">Support</a>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
            </div>
            <p className="mt-8 text-xs text-gray-600">© 2024 Lumina Market. Built with Passion.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
