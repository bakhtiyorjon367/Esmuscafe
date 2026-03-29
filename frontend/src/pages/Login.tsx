import { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonSegment,
  IonSegmentButton,
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { login, signup, saveToken } from '@/lib/auth';

const Login: React.FC = () => {
  const history = useHistory();
  const redirectTo = new URLSearchParams(history.location.search).get('redirect') || '/';
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setNickname('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setHasError(false);
  };

  const clearError = () => {
    setHasError(false);
  };

  const handleTabChange = (value: string) => {
    setTab(value as 'login' | 'signup');
    resetForm();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasError) return;
    setError('');
    setLoading(true);
    try {
      const response = await login(nickname, password);
      saveToken(response.access_token);
      if (response.user.role === 'admin') {
        history.replace('/admin/restaurants');
      } else if (response.user.role === 'restaurant_owner') {
        history.replace('/dashboard/products');
      } else {
        history.replace(redirectTo);
      }
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || 'Invalid credentials');
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hasError) return;
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setHasError(true);
      return;
    }
    setLoading(true);
    try {
      const response = await signup(nickname, password);
      saveToken(response.access_token);
      history.replace(redirectTo);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax.response?.data?.message || 'Signup failed');
      setHasError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.replace(redirectTo)} aria-label="Back">
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ maxWidth: 400, margin: '2rem auto' }}>
          <IonSegment
            value={tab}
            onIonChange={(e) => handleTabChange(String(e.detail.value))}
            style={{ marginBottom: '2rem' }}
          >
            <IonSegmentButton value="login">
              <IonLabel>Login</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="signup">
              <IonLabel>Sign Up</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <IonItem>
                <IonLabel position="stacked">Nickname</IonLabel>
                <IonInput
                  value={nickname}
                  onIonInput={(e) => { setNickname(String((e.target as HTMLIonInputElement).value ?? '')); clearError(); }}
                  required
                  placeholder="your nickname"
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Password</IonLabel>
                <IonInput
                  type="password"
                  value={password}
                  onIonInput={(e) => { setPassword(String((e.target as HTMLIonInputElement).value ?? '')); clearError(); }}
                  required
                  placeholder="••••••••"
                />
              </IonItem>
              <div style={{ minHeight: '2rem' }}>
                {error && (
                  <IonText color="danger">
                    <p className="ion-padding-start ion-padding-end" style={{ margin: 0 }}>{error}</p>
                  </IonText>
                )}
              </div>
              <IonButton type="submit" expand="block" disabled={loading} className="ion-margin-top">
                {loading ? 'Logging in...' : 'Login'}
              </IonButton>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <IonItem>
                <IonLabel position="stacked">Nickname</IonLabel>
                <IonInput
                  value={nickname}
                  onIonInput={(e) => { setNickname(String((e.target as HTMLIonInputElement).value ?? '')); clearError(); }}
                  required
                  placeholder="choose a nickname"
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Password</IonLabel>
                <IonInput
                  type="password"
                  value={password}
                  onIonInput={(e) => { setPassword(String((e.target as HTMLIonInputElement).value ?? '')); clearError(); }}
                  required
                  placeholder="••••••••"
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Confirm Password</IonLabel>
                <IonInput
                  type="password"
                  value={confirmPassword}
                  onIonInput={(e) => { setConfirmPassword(String((e.target as HTMLIonInputElement).value ?? '')); clearError(); }}
                  required
                  placeholder="••••••••"
                />
              </IonItem>
              <div style={{ minHeight: '2rem' }}>
                {error && (
                  <IonText color="danger">
                    <p className="ion-padding-start ion-padding-end" style={{ margin: 0 }}>{error}</p>
                  </IonText>
                )}
              </div>
              <IonButton type="submit" expand="block" disabled={loading} className="ion-margin-top">
                {loading ? 'Signing up...' : 'Sign Up'}
              </IonButton>
            </form>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
