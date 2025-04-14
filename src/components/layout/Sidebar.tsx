
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  PackageOpen,
  Grid2X2,
  PackageCheck,
  Users,
  LayoutDashboard,
  Activity,
  Grid
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const Sidebar = () => {
  const location = useLocation();
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isMobile = useIsMobile();
  
  // Don't render the sidebar on mobile
  if (isMobile) {
    return null;
  }

  const menuItems = [
    { name: 'Inbound', path: '/inbound', icon: <PackageOpen size={20} /> },
    { name: 'Grid Management', path: '/grid-management', icon: <Grid2X2 size={20} /> },
    { name: 'Outbound', path: '/outbound', icon: <PackageCheck size={20} /> },
    { name: 'Status Dashboard', path: '/status', icon: <Activity size={20} /> },
  ];

  // Admin menu items only shown to admin users
  const adminMenuItems = user?.isAdmin ? [
    { name: 'Admin Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'User Management', path: '/user-management', icon: <Users size={20} /> },
    { name: 'Grid Master', path: '/grid-master', icon: <Grid size={20} /> },
  ] : [];

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
          
          {adminMenuItems.length > 0 && (
            <>
              <li className="pt-2">
                <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </div>
              </li>
              {adminMenuItems.map((item) => (
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
            </>
          )}
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
