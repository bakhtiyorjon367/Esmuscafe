import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonInput,
  IonSpinner,
  IonToast,
} from '@ionic/react';
import api from '@/lib/api';
import { isAxiosError } from 'axios';
import { getProfile, removeToken } from '@/lib/auth';
import type { User } from '@/types';

const AdminProfile: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [form, setForm] = useState({ nickname: '', name: '', password: '' });

  useEffect(() => {
    getProfile()
      .then((u) => {
        setUser(u);
        setForm({ nickname: u.nickname ?? '', name: u.name ?? '', password: '' });
      })
      .catch(() => history.replace('/login'))
      .finally(() => setLoading(false));
  }, [history]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        nickname: form.nickname.trim(),
        name: form.name.trim(),
      };
      if (form.password.trim()) payload.password = form.password.trim();
      await api.patch('/users/me', payload);
      setForm((f) => ({ ...f, password: '' }));
      setToastMsg('Credentials updated successfully');
      setShowToast(true);
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      setToastMsg(msg ?? 'Failed to update credentials');
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    history.replace('/');
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Avatar + name display */}
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>
            <span>{user?.nickname?.[0]?.toUpperCase() ?? 'A'}</span>
          </div>
          <p style={styles.roleBadge}>Admin</p>
        </div>

        <form onSubmit={handleSave} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Login (nickname)</label>
            <IonInput
              value={form.nickname}
              onIonInput={(e) => setForm({ ...form, nickname: String((e.target as HTMLIonInputElement).value ?? '') })}
              required
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Display name</label>
            <IonInput
              value={form.name}
              onIonInput={(e) => setForm({ ...form, name: String((e.target as HTMLIonInputElement).value ?? '') })}
              required
            />
          </div>
          <div style={{ ...styles.fieldGroup, borderBottom: 'none' }}>
            <label style={styles.fieldLabel}>New password</label>
            <IonInput
              type="password"
              value={form.password}
              onIonInput={(e) => setForm({ ...form, password: String((e.target as HTMLIonInputElement).value ?? '') })}
              placeholder="Leave blank to keep current"
            />
          </div>

          <IonButton type="submit" expand="block" style={{ marginTop: 20 }} disabled={saving}>
            {saving ? <IonSpinner name="dots" /> : 'Save Changes'}
          </IonButton>
        </form>

        <IonButton
          expand="block"
          fill="outline"
          color="danger"
          style={{ marginTop: 24 }}
          onClick={handleLogout}
        >
          Log out
        </IonButton>
      </IonContent>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMsg}
        duration={2500}
      />
    </IonPage>
  );
};

const styles: Record<string, React.CSSProperties> = {
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 28,
    gap: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'var(--ion-color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: 'white',
    fontWeight: 700,
  },
  roleBadge: {
    margin: 0,
    background: 'var(--ion-color-primary)',
    color: 'white',
    borderRadius: 20,
    padding: '4px 20px',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  form: {
    borderRadius: 12,
    border: '1px solid rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  fieldGroup: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,0,0,0.08)',
  },
  fieldLabel: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
};

export default AdminProfile;
