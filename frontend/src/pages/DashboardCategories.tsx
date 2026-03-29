import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  IonAlert,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonModal,
  IonInput,
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import api from '@/lib/api';
import { getProfile, removeToken } from '@/lib/auth';
import type { User } from '@/types';

interface CategoryItem {
  _id: string;
  name: string;
}

const DashboardCategories: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userProfile = await getProfile();
      setUser(userProfile);
      if (userProfile.restaurantId) {
        const res = await api.get(`/categories?restaurantId=${userProfile.restaurantId}`);
        setCategories(res.data ?? []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restaurantId || !newCategoryName.trim()) return;
    try {
      await api.post('/categories', { name: newCategoryName.trim() });
      setShowModal(false);
      setNewCategoryName('');
      fetchData();
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('Failed to add category. It may already exist.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products using it will keep the category name as text.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Failed to delete category');
    }
  };

  if (!user) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonTitle>Categories</IonTitle></IonToolbar></IonHeader>
        <IonContent className="ion-padding">
          {loading ? <p className="ion-text-center">Loading...</p> : null}
        </IonContent>
      </IonPage>
    );
  }

  if (!user.restaurantId) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonTitle>Categories</IonTitle></IonToolbar></IonHeader>
        <IonContent className="ion-padding">
          <p style={{ color: 'var(--ion-color-danger)' }}>No restaurant assigned to your account</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => setShowLogoutConfirm(true)} aria-label="Log out">
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
            <IonButton
              fill={location.pathname === '/dashboard/products' ? 'solid' : 'clear'}
              color={location.pathname === '/dashboard/products' ? 'primary' : undefined}
              onClick={() => history.push('/dashboard/products')}
            >
              Products
            </IonButton>
            <IonButton
              fill={location.pathname === '/dashboard/categories' ? 'solid' : 'clear'}
              color={location.pathname === '/dashboard/categories' ? 'primary' : undefined}
              onClick={() => history.push('/dashboard/categories')}
            >
              Categories
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={() => { setNewCategoryName(''); setShowModal(true); }}>Add</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonAlert
        isOpen={showLogoutConfirm}
        onDidDismiss={() => setShowLogoutConfirm(false)}
        header="Log out"
        message="Are you sure you want to log out?"
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Logout', handler: () => { removeToken(); history.replace('/'); } },
        ]}
      />
      <IonContent className="ion-padding">
        {loading ? (
          <p className="ion-text-center">Loading...</p>
        ) : categories.length === 0 ? (
          <p className="ion-text-center">No categories yet. Add one to use in products.</p>
        ) : (
          <IonList>
            {categories.map((cat) => (
              <IonItem key={cat._id}>
                <IonLabel>{cat.name}</IonLabel>
                <IonButton fill="clear" color="danger" size="small" onClick={() => handleDelete(cat._id)}>Delete</IonButton>
              </IonItem>
            ))}
          </IonList>
        )}

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add category</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={handleAdd}>
              <IonItem>
                <IonLabel position="stacked">Name</IonLabel>
                <IonInput
                  value={newCategoryName}
                  onIonInput={(e) => setNewCategoryName(String((e.target as HTMLIonInputElement).value ?? ''))}
                  placeholder="e.g. Desserts"
                  required
                />
              </IonItem>
              <IonButton type="submit" expand="block" className="ion-margin-top">Save</IonButton>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default DashboardCategories;
