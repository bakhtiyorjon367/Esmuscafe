import { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonBadge,
  IonSpinner,
  useIonViewWillEnter,
} from '@ionic/react';
import { cartOutline, personOutline, heartOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import RestaurantCard from '@/components/RestaurantCard';
import api from '@/lib/api';
import { isAuthenticated, getProfile, getTokenRole } from '@/lib/auth';
import { useCart } from '../context/CartContext';
import type { Restaurant } from '@/types';

const Home: React.FC = () => {
  const history = useHistory();
  const loggedIn = isAuthenticated();
  const isUser = getTokenRole() === 'user';
  const { totalItems } = useCart();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loggedIn) {
      getProfile()
        .then((user) => {
          if (user.role === 'restaurant_owner') history.replace('/dashboard/products');
          else if (user.role === 'admin') history.replace('/admin/restaurants');
        })
        .catch(() => {});
    }
  }, []);

  const fetchRestaurants = () => {
    api.get('/restaurants')
      .then((r) => setRestaurants(r.data))
      .catch(() => setError('Failed to load restaurants'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useIonViewWillEnter(() => {
    fetchRestaurants();
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Esmuscafe</IonTitle>
          <IonButtons slot="end">
            {isUser && (
              <IonButton onClick={() => history.push('/collection')}>
                <IonIcon icon={heartOutline} />
              </IonButton>
            )}
            {isUser && (
              <IonButton onClick={() => history.push('/cart')} style={{ position: 'relative' }}>
                <IonIcon icon={cartOutline} />
                {totalItems > 0 && (
                  <IonBadge
                    color="danger"
                    style={{ position: 'absolute', top: 2, right: 2, fontSize: '0.6rem', minWidth: 16, height: 16, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}
                  >
                    {totalItems}
                  </IonBadge>
                )}
              </IonButton>
            )}
            <IonButton onClick={() => history.push(loggedIn ? '/my' : '/login')}>
              <IonIcon icon={personOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="ion-text-center ion-padding">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Welcome to Esmuscafe</h1>
        </div>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 24 }}>
            <IonSpinner />
          </div>
        )}
        {error && (
          <div className="ion-text-center ion-padding">
            <p style={{ color: 'var(--ion-color-danger)' }}>{error}</p>
          </div>
        )}
        {!loading && !error && restaurants.length === 0 && (
          <div className="ion-text-center ion-padding">
            <p>No restaurants available</p>
          </div>
        )}
        {!loading && !error && restaurants.length > 0 && (
          <div style={{ maxWidth: '32rem', margin: '0 auto' }}>
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
