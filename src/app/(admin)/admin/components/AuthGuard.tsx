"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const barberId = localStorage.getItem('barberId');
      
      // Login sayfasındaysa auth kontrolü yapma
      if (pathname === '/admin/login') {
        setIsLoading(false);
        return;
      }

      // Auth token yoksa login'e yönlendir
      if (!barberId) {
        router.push('/admin/login');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
