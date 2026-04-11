# 🎯 **FINAL DETAILED FRONTEND REFACTORING PLAN (Option 3 - UI/API Separation)**

---

## **FINAL STRUCTURE (Updated with "UI" folder)**

```
admin/frontend/
├── src/
│   ├── api/                          ← ⭐ CENTRALIZED API LAYER
│   │   ├── user/
│   │   │   ├── usersApi.js
│   │   │   └── index.js
│   │   ├── ratings/
│   │   │   ├── ratingsApi.js
│   │   │   └── index.js
│   │   ├── reports/
│   │   │   ├── reportsApi.js
│   │   │   └── index.js
│   │   ├── auth/
│   │   │   ├── authApi.js
│   │   │   └── index.js
│   │   ├── monitoring/
│   │   │   ├── monitoringApi.js
│   │   │   └── index.js
│   │   ├── dashboard/
│   │   │   ├── dashboardApi.js
│   │   │   └── index.js
│   │   └── index.js                 ← Central export point
│   │
│   ├── UI/                          ← ⭐ UI + LOGIC LAYER (no API)
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useLogin.js
│   │   │   │   └── useLogout.js
│   │   │   └── types/
│   │   │       └── auth.types.js
│   │   │
│   │   ├── users/
│   │   │   ├── pages/
│   │   │   │   ├── AdminUsersPage.jsx
│   │   │   │   └── AdminUserDetailsPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── UserTable.jsx
│   │   │   │   └── UserFilters.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFetchUsers.js
│   │   │   │   └── useFetchUserDetails.js
│   │   │   └── types/
│   │   │       └── users.types.js
│   │   │
│   │   ├── ratings/
│   │   │   ├── pages/
│   │   │   │   └── AdminRatingsPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── RatingsTable.jsx
│   │   │   │   └── RatingStats.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useFetchRatings.js
│   │   │   └── types/
│   │   │       └── ratings.types.js
│   │   │
│   │   ├── reports/
│   │   │   ├── pages/
│   │   │   │   └── AdminReportsPage.jsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   └── useFetchReports.js
│   │   │   └── types/
│   │   │       └── reports.types.js
│   │   │
│   │   ├── monitoring/
│   │   │   ├── pages/
│   │   │   │   └── AdminSystemLogsPage.jsx
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   ├── useFetchLogs.js
│   │   │   │   └── useClearLogs.js
│   │   │   └── types/
│   │   │       └── monitoring.types.js
│   │   │
│   │   └── dashboard/
│   │       ├── pages/
│   │       │   └── AdminDashboard.jsx
│   │       ├── components/
│   │       ├── hooks/
│   │       │   └── useFetchStatistics.js
│   │       └── types/
│   │           └── dashboard.types.js
│   │
│   ├── shared/                      ← Truly reusable (2+ usage)
│   │   ├── components/
│   │   │   ├── AdminNavigation.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── PaginatedTable.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorAlert.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useFetch.js
│   │   │   ├── useLocalStorage.js
│   │   │   └── useQueryParams.js
│   │   ├── utils/
│   │   │   ├── apiClient.js
│   │   │   ├── errorHandler.js
│   │   │   └── tokenManager.js
│   │   ├── constants/
│   │   │   ├── colors.js
│   │   │   ├── apiEndpoints.js
│   │   │   └── messages.js
│   │   └── types/
│   │       ├── common.types.js
│   │       └── api.types.js
│   │
│   ├── app/
│   │   ├── App.jsx
│   │   └── index.jsx
│   │
│   ├── routes/
│   │   └── index.js
│   │
│   └── layouts/
│       └── AdminLayout.jsx
│
├── jsconfig.json                    ← Path aliases
├── package.json
├── public/
├── .env
└── .gitignore
```

---

## **TERMINOLOGY (Locked & Updated)**

- **API Layer** = `src/api/{feature}/` - Centralized HTTP connections, endpoints, data fetching
- **UI Layer** = `src/UI/{feature}/pages/` + `src/UI/{feature}/components/` - React components, rendering, visual logic
- **Logic Layer** = `src/UI/{feature}/hooks/` - Business logic bridge (data fetching hooks, state management)
- **Shared UI** = `src/shared/components/` - Reusable UI components (only if used by 2+ features)

---

## **PHASE 0: PREP (Foundation Builder)**

### **Step 0.1: Create Path Aliases (jsconfig.json)**

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/app/*": ["app/*"],
      "@/api/*": ["api/*"],
      "@/UI/*": ["UI/*"],
      "@/shared/*": ["shared/*"],
      "@/routes/*": ["routes/*"],
      "@/layouts/*": ["layouts/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

### **Step 0.2: Create Shared Foundation Layer**

#### **Create `shared/utils/apiClient.js`**

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5498';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Token injection happens ONCE here (not in every page)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Standardized error response handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error.response?.data || { error: error.message || 'Request failed' };
    return Promise.reject(errorData);
  }
);

export default apiClient;
```

#### **Create `shared/constants/colors.js`**

```javascript
export const COLORS = {
  bright: '#64ff43',
  deep: '#124d05',
  deeper: '#0a1f03',
  darker: '#0a2e03',
  surface: '#0d3806',
  border: 'rgba(100,255,67,0.18)',
  borderHover: 'rgba(100,255,67,0.45)',
  text: '#e6ffe0',
  textMid: 'rgba(230,255,224,0.55)',
  textLow: 'rgba(230,255,224,0.3)',
  glow: 'rgba(100,255,67,0.22)',
  glowStrong: 'rgba(100,255,67,0.45)',
  error: '#ff6b6b',
  errorBg: 'rgba(255,107,107,0.1)',
  errorBorder: 'rgba(255,107,107,0.3)',
};
```

#### **Create `shared/constants/apiEndpoints.js`**

```javascript
export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/admin/login',

  // Users
  USERS_GET_ALL: '/admin/users',
  USERS_GET_BY_ID: (id) => `/admin/users/${id}`,
  USERS_VERIFY: (id) => `/admin/users/${id}/verify`,
  USERS_DELETE: (id) => `/admin/users/${id}`,

  // Ratings
  RATINGS_USERS: '/admin/ratings/users',
  RATINGS_POSTS: '/admin/ratings/posts',

  // Reports
  REPORTS_GET_ALL: '/admin/reports',

  // Monitoring
  MONITORING_LOGS: '/admin/logs',

  // Dashboard
  DASHBOARD_STATISTICS: '/admin/statistics'
};
```

#### **Create `shared/hooks/useFetch.js`**

```javascript
import { useState, useEffect } from 'react';

export const useFetch = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const execute = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFn();
        setData(result);
      } catch (err) {
        setError(err.error || err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    execute();
  }, dependencies);

  return { data, loading, error };
};
```

#### **Create `shared/hooks/useAuth.js`**

```javascript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  return { isAuthenticated, loading };
};
```

#### **Create `shared/types/api.types.js`**

```javascript
// Common API response types used across UI

export const API_RESPONSE_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading'
};

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  LIMIT_MAX: 100
};
```

#### **Move/Update `shared/components/AdminNavigation.jsx`**

(Copy existing, update imports to use `@/shared/constants/colors`)

#### **Move/Update `shared/components/ProtectedRoute.jsx`**

(Copy existing)

---

### **Step 0.3: Create Central API Export**

#### **Create `api/index.js` (Central Export Point)**

```javascript
// ⭐ This is the single point to import ALL APIs from

export { default as apiClient } from '@/shared/utils/apiClient';

// User API
export { usersAPI } from './user';

// Auth API
export { authAPI } from './auth';

// Ratings API
export { ratingsAPI } from './ratings';

// Reports API
export { reportsAPI } from './reports';

// Monitoring API
export { monitoringAPI } from './monitoring';

// Dashboard API
export { dashboardAPI } from './dashboard';
```

**Usage throughout app:**

```javascript
// Instead of scattered imports
import { usersAPI } from '@/api/user/usersApi';
import { authAPI } from '@/api/auth/authApi';

// Just do:
import { usersAPI, authAPI } from '@/api';
```

---

### **Step 0.4: Create Git Refactor Branch**

```bash
cd admin/frontend
git checkout -b refactor/frontend-structure
```

---

### **Step 0.5: Verify Foundation**

```bash
npm start
# Should start without errors
```

---

## **PHASE 1: MOVE UI FEATURES (One at a time)**

### **Move Order (Safest first → Most dependent)**

1. **Auth** (foundational, simplest UI)
2. **Users** (good test, moderate)
3. **Ratings** (similar to users)
4. **Reports** (similar pattern)
5. **Monitoring** (similar pattern)
6. **Dashboard** (depends on stats from multiple)

---

### **STEP 1.1: Move AUTH UI Feature**

#### **1.1.1: Create `api/auth/authApi.js`**

```javascript
import apiClient from '@/shared/utils/apiClient';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';

export const authAPI = {
  login: async (username, password) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH_LOGIN, {
      username,
      password
    });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
  }
};
```

#### **1.1.2: Create `api/auth/index.js`**

```javascript
export { authAPI } from './authApi';
```

#### **1.1.3: Create `UI/auth/hooks/useLogin.js`**

```javascript
import { useState } from 'react';
import { authAPI } from '@/api';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.login(username, password);
      return response;
    } catch (err) {
      setError(err.error || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
```

#### **1.1.4: Create `UI/auth/hooks/useLogout.js`**

```javascript
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/api';

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    authAPI.logout();
    navigate('/login');
  };

  return { logout };
};
```

#### **1.1.5: Create `UI/auth/types/auth.types.js`**

```javascript
export const AUTH_TYPES = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT'
};

export const USER_ROLES = {
  ADMIN: 'admin'
};
```

#### **1.1.6: Refactor `UI/auth/pages/LoginPage.jsx`**

Extract existing `src/pages/LoginPage.jsx` →  `UI/auth/pages/LoginPage.jsx`

Update imports to use `@/`:

```javascript
import { useLogin } from '../hooks/useLogin';
import { COLORS } from '@/shared/constants/colors';
```

Keep UI logic only - no direct API calls.

#### **1.1.7: Update App.jsx**

```javascript
import LoginPage from '@/UI/auth/pages/LoginPage';
```

#### **1.1.8: Test**

```bash
npm start
# Test: Login page loads
# Test: Login with test credentials
# Test: Token is saved
```

#### **1.1.9: Commit**

```bash
git add -A
git commit -m "refactor(frontend-auth): move auth UI to centralized API structure

- Create api/auth/authApi.js with centralized login/logout
- Create UI/auth/hooks with useLogin and useLogout
- Create api/auth/index.js for clean exports
- Move LoginPage to UI/auth/pages
- Update imports to use @/ aliases
- Auth endpoints tested and working"
```

---

### **STEP 1.2: Move USERS UI Feature**

#### **1.2.1: Create `api/user/usersApi.js`**

```javascript
import apiClient from '@/shared/utils/apiClient';
import { API_ENDPOINTS } from '@/shared/constants/apiEndpoints';

export const usersAPI = {
  getAll: async (filters, page = 1, limit = 10) => {
    const params = new URLSearchParams({
      ...filters,
      page: page.toString(),
      limit: limit.toString()
    });
    const response = await apiClient.get(`${API_ENDPOINTS.USERS_GET_ALL}?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.USERS_GET_BY_ID(id));
    return response.data;
  },

  verify: async (id) => {
    const response = await apiClient.put(API_ENDPOINTS.USERS_VERIFY(id));
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.USERS_DELETE(id));
    return response.data;
  }
};
```

#### **1.2.2: Create `api/user/index.js`**

```javascript
export { usersAPI } from './usersApi';
```

#### **1.2.3: Create `UI/users/hooks/useFetchUsers.js`**

```javascript
import { useState, useEffect } from 'react';
import { usersAPI } from '@/api';

export const useFetchUsers = (filters, page, limit) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await usersAPI.getAll(filters, page, limit);
        setUsers(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      } catch (err) {
        setError(err.error || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, page, limit]);

  return { users, loading, error, totalPages };
};
```

#### **1.2.4: Create `UI/users/components/UserTable.jsx`**

Extract table rendering from current AdminUsersPage:

```javascript
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { COLORS } from '@/shared/constants/colors';

const UserTable = ({ users, loading, error, onRowClick, onDelete }) => {
  if (error) return <div style={{ color: COLORS.error }}>Error: {error}</div>;
  if (loading) return <div style={{ color: COLORS.text }}>Loading...</div>;

  return (
    <TableContainer component={Paper} sx={{ backgroundColor: COLORS.surface }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: COLORS.deeper }}>
            <TableCell sx={{ color: COLORS.bright }}>Email</TableCell>
            <TableCell sx={{ color: COLORS.bright }}>Type</TableCell>
            <TableCell sx={{ color: COLORS.bright }}>Verified</TableCell>
            <TableCell sx={{ color: COLORS.bright }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: COLORS.glow } }}>
              <TableCell sx={{ color: COLORS.text }}>{user.email}</TableCell>
              <TableCell sx={{ color: COLORS.text }}>{user.type}</TableCell>
              <TableCell>
                <Chip label={user.isVerified ? 'Verified' : 'Unverified'} color={user.isVerified ? 'success' : 'warning'} />
              </TableCell>
              <TableCell>
                <Button size="small" onClick={() => onRowClick(user.id)}>View</Button>
                <Button size="small" startIcon={<DeleteIcon />} onClick={() => onDelete(user.id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
```

#### **1.2.5: Refactor `UI/users/pages/AdminUsersPage.jsx`**

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { COLORS } from '@/shared/constants/colors';
import { useFetchUsers } from '../hooks/useFetchUsers';
import UserTable from '../components/UserTable';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ type: '', verified: '', search: '' });
  const [page, setPage] = useState(1);
  const limit = 10;

  const { users, loading, error, totalPages } = useFetchUsers(filters, page, limit);

  // Clean UI - only rendering, no API calls
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ color: COLORS.bright, mb: 4 }}>
        Users Management
      </Typography>
      
      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search email..."
          value={filters.search}
          onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
          sx={{ flex: 1 }}
        />
      </Box>

      {/* Table */}
      <UserTable 
        users={users} 
        loading={loading} 
        error={error} 
        onRowClick={(id) => navigate(`/admin/users/${id}`)}
      />

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <Typography sx={{ color: COLORS.text }}>Page {page} of {totalPages}</Typography>
        <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
      </Box>
    </Container>
  );
};

export default AdminUsersPage;
```

#### **1.2.6: Move `UI/users/pages/AdminUserDetailsPage.jsx`**

Copy existing file, update imports.

#### **1.2.7: Create `UI/users/types/users.types.js`**

```javascript
export const USER_TYPES = {
  INDIVIDUAL: 'individual',
  BUSINESS: 'business'
};
```

#### **1.2.8: Update App.jsx**

```javascript
import AdminUsersPage from '@/UI/users/pages/AdminUsersPage';
import AdminUserDetailsPage from '@/UI/users/pages/AdminUserDetailsPage';
```

#### **1.2.9: Test**

```bash
npm start
# Test: Navigate to /admin/users
# Test: Users load
# Test: Click user → details page loads
# Test: No direct fetch calls in component
```

#### **1.2.10: Commit**

```bash
git add -A
git commit -m "refactor(frontend-users): move users UI to centralized API structure

- Create api/user/usersApi.js with centralized user endpoints
- Create UI/users/hooks/useFetchUsers for data fetching logic
- Create UI/users/components/UserTable for UI reusability
- Move AdminUsersPage and AdminUserDetailsPage to UI/users/pages
- UI layer is now clean (no API calls in pages)
- All imports use @/ aliases
- Users endpoints tested"
```

---

### **STEP 1.3-1.6: Move Remaining UI Features (Same Pattern)**

Repeat the same process for:
- **Ratings** (1.3)
- **Reports** (1.4)
- **Monitoring** (1.5)
- **Dashboard** (1.6)

Each follows:
```
1. Create api/{feature}/{feature}Api.js
2. Create api/{feature}/index.js
3. Create UI/{feature}/hooks/useFetch{Feature}.js
4. Create UI/{feature}/components/{Component}.jsx (UI only)
5. Move/refactor UI/{feature}/pages/{Feature}Page.jsx
6. Create UI/{feature}/types/{feature}.types.js
7. Update App.jsx imports
8. Test
9. Commit
```

**Time estimate per feature: 15-20 minutes**

---

## **PHASE 2: CLEANUP & VERIFICATION**

### **Step 2.1: Delete Old Files**

```bash
rm -rf src/pages         # All moved to UI/*/pages
rm -rf src/services      # All moved to api/
rm src/components/AdminNavigation.jsx  # Moved to shared/
rm src/components/ProtectedRoute.jsx   # Moved to shared/
rmdir src/components     # Should be empty
```

### **Step 2.2: Verify Import Patterns**

```bash
# All imports should use @/ aliases
grep -r "from '\.\.\/" src/ | grep -v node_modules

# Should return minimal results
# Any relative imports within same feature are OK: './components', '../hooks'
```

### **Step 2.3: Verify No Circular Dependencies**

```bash
# UI should NOT import from other UI features directly
# Example NOT OK: UI/users/hooks imports from UI/ratings/api

# Check: Each UI feature only imports from
# - @/api/* (own API + others if needed)
# - @/shared/*
# - @/UI/{same-feature}/*
```

### **Step 2.4: Final File Structure Check**

```
✅ src/api/                    - All APIs centralized
✅ src/UI/auth/                - Auth UI + logic only
✅ src/UI/users/               - Users UI + logic only
✅ src/UI/ratings/             - Ratings UI + logic only
✅ src/UI/reports/             - Reports UI + logic only
✅ src/UI/monitoring/          - Monitoring UI + logic only
✅ src/UI/dashboard/           - Dashboard UI + logic only
✅ src/shared/                 - Only truly reusable (2+ usage)
✅ src/app/                    - App.jsx + index.jsx
✅ jsconfig.json               - Path aliases defined
```

---

## **PHASE 3: FINAL VERIFICATION**

### **Step 3.1: Full Application Test**

```bash
npm start

✅ Navigate /login
✅ Login works
✅ Navigate /admin/dashboard
✅ Dashboard loads
✅ Navigate /admin/users
✅ Users load, table works, pagination works
✅ Navigate /admin/ratings
✅ Ratings load
✅ Navigate /admin/reports
✅ Reports load
✅ Navigate /admin/logs
✅ Logs load
✅ Logout works
✅ Navigate back to /login
✅ No console errors
```

### **Step 3.2: Code Quality Check**

```bash
# Check import consistency
grep -r "from '\.\.\/" src/UI/ | wc -l
# Should be < 20 (only within-feature imports)

grep -r "from '@/" src/ | wc -l
# Should be > 100 (most imports using aliases)

# Check no duplicated code
# Colors should only be in: shared/constants/colors.js
# API client should only be in: shared/utils/apiClient.js
```

### **Step 3.3: Verify Separation of Concerns**

```bash
# API files should have NO React imports
grep -r "import React\|import.*jsx" src/api/
# Should return 0 results

# UI files should NOT call API directly
grep -r "from '@/api" src/UI/*/pages/
# Should return 0 results (only in hooks!)

# Hooks can import from API
grep -r "from '@/api" src/UI/*/hooks/
# This is OK ✅
```

### **Step 3.4: Document Structure**

Create `src/STRUCTURE.md`:

```markdown
# Frontend Structure: API/UI Separation

## Three Layers

### 1. API Layer (`src/api/`)
- HTTP connections, centralized
- One import point: `import { usersAPI, authAPI } from '@/api'`
- Each API in subfolders: `api/user/`, `api/auth/`, etc.

### 2. UI Layer (`src/UI/`)
- Pages: React components that render UI
- Components: Reusable UI elements
- Only render - never call API directly

### 3. Logic Layer (`src/UI/{feature}/hooks/`)
- Bridge between API and UI
- Call API, transform data
- Manage loading/error states
- Export custom hooks

## Imports

### ✅ Correct

\`\`\`javascript
// In UI pages/components:
import { useFetchUsers } from '../hooks/useFetchUsers';
import UserTable from '../components/UserTable';
import { COLORS } from '@/shared/constants/colors';

// In hooks:
import { usersAPI } from '@/api';

// In any file:
import { LoadingSpinner } from '@/shared/components';
import { useAuth } from '@/shared/hooks';
\`\`\`

### ❌ Wrong

\`\`\`javascript
// Don't call API in pages
import { usersAPI } from '@/api';  // ❌ in pages

// Don't use long relative paths
import { usersAPI } from '../../../api/user/usersApi';  // ❌

// Don't cross-import between UI features
import { RatingsTable } from '@/UI/ratings/components';  // ❌ in users
\`\`\`

## Adding New Feature

1. Create \`api/{feature}/{feature}Api.js\`
2. Create \`api/{feature}/index.js\` (export API)
3. Create \`UI/{feature}/pages/{Feature}Page.jsx\`
4. Create \`UI/{feature}/hooks/useFetch{Feature}.js\`
5. Create \`UI/{feature}/components/\` (if needed)
6. Create \`UI/{feature}/types/{feature}.types.js\`
7. Export from \`api/index.js\`
8. Add route to \`App.jsx\`

## Benefits

- **Testable**: API calls isolated in \`api/\`, UI isolated in \`pages/components/\`
- **Maintainable**: Clear separation - change API without breaking UI
- **Scalable**: New features follow same pattern
- **Reusable**: Shared components/hooks in \`shared/\`
- **Flexible**: Redesign UI without touching API layer
\`\`\`

### **Step 3.5: Team Communication**

Update team:

\`\`\`
✅ FRONTEND REFACTORING COMPLETE

Structure:
- api/           ← All HTTP connections (centralized)
- UI/            ← All pages + components (organized by feature)
- shared/        ← Reusable components/hooks (2+ usage)

SEPARATION OF CONCERNS:
✓ API: Import from @/api - centralized endpoints
✓ UI: Pages render only - NEVER call API
✓ Logic: Hooks bridge API and UI
✓ Shared: True reusable code (token manager, auth, forms)

BENEFITS:
- Change UI without breaking API
- Change API without rewriting pages
- Clear folder structure
- Easy to navigate and maintain

Follow the structure documented in src/STRUCTURE.md
\`\`\`

---

## **PHASE 4: MERGE & COMPLETION**

### **Step 4.1: Create Final Commit**

```bash
git add -A
git commit -m "refactor(frontend): complete frontend structure reorganization - API/UI separation

SUMMARY:
- Centralized API layer in src/api/ (by feature subdirectories)
- Moved all pages to src/UI/{feature}/pages/
- Extracted logic into src/UI/{feature}/hooks/
- Created reusable UI components in src/UI/{feature}/components/
- Moved shared utilities to src/shared/
- Added path aliases via jsconfig.json

LAYER SEPARATION:
✓ API Layer: All HTTP calls in api/{feature}/
✓ UI Layer: All rendering in UI/{feature}/pages + components/
✓ Logic Layer: All state/data management in UI/{feature}/hooks/

IMPROVEMENTS:
✓ UI layer completely separated from API layer
✓ Can redesign UI without touching API
✓ All APIs centralized for easy discovery
✓ Token injection happens once (apiClient)
✓ Consistent import patterns (@/ aliases)
✓ Features are self-contained
✓ Shared code actually shared (2+ usage only)

FILES MOVED:
✓ Pages → UI/{feature}/pages/
✓ Services → api/{feature}/
✓ Components → UI/{feature}/components/ OR shared/components/
✓ Hook logic → UI/{feature}/hooks/

TESTED:
✓ All routes load
✓ All endpoints respond
✓ No console errors
✓ Auth flow works
✓ Data fetching works
✓ Pagination works
✓ Filters work

STRUCTURE DOCUMENTED in src/STRUCTURE.md"
```

### **Step 4.2: Merge to Main**

```bash
git checkout main
git merge --no-ff refactor/frontend-structure
git push origin main
```

### **Step 4.3: Tag Release**

```bash
git tag -a v2.0.0-frontend-refactor -m "Frontend refactoring complete: API/UI separation finalized"
git push origin v2.0.0-frontend-refactor
```

---

## **SUCCESS CHECKLIST**

- ✅ All 6 UI features moved to UI folder structure
- ✅ All API calls centralized in `api/` folder
- ✅ All UI components in `UI/{feature}/pages/` + `components/`
- ✅ All logic hooks in `UI/{feature}/hooks/`
- ✅ All imports use `@/` aliases
- ✅ No API calls in page components (only in hooks)
- ✅ No duplicated token injection (one `apiClient`)
- ✅ No duplicated colors (one `colors.js`)
- ✅ Type definitions in each feature
- ✅ All endpoints tested and working
- ✅ No console errors
- ✅ Documentation created
- ✅ Team notified
- ✅ Merged to main

---

**Total Estimated Time: 2-3 hours**

**Ready to start Phase 0 prep?**
