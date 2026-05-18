import { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import RestaurantCard from '@/components/RestaurantCard';
import api from '@/lib/api';
import { isAuthenticated, getProfile } from '@/lib/auth';
import { clearCategoryRestaurantId } from '@/lib/categoryRestaurant';
import type { Restaurant } from '@/types';

const Home: React.FC = () => {
  const history = useHistory();
  const loggedIn = isAuthenticated();
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
  }, [loggedIn, history]);

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
    clearCategoryRestaurantId();
    fetchRestaurants();
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Chuncheon</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="ion-text-center ion-padding">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Choose a restaurant</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
            Select a restaurant to browse the menu
          </p>
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
