import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProductListPage from './pages/products/ProductListPage';
import CartPage from './pages/cart/CartPage';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/products/AdminProducts';
import AdminProductForm from './pages/admin/products/AdminProductForm';
import AdminCategories from './pages/admin/categories/AdminCategories';
import AdminOrders from './pages/admin/orders/AdminOrders';
import AdminUsers from './pages/admin/users/AdminUsers';
import authService from './api/authService';
import CategoriesPage from './pages/products/CategoriesPage';
import ProductPage from './pages/ProductPage';
import { OrderPage } from './pages/OrderPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';

// Компонент для захищених маршрутів (лише для адміністратора)
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const isAdmin = authService.isAdmin();
  
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Компонент для захищених маршрутів (для авторизованих користувачів)
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Публічні маршрути */}
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/login" element={<Layout><LoginPage /></Layout>} />
      <Route path="/register" element={<Layout><RegisterPage /></Layout>} />
      <Route path="/products" element={<Layout><ProductListPage /></Layout>} />
      <Route path="/cart" element={<Layout><CartPage /></Layout>} />
      <Route path="/order" element={<Layout><OrderPage /></Layout>} />
      <Route path="/categories" element={<Layout><CategoriesPage /></Layout>} />
      <Route path="/categories/:categoryId" element={<Layout><ProductListPage /></Layout>} />
      <Route path="/products/:id" element={<ProductPage />} />
      
      {/* Захищені маршрути для користувачів */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout><ProfilePage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/my-orders" element={
        <ProtectedRoute>
          <MyOrdersPage />
        </ProtectedRoute>
      } />
      <Route path="/order-success/:id" element={
        <ProtectedRoute>
          <OrderSuccessPage />
        </ProtectedRoute>
      } />
      
      {/* Адміністративні маршрути */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout title="Панель управління" subtitle="Огляд показників та статистики магазину">
            <AdminDashboard />
          </AdminLayout>
        </AdminRoute>
      } />
      <Route path="/admin/products" element={
        <AdminRoute>
          <AdminLayout title="Управління товарами" subtitle="Додавання та редагування товарів">
            <AdminProducts />
          </AdminLayout>
        </AdminRoute>
      } />
      <Route path="/admin/products/add" element={
        <AdminRoute>
          <AdminLayout title="Додавання нового товару" subtitle="Створення нового товару в каталозі">
            <AdminProductForm />
          </AdminLayout>
        </AdminRoute>
      } />
      <Route path="/admin/products/edit/:id" element={
        <AdminRoute>
          <AdminLayout title="Редагування товару" subtitle="Зміна параметрів існуючого товару">
            <AdminProductForm />
          </AdminLayout>
        </AdminRoute>
      } />
      <Route path="/admin/categories" element={
        <AdminRoute>
          <AdminLayout title="Категорії товарів" subtitle="Управління категоріями товарів">
            <AdminCategories />
          </AdminLayout>
        </AdminRoute>
      } />
      <Route path="/admin/orders" element={
        <AdminRoute>
          <AdminLayout title="Замовлення" subtitle="Перегляд та управління замовленнями">
            <AdminOrders />
          </AdminLayout>
        </AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <AdminLayout title="Користувачі" subtitle="Управління користувачами системи">
            <AdminUsers />
          </AdminLayout>
        </AdminRoute>
      } />
    </Routes>
  );
};

export default AppRoutes; 