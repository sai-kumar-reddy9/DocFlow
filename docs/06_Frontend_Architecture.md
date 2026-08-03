# 06 — Frontend Architecture

## 💻 Next.js 16 App Router Layout & Structure

The DocFlow frontend is built using **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **TanStack Query v5**, **Zustand**, and **Recharts**.

```text
frontend/app/
├── (auth)/
│   ├── login/page.tsx               # Public Login Form Page
│   └── signup/page.tsx              # Public Registration Form Page
├── (dashboard)/
│   ├── layout.tsx                   # Authenticated Session Guard Layout (Sidebar + Header)
│   ├── dashboard/page.tsx           # User Dashboard Analytics & Visualizations
│   ├── documents/page.tsx           # User Document Repository & File Streaming
│   ├── upload/page.tsx              # Live Document Upload Form Page
│   └── admin/                       # Administrative Management Console
│       ├── page.tsx                 # System Analytics Overview Page
│       ├── users/page.tsx           # User Management Table & Role Toggle Console
│       └── health/page.tsx          # System Health Diagnostics & Audit Logs Page
├── layout.tsx                       # Root App Layout & TanStack Query Client Provider
└── page.tsx                         # Landing Page / Redirect Router
```

---

## 🔒 1. Protected Route Guard Architecture (`app/(dashboard)/layout.tsx`)

Security routing is enforced at the layout boundary level before rendering child pages.

```typescript
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (pathname.startsWith("/admin") && user?.role !== "ADMIN") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, pathname]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

---

## 🐻 2. Zustand Auth Store (`frontend/store/useAuthStore.ts`)

The global user authentication session is managed via a lightweight **Zustand** store.

### Store Interface & State Definition
```typescript
interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: UserLogin) => Promise<void>;
  signup: (userData: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
```

### Authentication Flow Execution
1. **`login(credentials)`**: Calls `POST /api/v1/auth/login`. On success, executes `checkAuth()` to fetch user profile (`GET /api/v1/auth/me`) and populates `state.user`.
2. **`signup(userData)`**: Calls `POST /api/v1/auth/register`. On success, automatically invokes `login()` to establish session cookies.
3. **`logout()`**: Calls `POST /api/v1/auth/logout`, clears session state (`user = null`, `isAuthenticated = false`), and redirects to `/login`.
4. **`checkAuth()`**: Calls `GET /api/v1/auth/me`. If response is 200 OK, sets `user` and `isAuthenticated = true`. On 401 error, sets `user = null` and `isAuthenticated = false`.

---

## 🔄 3. TanStack Query v5 Data Fetching Hooks (`frontend/hooks/use-dashboard.ts`)

Server state management, caching, and mutation Key invalidation are handled via **TanStack Query**.

| Custom Hook Name | API Endpoint | Query / Mutation Type | Invalidation Target |
| :--- | :--- | :--- | :--- |
| `useUserDocuments()` | `GET /api/v1/documents` | Query (`["user-documents"]`) | N/A |
| `useUserDashboardStats()` | `GET /api/v1/dashboard/user-stats` | Query (`["user-dashboard-stats"]`) | N/A |
| `useDeleteDocument()` | `DELETE /api/v1/documents/{id}` | Mutation | Invalidates `["user-documents"]`, `["user-dashboard-stats"]`, `["admin-analytics"]` |
| `useAdminAnalytics()` | `GET /api/v1/admin/analytics` | Query (`["admin-analytics"]`) | N/A |
| `useAdminUsers()` | `GET /api/v1/admin/users` | Query (`["admin-users"]`) | N/A |
| `useToggleUserStatus()` | `PATCH /api/v1/admin/users/{id}/status` | Mutation | Invalidates `["admin-users"]`, `["admin-analytics"]` |
| `useUpdateUserRole()` | `PATCH /api/v1/admin/users/{id}/role` | Mutation | Invalidates `["admin-users"]`, `["admin-analytics"]` |
| `useActivityLogs()` | `GET /api/v1/admin/activity-logs` | Query (`["activity-logs"]`) | N/A |
| `useHealth()` | `GET /health` | Query (`["health-status"]`) | N/A |

---

## 📈 4. Recharts Visualizations & Component Contracts

Dashboard visualizations receive live API data mapped through clean TypeScript interfaces (`frontend/types/dashboard.ts`).

### Visual Components
- **Daily Upload Trend (`UploadTrendChart.tsx`)**: Renders a smooth `<AreaChart>` with gradient fill depicting the 7-day upload count trend.
- **File Type Distribution (`FileTypeChart.tsx`)**: Renders a custom `<PieChart>` with donut styling displaying PDF vs. DOCX vs. TXT ratios.
- **Storage Consumption Bar (`StorageUsageChart.tsx`)**: Renders a vertical `<BarChart>` visualizing total storage bytes used across format categories.
- **User Role Breakdown (`UserRoleChart.tsx`)**: Renders a donut `<PieChart>` breaking down `USER` vs. `ADMIN` count distribution in the Admin Panel.

---

## 🎨 5. Admin Console & User Management Guard Rails

The User Management Console (`app/(dashboard)/admin/users/page.tsx`) features frontend guard rails preventing accidental self-demotion or modification of the root administrator:

```typescript
users.map((u: any) => {
  const isPrimaryAdmin = u.email.toLowerCase() === "admin@docflow.io";
  const isSelf = u.id === currentUser?.id || u.email.toLowerCase() === currentUser?.email?.toLowerCase();

  return (
    <tr key={u.id}>
      {/* User Details */}
      <td className="p-4">
        {isPrimaryAdmin ? (
          <span className="px-2.5 py-1.5 rounded-lg bg-purple-500/10 text-purple-300 text-[11px] font-medium">
            Primary System Admin
          </span>
        ) : isSelf ? (
          <span className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 text-[11px] font-medium">
            Current Active Session
          </span>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => handleToggleRole(u.id, u.role)}>Toggle Role</button>
            <button onClick={() => handleToggleStatus(u.id, u.status)}>Disable</button>
          </div>
        )}
      </td>
    </tr>
  );
})
```
