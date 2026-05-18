import { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';
import TabPageHeader from '@/components/TabPageHeader';
import ProductGrid from '@/components/ProductGrid';
import api from '@/lib/api';
import { getCategoryRestaurantId } from '@/lib/categoryRestaurant';
import type { Product, Restaurant } from '@/types';

const RestaurantMain: React.FC = () => {
  const restaurantId = getCategoryRestaurantId();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    Promise.all([
      api.get<Restaurant>(`/restaurants/${restaurantId}`),
      api.get<Product[]>(`/products?restaurantId=${restaurantId}`),
    ])
      .then(([restaurantRes, productsRes]) => {
        setRestaurant(restaurantRes.data);
        setProducts(productsRes.data);
      })
      .catch(() => setError('Failed to load menu'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  if (!restaurantId) {
    return <Redirect to="/" />;
  }

  return (
    <IonPage>
      <TabPageHeader title={restaurant?.name ?? 'Menu'} showRestaurantPickerBack />
      <IonContent className="ion-padding-top">
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <IonSpinner />
          </div>
        )}
        {error && (
          <div className="ion-padding ion-text-center">
            <IonText color="danger"><p>{error}</p></IonText>
          </div>
        )}
        {!loading && !error && (
          <ProductGrid products={products} restaurantId={restaurantId} />
        )}
      </IonContent>
    </IonPage>
  );
};

export default RestaurantMain;
