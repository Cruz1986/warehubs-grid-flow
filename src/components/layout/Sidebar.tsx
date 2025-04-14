
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  PackageOpen,
  Grid2X2,
  PackageCheck,
  BarChart3
} from 'lucide-react';
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAdmin = user?.isAdmin;

  const menuItems = [
    ...(isAdmin ? [
      { name: 'Admin Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard size={20} /> },
      { name: 'User Management', path: '/user-management', icon: <Users size={20} /> },
    ] : []),
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Inbound', path: '/inbound', icon: <PackageOpen size={20} /> },
    { name: 'Grid Management', path: '/grid-management', icon: <Grid2X2 size={20} /> },
    { name: 'Outbound', path: '/outbound', icon: <PackageCheck size={20} /> },
    { name: 'Status', path: '/status', icon: <BarChart3 size={20} /> },
  ];

  return (
    <aside className="h-screen w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-700">Warehouse Management</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.path ? "bg-blue-50 text-blue-700" : ""
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          {user?.facility ? `Facility: ${user.facility}` : ''}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
