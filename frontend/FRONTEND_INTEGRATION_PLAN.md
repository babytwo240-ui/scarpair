# Frontend Integration Plan - Scrapair

## Current Status
- Basic routing and auth context ✅
- Simple API client ✅
- Incomplete services
- Basic dashboard stubs

## Implementation Roadmap

### PHASE 1: API Services Overhaul

#### 1.1 Update/Create Service Files

**Priority 1: Core Services**
```
✅ api.js - Axios client with interceptors (EXISTS - good)
❌ authService.js - NEEDS: email verification, password reset, profile management
❌ wastePostService.js - CREATE NEW: for waste posts (replace materialService)
❌ collectionService.js - CREATE NEW: for Phase 2 collection workflow
❌ messageService.js - CREATE NEW: for messaging and notifications
❌ imageService.js - CREATE NEW: for image uploads
```

**Priority 2: WebSocket Service**
```
❌ socketService.js - CREATE NEW: Socket.io for real-time messaging
```

---

### PHASE 2: Service Implementation Details

#### 2.1 authService.js (Update)
```javascript
// EXISTING
- businessSignup ✅
- businessLogin ✅
- recyclerSignup ✅
- recyclerLogin ✅

// ADD
- verifyEmail(code)
- resendVerification(email)
- forgotPassword(email)
- resetPassword(token, newPassword)
- changePassword(oldPassword, newPassword)
- getProfile()
- updateProfile(data)
- logout()
```

#### 2.2 wastePostService.js (CREATE NEW)
```javascript
// CRUD Operations
- createWastePost(data)                    // POST /waste-posts
- updateWastePost(id, data)                // PUT /waste-posts/:id
- deleteWastePost(id)                      // DELETE /waste-posts/:id
- getWastePostById(id)                     // GET /waste-posts/:id
- getUserWastePosts()                      // GET /waste-posts/user/all
- getMarketplace(filters)                  // GET /waste-posts (with filters)
- getNearbyMaterials(latitude, longitude)  // GET /waste-posts/nearby?lat&lon
- activateWastePost(id)                    // POST /waste-posts/:id/activate
- getPostStatus(id)                        // GET /waste-posts/:id/status

// Search & Filter
- searchMaterials(query)
- filterByType(type)
- filterByCondition(condition)
- filterByCity(city)
```

#### 2.3 collectionService.js (CREATE NEW)
```javascript
// Collection Requests
- requestCollection(postId, recyclerId)    // POST /collections
- getCollectionRequests()                  // GET /collections/requests
- approveCollection(collectionId)          // PUT /collections/:id/approve
- getCollectionDetails(id)                 // GET /collections/:id

// Scheduling & Status
- scheduleCollection(collectionId, data)   // PATCH /collections/:id/schedule
- confirmPickup(collectionId)              // PATCH /collections/:id/confirm
- acceptMaterials(collectionId)            // PATCH /collections/:id/accept

// History
- getUserCollections()                     // GET /collections/user/all
```

#### 2.4 messageService.js (CREATE NEW)
```javascript
// Conversations
- startConversation(participantId, wastePostId)  // POST /conversations
- getConversations()                             // GET /conversations
- getConversationMessages(conversationId)       // GET /messages?conversationId

// Messages
- sendMessage(conversationId, content, imageUrl)  // POST /messages
- editMessage(messageId, content)                 // PUT /messages/:id
- deleteMessage(messageId)                        // DELETE /messages/:id

// Notifications
- getNotifications()                      // GET /notifications
- markNotificationRead(id)                // PATCH /notifications/:id/read
- markAllNotificationsRead()              // PATCH /notifications/read-all
- getUnreadCount()                        // GET /notifications/unread-count
- deleteNotification(id)                  // DELETE /notifications/:id
```

#### 2.5 imageService.js (CREATE NEW)
```javascript
// Image Upload
- uploadImage(file)                       // POST /images/upload (multipart)
- deleteImage(imageUrl)                   // DELETE /images/:imageUrl
- compressImage(file)                     // LOCAL: Compress before upload
```

#### 2.6 socketService.js (CREATE NEW)
```javascript
// WebSocket Connection
- connect(token)
- disconnect()
- on(event, callback)
- emit(event, data)
- onMessage(callback)
- onNotification(callback)
- onTyping(callback)
```

---

### PHASE 3: Page Structure

#### 3.1 Current Pages (Need Update)
```
✅ LandingPage.jsx - Keep as is
✅ RoleSelectionPage.jsx - Keep as is
✅ BusinessLoginPage.jsx - Update with backend
✅ BusinessSignupPage.jsx - Update with backend
✅ RecyclerLoginPage.jsx - Update with backend
✅ RecyclerSignupPage.jsx - Update with backend
❌ BusinessDashboard.jsx - REBUILD: Add all features
❌ RecyclerDashboard.jsx - REBUILD: Add all features
```

#### 3.2 New Pages to Create
```
// Authentication
❌ EmailVerificationPage.jsx - Verify email code
❌ ForgotPasswordPage.jsx - Forgot password flow
❌ ResetPasswordPage.jsx - Reset password flow

// Profiles
❌ ProfilePage.jsx - View/Edit user profile
❌ BusinessProfilePage.jsx - Business profile
❌ RecyclerProfilePage.jsx - Recycler profile

// Waste Posts (Phase 1)
❌ CreateWastePostPage.jsx - Create new waste post with image
❌ EditWastePostPage.jsx - Edit waste post
❌ WastePostDetailsPage.jsx - View full details
❌ MarketplacePage.jsx - Browse all waste posts
❌ MyPostsPage.jsx - View own waste posts

// Collections (Phase 2)
❌ CollectionsPage.jsx - View collection requests
❌ CollectionDetailsPage.jsx - View collection details
❌ ScheduleCollectionPage.jsx - Schedule pickup
❌ CollectionHistoryPage.jsx - Collection history

// Messaging (Phase 3)
❌ MessagesPage.jsx - List conversations
❌ ConversationPage.jsx - Conversation view with real-time messages
❌ NotificationsPage.jsx - View all notifications

// General
❌ SettingsPage.jsx - User settings
❌ NotFoundPage.jsx - 404 page
```

#### 3.3 New Components to Create
```
// Reusable Components
❌ ImageUploader.jsx - Image upload with preview
❌ WastePostCard.jsx - Reusable waste post card
❌ CollectionCard.jsx - Collection request card
❌ MessageBubble.jsx - Message bubble with image support
❌ NotificationItem.jsx - Notification component
❌ LoadingSpinner.jsx - Loading indicator
❌ ErrorAlert.jsx - Error message component
❌ SuccessAlert.jsx - Success message component
❌ FormField.jsx - Reusable form input
❌ PaginationControls.jsx - Pagination component
❌ SearchFilter.jsx - Search and filter component

// Specialized Components
❌ WastePostForm.jsx - Reusable form for creating/editing posts
❌ ConversationList.jsx - List of conversations
❌ NotificationCenter.jsx - Notification dropdown/panel
❌ MapComponent.jsx - Map for nearby materials
❌ ImageGallery.jsx - Image gallery for waste posts
```

---

### PHASE 4: Updated Routing Structure

```jsx
// Public Routes
/ - LandingPage
/select-role - RoleSelectionPage

// Auth Routes
/business/login
/business/signup
/recycler/login
/recycler/signup
/verify-email
/forgot-password
/reset-password/:token

// Protected: Business Routes
/business/dashboard
/business/profile
/business/posts/create
/business/posts/edit/:id
/business/posts/view/:id
/business/posts/all
/business/collections
/business/collections/:id
/business/messages
/business/messages/:conversationId
/business/notifications
/business/settings

// Protected: Recycler Routes
/recycler/dashboard
/recycler/profile
/recycler/marketplace
/recycler/nearby
/recycler/collections
/recycler/collections/:id
/recycler/messages
/recycler/messages/:conversationId
/recycler/notifications
/recycler/settings

// Shared Routes
/marketplace
/profile/:userId
/error
/*404
```

---

### PHASE 5: Context & State Management

#### 5.1 Update AuthContext.jsx
```javascript
// ADD
- refreshToken functionality
- User role detection
- User preferences
- isLoading state for async operations
```

#### 5.2 Create New Contexts (Optional - if preferred over Redux)
```
❌ WastePostContext.jsx - Waste post states
❌ CollectionContext.jsx - Collection states
❌ MessageContext.jsx - Active conversations, messages cache
❌ NotificationContext.jsx - Notifications, unread count
```

---

### PHASE 6: Error Handling & Validation

#### 6.1 Update api.js
```javascript
// ADD
- Response interceptor for error handling
- Refresh token on 401
- Global error handling
- Request timeout handling
- Retry logic for failed requests
```

#### 6.2 Form Validation
```
❌ Create validationUtils.js
- Email validation
- Password strength check
- Required field validation
- File size/type validation for images
```

---

### PHASE 7: Features Implementation Priority

**Week 1 - Foundation**
1. Update authService with all endpoints
2. Create wastePostService
3. Update Auth pages to work with backend
4. Create ProfilePage

**Week 2 - Phase 1**
1. Create wastePostService fully
2. Create/Edit WastePost pages
3. Create MarketplacePage
4. Create image upload component

**Week 3 - Phase 2**
1. Create collectionService
2. Create Collections pages
3. Create collection request flow

**Week 4 - Phase 3**
1. Create messageService
2. Create socketService for WebSocket
3. Create MessagesPage with real-time updates
4. Create NotificationsPage

---

### PHASE 8: Testing Checklist

```
❌ Login flow (business & recycler)
❌ Email verification
❌ Password reset
❌ Create waste post with image
❌ Browse marketplace
❌ Search/filter materials
❌ Request collection
❌ Approve collection
❌ Schedule collection
❌ Send message with image
❌ Real-time notifications
❌ Image upload and compression
❌ Error handling and validation
❌ Responsive design (mobile)
❌ Performance (lazy loading, pagination)
```

---

### PHASE 9: Dependencies to Add

```bash
npm install socket.io-client
npm install react-dropzone              # File upload
npm install react-image-crop           # Image cropping
npm install date-fns                    # Date formatting
npm install react-toastify             # Notifications
npm install react-icons                # Icons
npm install react-map-gl               # Maps (optional)
npm install zustand OR recoil          # State management (optional)
```

---

### PHASE 10: Environment Variables

```env
# Backend
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# 3rd Party
REACT_APP_GOOGLE_MAPS_KEY=...          # If using maps
REACT_APP_ENVIRONMENT=development
```

---

## Summary of Required Changes

| Item | Current | Required | Status |
|------|---------|----------|--------|
| Services | 2 (basic) | 6 | ❌ Need 4 more |
| Pages | 8 | 20+ | ❌ Need 12+ more |
| Components | 1 | 15+ | ❌ Need 14+ more |
| API Integration | 30% | 100% | ❌ 70% remaining |
| WebSocket | None | Full | ❌ Not implemented |
| Image Upload | None | Full | ❌ Not implemented |
| Real-time | None | Full | ❌ Not implemented |
| Error Handling | Basic | Complete | ❌ Needs improvement |

---

## Next Steps

1. **Determine approach:**
   - Start with services layer first (recommended)
   - Or build pages simultaneously

2. **Decide on state management:**
   - Use React Context (simpler)
   - Or add Redux/Zustand (more complex)

3. **UI/UX:**
   - Use existing CSS or add Tailwind/Material-UI?
   - Responsive design approach?

4. **Timeline:**
   - Estimate: 3-4 weeks for full implementation
   - Or phased approach: Auth → Phase 1 → Phase 2 → Phase 3

---

## Questions for User

1. Should we use **Context API** or add **Redux/Zustand**?
2. Do you want **CSS-in-JS, Tailwind CSS, or Material-UI**?
3. Should we build **Services first** or **Pages first**?
4. **Timeline**: Do you want full implementation or phased?
