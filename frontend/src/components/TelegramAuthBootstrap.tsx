import { useEffect, useState } from 'react';
import { IonSpinner } from '@ionic/react';
import { getToken, tryTelegramAutoLogin } from '@/lib/auth';
import { isTelegramWebApp } from '@/lib/telegramWebApp';

interface TelegramAuthBootstrapProps {
  children: React.ReactNode;
}

/**
 * When the app opens inside Telegram, exchanges initData for a JWT before rendering routes.
 */
const TelegramAuthBootstrap: React.FC<TelegramAuthBootstrapProps> = ({ children }) => {
  const [ready, setReady] = useState(!isTelegramWebApp());

  useEffect(() => {
    if (!isTelegramWebApp()) return;

    let cancelled = false;

    (async () => {
      if (!getToken()) {
        await tryTelegramAutoLogin();
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <IonSpinner name="crescent" />
      </div>
    );
  }

  return <>{children}</>;
};

export default TelegramAuthBootstrap;
