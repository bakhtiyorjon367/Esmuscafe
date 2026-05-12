import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonSpinner } from '@ionic/react';
import { getToken, removeToken, getProfile } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth }) => {
  const history = useHistory();
  const [loading, setLoading] = useState(requireAuth);
  const [allowed, setAllowed] = useState(!requireAuth);

  useEffect(() => {
    if (!requireAuth) {
      setLoading(false);
      setAllowed(true);
      return;
    }

    const check = async () => {
      const token = getToken();
      if (!token) {
        history.replace('/login');
        setLoading(false);
        return;
      }
      try {
        await getProfile();
      } catch {
        removeToken();
        history.replace('/login');
        setLoading(false);
        return;
      }
      setAllowed(true);
      setLoading(false);
    };
    check();
  }, [requireAuth, history]);

  if (!requireAuth) return <>{children}</>;

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
