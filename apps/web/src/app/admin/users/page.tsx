'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Note: In a real setup the auth-service would expose an admin endpoint for listing users.
  // Here we use the users endpoint as a placeholder.
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', search, page],
    queryFn: async () => {
      // This would hit /auth/admin/users in a full implementation
      return { data: [], meta: { total: 0, page: 1, totalPages: 1, hasNext: false, hasPrev: false } };
    },
  });

  const users = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9 h-10 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              {['Name', 'Email', 'Role', 'Verified', 'Joined', 'Status'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td>
                ))}</tr>
              ))
            ) : users.length > 0 ? (
              users.map((user: {
                _id: string; name: string; email: string; role: string;
                isEmailVerified: boolean; createdAt: string; isActive: boolean;
              }) => (
                <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3 capitalize">
                    <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'restaurant_owner' ? 'brand' : 'secondary'} className="text-xs">
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isEmailVerified ? 'success' : 'warning'} className="text-xs">
                      {user.isEmailVerified ? 'Verified' : 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.isActive ? 'success' : 'destructive'} className="text-xs">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>User management requires direct auth-service integration</p>
                  <p className="text-xs mt-1">Connect the auth-service admin API to see users here</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
