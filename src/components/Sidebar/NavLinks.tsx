import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  visible: boolean;
}

interface NavLinksProps {
  navItems: NavItem[];
  closeMobileMenu: () => void;
}

export const NavLinks: React.FC<NavLinksProps> = ({ navItems, closeMobileMenu }) => {
  const pathname = usePathname();

  return (
    <nav className="mt-4 space-y-1 px-4 flex-1 overflow-y-auto">
      {navItems.filter(item => item.visible).map((item) => {
        const isActive = item.href === '/dashboard'
          ? pathname === '/dashboard'
          : pathname === item.href || pathname?.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMobileMenu}
            className="block outline-none"
          >
            <motion.div
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors duration-200 ${
                isActive
                  ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 font-bold shadow-sm'
                  : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon 
                icon={item.icon} 
                className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-sky-500' : 'text-gray-400 dark:text-zinc-500'}`} 
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <motion.span 
                  layoutId="activeIndicator"
                  className="absolute left-0 top-2 bottom-2 w-1.5 bg-sky-500 rounded-r-full shadow-sm shadow-sky-500/50" 
                />
              )}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
};
