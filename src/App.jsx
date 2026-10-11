import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Providers
import { SettingsProvider } from './context/SettingsContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { OrderProvider } from './context/OrderContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { MemoryCartProvider } from './context/MemoryCartContext';
import { FutureCartProvider } from './context/FutureCartContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { useAppEvents } from './hooks/useAppEvents';
import { ReviewProvider } from './context/ReviewContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SettingsModal from './components/SettingsModal';
import GoogleSignInModal from './components/GoogleSignInModal';
import ReturnRequestModal from './components/ReturnRequestModal';
import Chatbot from './components/Chatbot';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AccountCreatedPage from './pages/AccountCreatedPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import MemoryCartPage from './pages/MemoryCartPage';
import MemoryCartReminderPage from './pages/MemoryCartReminderPage';
import MemoryCartPriceAlertPage from './pages/MemoryCartPriceAlertPage';
import FutureCartPage from './pages/FutureCartPage';
import FutureCartMonthPage from './pages/FutureCartMonthPage';
import FutureCartDashboardPage from './pages/FutureCartDashboardPage';
import FutureCartRecommendationsPage from './pages/FutureCartRecommendationsPage';
import FutureCartDealAlertPage from './pages/FutureCartDealAlertPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="fm-app-root">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}

      <div className="fm-main-content">
        <ErrorBoundary>
          <Routes>
            {/* Public Storefront & Browsing: Visitors can directly browse HomePage, Shop, and Categories! */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/account-created" element={<AccountCreatedPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Catalog & Store Browsing (Public Browsing, auth required on actions/details) */}
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />

            {/* Seller / Admin Portal */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminProtectedRoute><AdminDashboardPage /></AdminProtectedRoute>} />

            {/* Memory Cart Suite (Protected) */}
            <Route path="/memory-cart" element={<ProtectedRoute><MemoryCartPage /></ProtectedRoute>} />
            <Route path="/memory-cart/reminders" element={<ProtectedRoute><MemoryCartReminderPage /></ProtectedRoute>} />
            <Route path="/memory-cart/price-alerts" element={<ProtectedRoute><MemoryCartPriceAlertPage /></ProtectedRoute>} />

            {/* Future Cart Suite (Protected) */}
            <Route path="/future-cart" element={<ProtectedRoute><FutureCartPage /></ProtectedRoute>} />
            <Route path="/future-cart/month" element={<ProtectedRoute><FutureCartMonthPage /></ProtectedRoute>} />
            <Route path="/future-cart/dashboard" element={<ProtectedRoute><FutureCartDashboardPage /></ProtectedRoute>} />
            <Route path="/future-cart/recommendations" element={<ProtectedRoute><FutureCartRecommendationsPage /></ProtectedRoute>} />
            <Route path="/future-cart/deal-alerts" element={<ProtectedRoute><FutureCartDealAlertPage /></ProtectedRoute>} />

            {/* User Commerce & Account Settings */}
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
            <Route path="/order-history" element={<ProtectedRoute><OrderHistoryPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<Navigate to="/profile?tab=settings" replace />} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            {/* Catch-all fallback */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </ErrorBoundary>
      </div>

      {!isAdminRoute && <Footer />}

      {/* Global Features: Settings, Google Auth, 7-days Return Wizard & Tanglish Chatbot */}
      <SettingsModal />
      <GoogleSignInModal />
      <ReturnRequestModal />
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "109886749320-f4q6c013vvt07g5g88j4m2ov4m99q33c.apps.googleusercontent.com"}>
      <SettingsProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <OrderProvider>
                <CartProvider>
                  <WishlistProvider>
                    <MemoryCartProvider>
                      <FutureCartProvider>
                        <AdminAuthProvider>
                          <ReviewProvider>
                          <AppContent />
                        </ReviewProvider>
                        </AdminAuthProvider>
                      </FutureCartProvider>
                    </MemoryCartProvider>
                  </WishlistProvider>
                </CartProvider>
              </OrderProvider>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </SettingsProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
