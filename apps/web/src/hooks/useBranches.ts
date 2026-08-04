import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useMyRestaurants } from './useRestaurants';

export interface Branch {
  _id: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'suspended';
  address?: { street: string; city: string; state?: string };
  tablesCount?: number;
}

const MOCK_BRANCHES: Branch[] = [
  {
    _id: 'b1',
    name: 'Downtown Branch',
    code: 'BR-NY-01',
    phone: '+1 212-555-0199',
    email: 'downtown@paragon.com',
    status: 'active',
    address: { street: '45 Park Avenue', city: 'New York' },
    tablesCount: 24,
  },
  {
    _id: 'b2',
    name: 'Uptown Branch',
    code: 'BR-NY-02',
    phone: '+1 212-555-0144',
    email: 'uptown@paragon.com',
    status: 'active',
    address: { street: '128 Mercer St', city: 'New York' },
    tablesCount: 18,
  },
];

export function useBranches() {
  const { data: restaurants } = useMyRestaurants();
  const restaurant = restaurants?.data?.[0];
  const restaurantId = restaurant?._id;

  const [selectedBranchId, setSelectedBranchId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('qb_selected_branch_id') || 'all';
    }
    return 'all';
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['branches', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return { data: [] };
      const res = await api.get(`/branches/restaurant/${restaurantId}`);
      return res.data;
    },
    enabled: !!restaurantId,
  });

  const branches: Branch[] = data?.data?.length > 0 ? data.data : MOCK_BRANCHES;

  const changeSelectedBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qb_selected_branch_id', branchId);
    }
  };

  const selectedBranch = branches.find((b) => b._id === selectedBranchId) || null;

  return {
    branches,
    isLoading,
    selectedBranchId,
    selectedBranch,
    setSelectedBranchId: changeSelectedBranch,
    refetchBranches: refetch,
  };
}
