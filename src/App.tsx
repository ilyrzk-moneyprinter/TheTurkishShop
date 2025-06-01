// Admin pages
import OrderManagementPage from './pages/admin/OrderManagementPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import VouchManagementPage from './pages/admin/VouchManagementPage';
import HelpManagementPage from './pages/admin/HelpManagementPage';
import GamePriceManagementPage from './pages/admin/GamePriceManagementPage';

// ... existing code ...

{/* Admin routes */}
<Route path="/admin/help" element={
  <AdminRoute>
    <HelpManagementPage />
  </AdminRoute>
} />
<Route path="/admin/game-prices" element={
  <AdminRoute>
    <GamePriceManagementPage />
  </AdminRoute>
} /> 