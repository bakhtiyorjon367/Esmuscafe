import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonSpinner,
  IonToast,
  IonAlert,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonToggle,
  IonTextarea,
} from '@ionic/react';
import {
  locationOutline,
  chevronForwardOutline,
  chatbubbleOutline,
  arrowBackOutline,
  trashOutline,
  logOutOutline,
} from 'ionicons/icons';
import api from '@/lib/api';
import { getProfile, removeToken } from '@/lib/auth';
import type { User, UserAddress, WorkingHours } from '@/types';

interface MyComment {
  _id: string;
  text: string;
  createdAt: string;
  productId: { _id: string; name: string; image?: string; restaurantId?: string } | string;
}

type SectionKey = 'account' | 'status' | 'hours' | 'restaurant';

const defaultWorkingHours = (): WorkingHours => ({ open: '09:00', close: '22:00' });

const sanitizeWorkingHours = (raw: any): WorkingHours => ({
  open: raw?.open ?? '09:00',
  close: raw?.close ?? '22:00',
});

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const fieldGroupStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid var(--ion-border-color, rgba(0,0,0,0.08))',
};

/** Single accordion bar: header row + collapsible body */
const AccordionSection: React.FC<{
  label: string;
  sectionKey: SectionKey;
  openSection: SectionKey | null;
  onToggle: (k: SectionKey) => void;
  isLast?: boolean;
  children: React.ReactNode;
}> = ({ label, sectionKey, openSection, onToggle, isLast, children }) => {
  const isOpen = openSection === sectionKey;
  return (
    <div style={{ borderBottom: isLast ? 'none' : '1px solid var(--ion-border-color, rgba(0,0,0,0.08))' }}>
      {/* Header */}
      <div
        onClick={() => onToggle(sectionKey)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '1rem' }}>{label}</span>
        <IonIcon
          icon={chevronForwardOutline}
          style={{
            color: 'var(--ion-color-medium)',
            fontSize: '1.1rem',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        />
      </div>
      {/* Body */}
      {isOpen && (
        <div style={{ borderTop: '1px solid var(--ion-border-color, rgba(0,0,0,0.08))' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const MyProfile: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  // Accordion
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);
  const toggleSection = (k: SectionKey) => setOpenSection((prev) => (prev === k ? null : k));

  // Addresses
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressForm, setAddressForm] = useState({ address: '' });
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [showDeleteAddressAlert, setShowDeleteAddressAlert] = useState(false);

  // Reviews
  const [comments, setComments] = useState<MyComment[]>([]);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  // Owner: Account
  const [accountForm, setAccountForm] = useState({ nickname: '', name: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  // Owner: isOpened
  const [isOpened, setIsOpened] = useState(true);

  // Owner: Working hours
  const [workingHours, setWorkingHours] = useState<WorkingHours>(defaultWorkingHours());
  const workingHoursRef = useRef<WorkingHours>(workingHours);
  workingHoursRef.current = workingHours;

  const restaurantIdRef = useRef<string | null>(null);
  restaurantIdRef.current = restaurantId;

  // Owner: Restaurant info
  const [restaurantForm, setRestaurantForm] = useState({ name: '', description: '', address: '', image: '' });
  const [savingRestaurant, setSavingRestaurant] = useState(false);

  const showMsg = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
        setAddresses(profile.addresses ?? []);
        if (profile.role === 'restaurant_owner' && profile.restaurantId) {
          setRestaurantId(profile.restaurantId);
          restaurantIdRef.current = profile.restaurantId;
          setAccountForm({ nickname: profile.nickname ?? '', name: profile.name ?? '', newPassword: '', confirmPassword: '' });
          const res = await api.get(`/restaurants/${profile.restaurantId}`);
          const r = res.data;
          setIsOpened(r.isOpened ?? true);
          const wh = sanitizeWorkingHours(r.workingHours);
          setWorkingHours(wh);
          workingHoursRef.current = wh;
          setRestaurantForm({ name: r.name ?? '', description: r.description ?? '', address: r.address ?? '', image: r.image ?? '' });
        }
      } catch {
        history.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ─── Account save ─────────────────────────────────────────────────────────
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setSavingAccount(true);
    try {
      const payload: Record<string, string> = {
        nickname: accountForm.nickname.trim(),
        name: accountForm.name.trim(),
      };
      if (accountForm.newPassword.trim()) payload.password = accountForm.newPassword.trim();
      await api.patch('/users/me', payload);
      setAccountForm((f) => ({ ...f, newPassword: '', confirmPassword: '' }));
      showMsg('Account updated!');
      setOpenSection(null);
    } catch (err: any) {
      showMsg(err?.response?.data?.message ?? 'Failed to update account');
    } finally {
      setSavingAccount(false);
    }
  };

  // ─── isOpened auto-save ────────────────────────────────────────────────────
  const handleToggleOpen = async (checked: boolean) => {
    setIsOpened(checked);
    if (!restaurantIdRef.current) return;
    try {
      await api.patch(`/restaurants/${restaurantIdRef.current}`, { isOpened: checked });
    } catch (err: any) {
      showMsg(err?.response?.data?.message ?? 'Failed to update status');
    }
  };

  // ─── Working hours auto-save ───────────────────────────────────────────────
  const updateHours = async (field: 'open' | 'close', value: string) => {
    const updated: WorkingHours = { ...workingHoursRef.current, [field]: value };
    setWorkingHours(updated);
    if (!restaurantIdRef.current) return;
    try {
      await api.patch(`/restaurants/${restaurantIdRef.current}`, { workingHours: updated });
    } catch (err: any) {
      showMsg(err?.response?.data?.message ?? 'Failed to update working hours');
    }
  };

  // ─── Restaurant info save ──────────────────────────────────────────────────
  const handleSaveRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    setSavingRestaurant(true);
    try {
      await api.patch(`/restaurants/${restaurantId}`, restaurantForm);
      showMsg('Restaurant info updated!');
      setOpenSection(null);
    } catch (err: any) {
      showMsg(err?.response?.data?.message ?? 'Failed to update restaurant');
    } finally {
      setSavingRestaurant(false);
    }
  };

  // ─── Addresses ────────────────────────────────────────────────────────────
  const handleSaveAddress = async () => {
    if (!addressForm.address.trim()) {
      showMsg('Please enter an address');
      return;
    }
    setSavingAddress(true);
    try {
      if (addresses.length > 0) {
        const res = await api.patch('/users/me/addresses/0', { address: addressForm.address });
        setAddresses(res.data);
      } else {
        const res = await api.post('/users/me/addresses', { address: addressForm.address });
        setAddresses(res.data);
      }
      setShowAddressModal(false);
      setAddressForm({ address: '' });
      setEditingAddressIndex(null);
    } catch (err: any) {
      showMsg(err?.response?.data?.message ?? 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    try {
      const res = await api.delete(`/users/me/addresses/${index}`);
      setAddresses(res.data);
    } catch (err: any) {
      showMsg(err?.response?.data?.message ?? 'Failed to delete address');
    }
  };

  // ─── Reviews ──────────────────────────────────────────────────────────────
  const handleOpenReviews = async () => {
    setShowReviewsModal(true);
    setLoadingComments(true);
    try {
      const res = await api.get('/comments/mine');
      setComments(res.data);
    } catch {
      showMsg('Failed to load reviews');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleGoToProduct = (comment: MyComment) => {
    const product = typeof comment.productId === 'object' ? comment.productId : null;
    if (!product || !product.restaurantId) return;
    setShowReviewsModal(false);
    history.push(`/restaurant/${product.restaurantId}/product/${product._id}`);
  };

  const handleDeleteComment = async (comment: MyComment) => {
    const productId = typeof comment.productId === 'string' ? comment.productId : comment.productId._id;
    try {
      await api.delete(`/products/${productId}/comments/${comment._id}`);
      setComments((prev) => prev.filter((c) => c._id !== comment._id));
    } catch (err: any) {
      showMsg(err?.response?.data?.message ?? 'Failed to delete review');
    }
  };

  const handleLogout = () => {
    removeToken();
    localStorage.removeItem('esmuscafe_cart');
    history.replace('/');
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/users/me');
      removeToken();
      localStorage.removeItem('esmuscafe_cart');
      history.replace('/login');
    } catch (err: any) {
      showMsg(err?.response?.data?.message ?? 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton fill="clear" onClick={() => history.goBack()}>
                <IonIcon icon={arrowBackOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>My Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const isOwner = user?.role === 'restaurant_owner';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>My Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* ── Profile Header ── */}
        <div style={{ background: 'var(--ion-card-background)', paddingBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#ccc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem', color: 'white', fontWeight: 700,
              overflow: 'hidden',
            }}>
              <span>{user?.nickname?.[0]?.toUpperCase() ?? '?'}</span>
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem' }}>{user?.name || user?.nickname}</p>
            <div style={{
              background: 'var(--ion-color-primary)',
              color: 'white',
              borderRadius: 20,
              padding: '4px 20px',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}>
              {isOwner ? 'Restaurant Owner' : user?.nickname}
            </div>
          </div>
        </div>

        {isOwner ? (
          /* ── Owner accordion sections ── */
          <div style={{
            background: 'var(--ion-card-background)',
            borderRadius: 16,
            margin: '24px 16px 0',
            overflow: 'hidden',
          }}>
            {/* 1. Currently Open — plain row, no accordion */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 20px',
              borderBottom: '1px solid var(--ion-border-color, rgba(0,0,0,0.08))',
            }}>
              <span style={{ fontWeight: 600, fontSize: '1rem' }}>Currently Open</span>
              <IonToggle checked={isOpened} onIonChange={(e) => handleToggleOpen(e.detail.checked)} />
            </div>

            {/* 2. My Account */}
            <AccordionSection label="My Account" sectionKey="account" openSection={openSection} onToggle={toggleSection}>
              <form onSubmit={handleSaveAccount}>
                <div style={fieldGroupStyle}>
                  <label style={fieldLabelStyle}>Login (nickname)</label>
                  <IonInput
                    value={accountForm.nickname}
                    onIonInput={(e) => setAccountForm({ ...accountForm, nickname: String((e.target as HTMLIonInputElement).value ?? '') })}
                    required
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={fieldLabelStyle}>Display name</label>
                  <IonInput
                    value={accountForm.name}
                    onIonInput={(e) => setAccountForm({ ...accountForm, name: String((e.target as HTMLIonInputElement).value ?? '') })}
                    required
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={fieldLabelStyle}>New password</label>
                  <IonInput
                    type="password"
                    value={accountForm.newPassword}
                    placeholder="Leave blank to keep current"
                    onIonInput={(e) => {
                      setPasswordError('');
                      setAccountForm({ ...accountForm, newPassword: String((e.target as HTMLIonInputElement).value ?? '') });
                    }}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={fieldLabelStyle}>Confirm password</label>
                  <IonInput
                    type="password"
                    value={accountForm.confirmPassword}
                    placeholder="Repeat new password"
                    onIonInput={(e) => {
                      setPasswordError('');
                      setAccountForm({ ...accountForm, confirmPassword: String((e.target as HTMLIonInputElement).value ?? '') });
                    }}
                  />
                  {passwordError && (
                    <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--ion-color-danger)' }}>{passwordError}</p>
                  )}
                </div>
                <div style={{ padding: '12px 16px' }}>
                  <IonButton type="submit" expand="block" disabled={savingAccount}>
                    {savingAccount ? <IonSpinner name="dots" /> : 'Save Account'}
                  </IonButton>
                </div>
              </form>
            </AccordionSection>

            {/* 3. Working Hours */}
            <AccordionSection label="Working Hours" sectionKey="hours" openSection={openSection} onToggle={toggleSection} >
              <div style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...fieldLabelStyle, marginBottom: 2 }}>Opens</label>
                    <input
                      type="time"
                      value={workingHours.open}
                      onChange={(e) => updateHours('open', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--ion-border-color, rgba(0,0,0,0.15))',
                        background: 'var(--ion-background-color)',
                        color: 'var(--ion-color-dark)',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                  <span style={{ marginTop: 18, color: 'var(--ion-color-medium)' }}>–</span>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...fieldLabelStyle, marginBottom: 2 }}>Closes</label>
                    <input
                      type="time"
                      value={workingHours.close}
                      onChange={(e) => updateHours('close', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid var(--ion-border-color, rgba(0,0,0,0.15))',
                        background: 'var(--ion-background-color)',
                        color: 'var(--ion-color-dark)',
                        fontSize: '0.95rem',
                      }}
                    />
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* 4. Restaurant Info */}
            <AccordionSection label="Restaurant Info" sectionKey="restaurant" openSection={openSection} onToggle={toggleSection} isLast>
              <form onSubmit={handleSaveRestaurant}>
                <div style={fieldGroupStyle}>
                  <label style={fieldLabelStyle}>Restaurant Name</label>
                  <IonInput
                    value={restaurantForm.name}
                    onIonInput={(e) => setRestaurantForm({ ...restaurantForm, name: String((e.target as HTMLIonInputElement).value ?? '') })}
                    required
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={fieldLabelStyle}>Description</label>
                  <IonTextarea
                    value={restaurantForm.description}
                    onIonInput={(e) => setRestaurantForm({ ...restaurantForm, description: String((e.target as HTMLIonTextareaElement).value ?? '') })}
                    rows={3}
                    required
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={fieldLabelStyle}>Address</label>
                  <IonInput
                    value={restaurantForm.address}
                    onIonInput={(e) => setRestaurantForm({ ...restaurantForm, address: String((e.target as HTMLIonInputElement).value ?? '') })}
                  />
                </div>
                <div style={fieldGroupStyle}>
                  <label style={fieldLabelStyle}>Image URL</label>
                  <IonInput
                    type="url"
                    value={restaurantForm.image}
                    onIonInput={(e) => setRestaurantForm({ ...restaurantForm, image: String((e.target as HTMLIonInputElement).value ?? '') })}
                    required
                  />
                </div>
                {restaurantForm.image && (
                  <div style={{ padding: '0 16px 16px', textAlign: 'center' }}>
                    <img
                      src={restaurantForm.image}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 10, objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ padding: '12px 16px' }}>
                  <IonButton type="submit" expand="block" disabled={savingRestaurant}>
                    {savingRestaurant ? <IonSpinner name="dots" /> : 'Save Restaurant Info'}
                  </IonButton>
                </div>
              </form>
            </AccordionSection>
          </div>
        ) : (
          /* ── Regular user menu ── */
          <div style={{ background: 'var(--ion-card-background)', borderRadius: 16, margin: '24px 16px 0' }}>
            {[
              { icon: chatbubbleOutline, label: 'My Reviews', onClick: handleOpenReviews },
              {
                icon: locationOutline,
                label: 'Address',
                onClick: () => setShowAddressModal(true),
              },
            ].map((item, idx, arr) => (
              <div
                key={idx}
                onClick={item.onClick}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 20px',
                  borderBottom: idx < arr.length - 1 ? '1px solid var(--ion-border-color, rgba(0,0,0,0.08))' : 'none',
                  cursor: 'pointer',
                }}
              >
                <IonIcon icon={item.icon} style={{ fontSize: '1.3rem', color: 'var(--ion-color-dark)' }} />
                <span style={{ flex: 1, fontWeight: 600, fontSize: '1rem' }}>{item.label}</span>
                <IonIcon icon={chevronForwardOutline} style={{ color: 'var(--ion-color-medium)' }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Exit / Delete ── */}
        <div style={{ padding: '24px 16px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => setShowLogoutAlert(true)}
            style={{
              width: '100%', padding: '16px',
              background: 'var(--ion-card-background)',
              border: 'none', borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
              color: 'var(--ion-color-dark)',
            }}
          >
            <IonIcon icon={logOutOutline} />
            Exit Profile
          </button>
          <button
            onClick={() => setShowDeleteAlert(true)}
            style={{
              width: '100%', padding: '16px',
              background: 'rgba(var(--ion-color-danger-rgb, 235, 68, 68), 0.12)',
              border: 'none', borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
              color: 'var(--ion-color-danger)',
            }}
          >
            <IonIcon icon={trashOutline} />
            Delete Profile
          </button>
        </div>

        {/* ── Address Modal (regular user) ── */}
        <IonModal isOpen={showAddressModal} onDidDismiss={() => {
          setShowAddressModal(false);
          setAddressForm({ address: '' });
          setEditingAddressIndex(null);
        }}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton fill="clear" onClick={() => {
                  setShowAddressModal(false);
                  setAddressForm({ address: '' });
                  setEditingAddressIndex(null);
                }}>
                  <IonIcon icon={arrowBackOutline} />
                </IonButton>
              </IonButtons>
              <IonTitle>My Address</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {addresses.length > 0 && editingAddressIndex === null ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{
                  background: 'var(--ion-card-background)',
                  borderRadius: 16, padding: '20px 20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <IonIcon icon={locationOutline} style={{ fontSize: '1.8rem', color: 'var(--ion-color-primary)', flexShrink: 0 }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--ion-color-dark)', lineHeight: 1.4 }}>{addresses[0].address}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        setAddressForm({ address: addresses[0].address });
                        setEditingAddressIndex(0);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ion-color-primary)', padding: '8px 12px', fontSize: '0.95rem', fontWeight: 600 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteAddressAlert(true)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ion-color-danger)', padding: '8px 12px' }}
                    >
                      <IonIcon icon={trashOutline} style={{ fontSize: '1.3rem' }} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontWeight: 700, margin: '0 0 12px', color: 'var(--ion-color-dark)' }}>
                  {editingAddressIndex !== null ? 'Edit Address' : 'Add Address'}
                </p>
                <IonItem>
                  <IonLabel position="stacked">Address</IonLabel>
                  <IonInput
                    value={addressForm.address}
                    placeholder="Street, City"
                    onIonInput={(e) => setAddressForm({ address: String((e.target as HTMLIonInputElement).value ?? '') })}
                  />
                </IonItem>
                <IonButton expand="block" className="ion-margin-top" onClick={handleSaveAddress} disabled={savingAddress}>
                  {savingAddress ? <IonSpinner name="dots" /> : editingAddressIndex !== null ? 'Update' : 'Save Address'}
                </IonButton>
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* ── Reviews Modal ── */}
        <IonModal isOpen={showReviewsModal} onDidDismiss={() => setShowReviewsModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton fill="clear" onClick={() => setShowReviewsModal(false)}>
                  <IonIcon icon={arrowBackOutline} />
                </IonButton>
              </IonButtons>
              <IonTitle>My Reviews</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {loadingComments ? (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
                <IonSpinner />
              </div>
            ) : comments.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--ion-color-medium)', paddingTop: 40 }}>No reviews yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {comments.map((comment) => {
                  const product = typeof comment.productId === 'object' ? comment.productId : null;
                  return (
                    <div
                      key={comment._id}
                      onClick={() => handleGoToProduct(comment)}
                      style={{
                        background: 'var(--ion-card-background)',
                        borderRadius: 12, padding: '14px 16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        cursor: product?.restaurantId ? 'pointer' : 'default',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        {product?.image && (
                          <img src={product.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{product?.name ?? 'Product'}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--ion-color-medium)' }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteComment(comment); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ion-color-danger)', padding: 4 }}
                        >
                          <IonIcon icon={trashOutline} style={{ fontSize: '1.1rem' }} />
                        </button>
                        {product?.restaurantId && (
                          <IonIcon icon={chevronForwardOutline} style={{ fontSize: '1rem', color: 'var(--ion-color-medium)' }} />
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ion-color-dark)', lineHeight: 1.4 }}>{comment.text}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </IonContent>
        </IonModal>
      </IonContent>

      <IonAlert
        isOpen={showLogoutAlert}
        onDidDismiss={() => setShowLogoutAlert(false)}
        header="Exit Profile"
        message="Are you sure you want to log out?"
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Log Out', role: 'destructive', handler: handleLogout },
        ]}
      />
      <IonAlert
        isOpen={showDeleteAlert}
        onDidDismiss={() => setShowDeleteAlert(false)}
        header="Delete Profile"
        message="Your account will be permanently deleted. This cannot be undone."
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Delete', role: 'destructive', handler: handleDeleteAccount },
        ]}
      />
      <IonAlert
        isOpen={showDeleteAddressAlert}
        onDidDismiss={() => setShowDeleteAddressAlert(false)}
        header="Delete Address"
        message="Are you sure you want to delete this address?"
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Delete', role: 'destructive', handler: () => handleDeleteAddress(0) },
        ]}
      />
      <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMsg} duration={2500} />
    </IonPage>
  );
};

export default MyProfile;
