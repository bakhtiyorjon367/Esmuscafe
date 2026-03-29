import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonSpinner } from '@ionic/react';
import { getToken, removeToken, getProfile } from '@/lib/auth';
import type { User } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth }) => {
  const history = useHistory();
  const [loading, setLoading] = useState(requireAuth);
  const [allowed, setAllowed] = useState(!requireAuth);

  if (!requireAuth) return <>{children}</>;

  useEffect(() => {
    const check = async () => {
      const token = getToken();
      if (requireAuth && !token) {
        history.replace('/login');
        setLoading(false);
        return;
      }
      if (token) {
        try {
          await getProfile();
        } catch {
          removeToken();
          if (requireAuth) {
            history.replace('/login');
            setLoading(false);
            return;
          }
        }
      }
      setAllowed(true);
      setLoading(false);
    };
    check();
  }, [requireAuth, history]);

  if (loading && requireAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <IonSpinner name="crescent" />
      </div>
    );
  }
  if (!allowed) return null;
  return <>{children}</>;
};

export default AuthGuard;
