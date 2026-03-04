import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NotificationProvider, useNotifications } from './context/NotificationContext.jsx';
import socketService from './services/socketService';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import RoleSelectionPage from './pages/RoleSelectionPage.jsx';
import BusinessLoginPage from './pages/BusinessLoginPage.jsx';
import BusinessSignupPage from './pages/BusinessSignupPage.jsx';
import RecyclerLoginPage from './pages/RecyclerLoginPage.jsx';
import RecyclerSignupPage from './pages/RecyclerSignupPage.jsx';
import EmailVerificationPage from './pages/EmailVerificationPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import BusinessDashboard from './pages/BusinessDashboard.jsx';
import RecyclerDashboard from './pages/RecyclerDashboard.jsx';
import CreateWastePostPage from './pages/CreateWastePostPage.jsx';
import EditWastePostPage from './pages/EditWastePostPage.jsx';
import MyPostsPage from './pages/MyPostsPage.jsx';
import MarketplacePage from './pages/MarketplacePage.jsx';
import RequestCollectionPage from './pages/RequestCollectionPage.jsx';
import CollectionsPage from './pages/CollectionsPage.jsx';
import ScheduleCollectionPage from './pages/ScheduleCollectionPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import ConversationPage from './pages/ConversationPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import WastePostDetailsPage from './pages/WastePostDetailsPage.jsx';
import EditProfilePage from './pages/EditProfilePage.jsx';
import ApprovedCollectionsPage from './pages/ApprovedCollectionsPage.jsx';
import PendingApprovalsPage from './pages/PendingApprovalsPage.jsx';
import ManageCollectionRequestsPage from './pages/ManageCollectionRequestsPage.jsx';
import CollectionDetailPage from './pages/CollectionDetailPage.jsx';
import AdminCategoriesPage from './pages/AdminCategoriesPage.jsx';
import AdminSystemLogsPage from './pages/AdminSystemLogsPage.jsx';
import AdminReportsPage from './pages/AdminReportsPage.jsx';
import AdminUserManagementPage from './pages/AdminUserManagementPage.jsx';
import AdminRatingsPage from './pages/AdminRatingsPage.jsx';
import UserReportsPage from './pages/UserReportsPage.jsx';

// Component to set up socket connection when user is authenticated
const AppContent = () => {
  const { user, token } = useAuth();
  const { handleNewNotification } = useNotifications();
  const notificationListenerRef = React.useRef(false);

  useEffect(() => {
    if (user && token) {
      console.log('🔌 [APP] Socket connection triggered');
      console.log('🔌 [APP] User:', user.email || user.businessName);
      console.log('🔌 [APP] Token preview:', token.substring(0, 30) + '...');
      
      // Connect socket when user logs in
      const socket = socketService.connect(token);
      console.log('🔌 [APP] Socket returned:', !!socket);

      // Listen for new notifications (only register listener once)
      if (!notificationListenerRef.current) {
        socketService.onNotification((notification) => {
          console.log('📬 New notification received:', notification);
          handleNewNotification(notification);
        });
        notificationListenerRef.current = true;
      }

      return () => {
        // Don't disconnect on unmount, as we need socket throughout the app
      };
    }
  }, [user, token]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/role-selection" element={<RoleSelectionPage />} />
      
      {/* Auth Routes */}
      <Route path="/business/login" element={<BusinessLoginPage />} />
      <Route path="/business/signup" element={<BusinessSignupPage />} />
      <Route path="/recycler/login" element={<RecyclerLoginPage />} />
      <Route path="/recycler/signup" element={<RecyclerSignupPage />} />
      <Route path="/email-verification" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Business Dashboard */}
      <Route 
        path="/business/dashboard" 
        element={
          <ProtectedRoute requiredRole="business">
            <BusinessDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Waste Post Routes (Phase 1) */}
      <Route 
        path="/waste-post/create" 
        element={
          <ProtectedRoute requiredRole="business">
            <CreateWastePostPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/waste-post/edit/:postId" 
        element={
          <ProtectedRoute requiredRole="business">
            <EditWastePostPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/waste-post/:postId" 
        element={<WastePostDetailsPage />}
      />
      <Route 
        path="/business/posts" 
        element={
          <ProtectedRoute requiredRole="business">
            <MyPostsPage />
          </ProtectedRoute>
        } 
      />
      <Route path="/marketplace" element={<MarketplacePage />} />
      
      {/* Collection Routes (Phase 2) */}
      <Route path="/collections" element={<CollectionsPage />} />
      <Route 
        path="/collection/request/:postId" 
        element={
          <ProtectedRoute requiredRole="recycler">
            <RequestCollectionPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/collection/schedule/:collectionId" 
        element={
          <ProtectedRoute requiredRole="business">
            <ScheduleCollectionPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/collection/:collectionId" 
        element={<CollectionDetailPage />}
      />
      
      {/* Messaging Routes (Phase 3) */}
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/messages/:conversationId" element={<ConversationPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      
      {/* Edit Profile Route (Both Business & Recycler) */}
      <Route 
        path="/edit-profile" 
        element={<EditProfilePage />}
      />
      
      {/* Recycler Dashboard */}
      <Route 
        path="/recycler/dashboard" 
        element={
          <ProtectedRoute requiredRole="recycler">
            <RecyclerDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Recycler Approved Collections */}
      <Route 
        path="/recycler/approved-collections" 
        element={
          <ProtectedRoute requiredRole="recycler">
            <ApprovedCollectionsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Business Pending Approvals */}
      <Route 
        path="/business/pending-approvals" 
        element={
          <ProtectedRoute requiredRole="business">
            <PendingApprovalsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Business Manage Collection Requests */}
      <Route 
        path="/business/collection-requests" 
        element={
          <ProtectedRoute requiredRole="business">
            <ManageCollectionRequestsPage />
          </ProtectedRoute>
        } 
      />

      {/* Admin Pages - Phase 4 Features */}
      <Route 
        path="/admin/categories" 
        element={
          <ProtectedRoute>
            <AdminCategoriesPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/logs" 
        element={
          <ProtectedRoute>
            <AdminSystemLogsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/reports" 
        element={
          <ProtectedRoute>
            <AdminReportsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute>
            <AdminUserManagementPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin/ratings" 
        element={
          <ProtectedRoute>
            <AdminRatingsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* User Reports Page */}
      <Route 
        path="/my-reports" 
        element={
          <ProtectedRoute>
            <UserReportsPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
