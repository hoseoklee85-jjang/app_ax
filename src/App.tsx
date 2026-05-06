import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import ProductManage from './pages/ProductManage';
import Login from './pages/Login';

import AdminManage from './pages/AdminManage';
import MemberManage from './pages/MemberManage';
import MemberDetail from './pages/MemberDetail';
import ProductDetail from './pages/ProductDetail';
import StoreManage from './pages/StoreManage';
import OrderManage from './pages/OrderManage';
import OrderDetail from './pages/OrderDetail';
import StorePreview from './pages/StorePreview';
import PromotionManage from './pages/PromotionManage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* 보호된 라우트들: AdminLayout 안에서 토큰 검사를 수행합니다. */}
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="stores" element={<StoreManage />} />
          <Route path="members" element={<MemberManage />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="products" element={<ProductManage />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="promotions" element={<PromotionManage />} />
          <Route path="admins" element={<AdminManage />} />
          <Route path="orders" element={<OrderManage />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="preview" element={<StorePreview />} />
        </Route>
        
        {/* 매칭되지 않는 주소는 모두 메인(또는 로그인)으로 강제 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
