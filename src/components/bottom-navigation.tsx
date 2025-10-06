import { cn } from "@/lib/utils";
import { Home, Gamepad2, TrendingUp, Crown, Settings } from "lucide-react";
import { useLocation, Link } from "react-router-dom";

const navigationItems = [
  { icon: Home, label: 'Início', path: '/dashboard' },
  { icon: Gamepad2, label: 'Jogos', path: '/games' },
  { icon: TrendingUp, label: 'Sinais', path: '/signals' },
  { icon: Crown, label: 'VIP', path: '/vip-signals' },
  { icon: Settings, label: 'Config', path: '/settings' },
];

export const BottomNavigation = () => {
  const location = useLocation();

  // Hide bottom navigation on public pages and checkout flow
  const publicPages = ['/', '/login', '/register', '/plans'];
  const isPublicPage = publicPages.includes(location.pathname);
  const isCheckoutPage = location.pathname.startsWith('/checkout');

  if (isPublicPage || isCheckoutPage) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-primary h-20 border-t border-border/50 z-50">
      <div className="flex items-center justify-around h-full px-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all duration-200",
                "text-white/70 hover:text-white hover:bg-white/10",
                isActive && "text-white bg-white/20 scale-105"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};