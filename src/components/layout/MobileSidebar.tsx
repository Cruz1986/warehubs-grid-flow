
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, PackageOpen, Grid2X2, PackageCheck } from 'lucide-react';
import { cn } from "@/lib/utils";

const MobileSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Inbound', path: '/inbound', icon: <PackageOpen size={20} /> },
    { name: 'Grid Management', path: '/grid-management', icon: <Grid2X2 size={20} /> },
    { name: 'Outbound', path: '/outbound', icon: <PackageCheck size={20} /> },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Warehouse Management</h2>
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
          <div className="p-4 border-t">
            <p className="text-xs text-gray-500">
              {localStorage.getItem('user') ? 
                `Facility: ${JSON.parse(localStorage.getItem('user') || '{}').facility || ''}` : 
                ''}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
