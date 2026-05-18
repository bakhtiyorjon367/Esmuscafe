import { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonModal,
  IonInput,
  IonTextarea,
  IonButtons,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/react';
import { closeOutline, imageOutline } from 'ionicons/icons';
import FloatingBackButton from '@/components/FloatingBackButton';
import api from '@/lib/api';
import { listenAdminOpenAddRestaurant } from '@/lib/adminDashboard';
import { IMAGE_COMPRESS_FAILED } from '@/lib/compress-image-for-upload';
import { restaurantImageSrcForDisplay, restaurantThumbSrcForDisplay } from '@/lib/restaurant-images';
import { uploadRestaurantImage } from '@/lib/upload-restaurant-image';
import type { Restaurant } from '@/types';

const emptyForm = () => ({
  name: '',
  description: '',
  address: '',
  ownerNickname: '',
  ownerLogin: '',
  ownerPassword: '',
  ownerNewPassword: '',
});

const AdminRestaurants: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState(emptyForm());
  const [storedImage, setStoredImage] = useState('');
  const [pendingImage, setPendingImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const resetImageState = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
    setStoredImage('');
  };

  const openAddRestaurantModal = () => {
    setEditingRestaurant(null);
    setFormData(emptyForm());
    resetImageState();
    setShowModal(true);
  };

  const closeRestaurantModal = () => {
    setShowModal(false);
    setEditingRestaurant(null);
    setFormData(emptyForm());
    resetImageState();
    if (new URLSearchParams(location.search).get('add') === '1') {
      history.replace('/admin/restaurants');
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') !== '1') return;
    openAddRestaurantModal();
  }, [location.search]);

  useEffect(() => listenAdminOpenAddRestaurant(openAddRestaurantModal), []);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants/admin/all');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleRemoveImage = () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    setPendingImage(null);
    setStoredImage('');
  };

  const displayImageSrc = pendingImage?.previewUrl
    ?? (storedImage ? restaurantImageSrcForDisplay(storedImage) : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasImage = !!(storedImage || pendingImage);
    if (!hasImage) {
      alert('Please add a restaurant photo');
      return;
    }
    try {
      let restaurantId: string;
      if (editingRestaurant) {
        const payload: Record<string, string> = {
          name: formData.name,
          description: formData.description,
          address: formData.address,
        };
        const n = formData.ownerNickname.trim();
        const l = formData.ownerLogin.trim();
        const p = formData.ownerNewPassword.trim();
        if (n) payload.ownerNickname = n;
        if (l) payload.ownerLogin = l;
        if (p) payload.ownerNewPassword = p;
        await api.patch(`/restaurants/${editingRestaurant._id}`, payload);
        restaurantId = editingRestaurant._id;
      } else {
        const res = await api.post('/restaurants', {
          name: formData.name,
          description: formData.description,
          image: '',
          address: formData.address,
          ownerNickname: formData.ownerNickname.trim(),
          ownerLogin: formData.ownerLogin.trim(),
          ownerPassword: formData.ownerPassword,
        });
        restaurantId = res.data._id;
      }
      if (pendingImage) {
        await uploadRestaurantImage(restaurantId, pendingImage.file);
      }
      closeRestaurantModal();
      fetchRestaurants();
    } catch (error) {
      console.error('Failed to save restaurant:', error);
      const msg = error instanceof Error && error.message === IMAGE_COMPRESS_FAILED
        ? 'Could not prepare the photo for upload. Try another image.'
        : error instanceof Error ? error.message : 'Failed to save restaurant';
      alert(msg);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    resetImageState();
    setEditingRestaurant(restaurant);
    const raw = restaurant.ownerId;
    const ownerNickname =
      typeof raw === 'object' && raw != null && 'nickname' in raw
        ? String((raw as { nickname?: string }).nickname ?? '')
        : '';
    const ownerLogin =
      typeof raw === 'object' && raw != null && 'name' in raw
        ? String((raw as { name?: string }).name ?? '')
        : '';
    setFormData({
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address ?? '',
      ownerNickname,
      ownerLogin,
      ownerPassword: '',
      ownerNewPassword: '',
    });
    setStoredImage(restaurant.image ?? '');
    setShowModal(true);
  };

  const handleStatusChange = async (restaurant: Restaurant, newStatus: Restaurant['status']) => {
    setTogglingId(restaurant._id);
    try {
      await api.patch(`/restaurants/${restaurant._id}`, { status: newStatus });
      setRestaurants((prev) =>
        prev.map((r) => (r._id === restaurant._id ? { ...r, status: newStatus } : r)),
      );
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setTogglingId(null);
    }
  };

  const isEdit = !!editingRestaurant;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Main</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
            <IonSpinner />
          </div>
        ) : (
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            {restaurants.map((restaurant) => (
              <IonCard key={restaurant._id} style={{ margin: '0 0 12px' }}>
                <IonCardContent className="ion-no-padding">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
                    {restaurant.image ? (
                      <img
                        src={restaurantThumbSrcForDisplay(restaurant.image)}
                        alt={restaurant.name}
                        style={{ width: 62, height: 62, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{ width: 62, height: 62, borderRadius: 10, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, color: '#9ca3af' }}
                      >
                        No Image
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '1.05rem' }}>
                        {restaurant.name}
                      </strong>
                      <span style={{ fontSize: '0.875rem', color: 'var(--ion-color-medium)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                        {restaurant.description}
                      </span>
                      {restaurant.address && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--ion-color-medium)' }}>
                          {restaurant.address}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 8, flexShrink: 0 }}>
                      <select
                        value={restaurant.status}
                        disabled={togglingId === restaurant._id}
                        onChange={(e) => handleStatusChange(restaurant, e.target.value as Restaurant['status'])}
                        style={{
                          border: '1px solid #d1d5db',
                          borderRadius: 8,
                          padding: '5px 8px',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: togglingId === restaurant._id ? 'not-allowed' : 'pointer',
                          opacity: togglingId === restaurant._id ? 0.6 : 1,
                          background: restaurant.status === 'active' ? '#dcfce7'
                            : restaurant.status === 'inactive' ? '#fee2e2'
                            : '#f3f4f6',
                          color: restaurant.status === 'active' ? '#166534'
                            : restaurant.status === 'inactive' ? '#991b1b'
                            : '#374151',
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="deleted">Delete</option>
                      </select>
                      <IonButton
                        size="small"
                        fill="outline"
                        onClick={() => handleEdit(restaurant)}
                        style={{ margin: 0, '--padding-start': '10px', '--padding-end': '10px' } as React.CSSProperties}
                      >
                        Edit
                      </IonButton>
                    </div>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        <IonModal isOpen={showModal} onDidDismiss={closeRestaurantModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{isEdit ? 'Edit Restaurant' : 'Add Restaurant'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={closeRestaurantModal}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {showModal && (
              <FloatingBackButton aboveTabBar={false} onBack={closeRestaurantModal} />
            )}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Name</label>
                <IonInput
                  value={formData.name}
                  onIonInput={(e) => setFormData({ ...formData, name: String((e.target as HTMLIonInputElement).value ?? '') })}
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Description</label>
                <IonTextarea
                  value={formData.description}
                  onIonInput={(e) => setFormData({ ...formData, description: String((e.target as HTMLIonTextareaElement).value ?? '') })}
                  rows={3}
                  required
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Restaurant photo</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: 'none' }}
                  onChange={handlePickImage}
                />
                {displayImageSrc && (
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
                    <img
                      src={displayImageSrc}
                      alt=""
                      style={{ width: 96, height: 96, borderRadius: 10, objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      aria-label="Remove image"
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'var(--ion-color-danger)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <IonIcon icon={closeOutline} style={{ fontSize: 14 }} />
                    </button>
                  </div>
                )}
                {!displayImageSrc && (
                  <IonButton type="button" fill="outline" size="small" onClick={() => imageInputRef.current?.click()}>
                    <IonIcon icon={imageOutline} slot="start" />
                    Add image
                  </IonButton>
                )}
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.fieldLabel}>Address</label>
                <IonInput
                  value={formData.address}
                  onIonInput={(e) => setFormData({ ...formData, address: String((e.target as HTMLIonInputElement).value ?? '') })}
                />
              </div>

              {isEdit ? (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>Owner nickname (login)</label>
                    <IonInput
                      value={formData.ownerNickname}
                      onIonInput={(e) => setFormData({ ...formData, ownerNickname: String((e.target as HTMLIonInputElement).value ?? '') })}
                      placeholder="Leave unchanged if empty"
                    />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>Owner display name</label>
                    <IonInput
                      value={formData.ownerLogin}
                      onIonInput={(e) => setFormData({ ...formData, ownerLogin: String((e.target as HTMLIonInputElement).value ?? '') })}
                      placeholder="Leave unchanged if empty"
                    />
                  </div>
                  <div style={{ ...styles.fieldGroup, borderBottom: 'none' }}>
                    <label style={styles.fieldLabel}>New password</label>
                    <IonInput
                      type="password"
                      value={formData.ownerNewPassword}
                      onIonInput={(e) => setFormData({ ...formData, ownerNewPassword: String((e.target as HTMLIonInputElement).value ?? '') })}
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>Owner nickname (login)</label>
                    <IonInput
                      value={formData.ownerNickname}
                      onIonInput={(e) => setFormData({ ...formData, ownerNickname: String((e.target as HTMLIonInputElement).value ?? '') })}
                      required
                    />
                  </div>
                  <div style={styles.fieldGroup}>
                    <label style={styles.fieldLabel}>Owner display name</label>
                    <IonInput
                      value={formData.ownerLogin}
                      onIonInput={(e) => setFormData({ ...formData, ownerLogin: String((e.target as HTMLIonInputElement).value ?? '') })}
                      required
                    />
                  </div>
                  <div style={{ ...styles.fieldGroup, borderBottom: 'none' }}>
                    <label style={styles.fieldLabel}>Owner password</label>
                    <IonInput
                      type="password"
                      value={formData.ownerPassword}
                      onIonInput={(e) => setFormData({ ...formData, ownerPassword: String((e.target as HTMLIonInputElement).value ?? '') })}
                      required
                    />
                  </div>
                </>
              )}

              <IonButton type="submit" expand="block" style={{ marginTop: 20 }}>Save</IonButton>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

const styles: Record<string, React.CSSProperties> = {
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

export default AdminRestaurants;
