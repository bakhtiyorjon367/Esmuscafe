import { useEffect, useMemo, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonSpinner,
  IonText,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
} from '@ionic/react';
import TabPageHeader from '@/components/TabPageHeader';
import ProductGrid from '@/components/ProductGrid';
import api from '@/lib/api';
import { getCategoryRestaurantId, setCategoryRestaurantId } from '@/lib/categoryRestaurant';
import type { Product, Restaurant } from '@/types';

const CATEGORY_ALL = 'All';

const Category: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(getCategoryRestaurantId());
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Restaurant[]>('/restaurants')
      .then((r) => {
        setRestaurants(r.data);
        const stored = getCategoryRestaurantId();
        if (stored && r.data.some((x) => x._id === stored)) {
          setRestaurantId(stored);
        } else if (r.data.length === 1) {
          const id = r.data[0]._id;
          setRestaurantId(id);
          setCategoryRestaurantId(id);
        }
      })
      .catch(() => setError('Failed to load restaurants'))
      .finally(() => setLoadingRestaurants(false));
  }, []);

  useEffect(() => {
    if (!restaurantId) {
      setProducts([]);
      return;
    }
    setLoadingProducts(true);
    setCategoryRestaurantId(restaurantId);
    api
      .get<Product[]>(`/products?restaurantId=${restaurantId}`)
      .then((r) => setProducts(r.data))
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoadingProducts(false));
  }, [restaurantId]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return [CATEGORY_ALL, ...Array.from(set).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === CATEGORY_ALL) return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const selectedRestaurant = restaurants.find((r) => r._id === restaurantId);

  return (
    <IonPage>
      <TabPageHeader title="Category" />
      <IonContent scrollY={false} className="category-ion-content">
        {loadingRestaurants ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <IonSpinner />
          </div>
        ) : error ? (
          <div className="ion-padding ion-text-center">
            <IonText color="danger"><p>{error}</p></IonText>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="ion-padding ion-text-center">
            <IonText color="medium"><p>No restaurants available</p></IonText>
          </div>
        ) : !restaurantId ? (
          <div className="ion-padding">
            <IonText color="medium">
              <p style={{ marginBottom: 16 }}>Open a restaurant from Main, or pick one below:</p>
            </IonText>
            <IonItem>
              <IonLabel>Restaurant</IonLabel>
              <IonSelect
                placeholder="Select restaurant"
                onIonChange={(e) => setRestaurantId(String(e.detail.value ?? ''))}
              >
                {restaurants.map((r) => (
                  <IonSelectOption key={r._id} value={r._id}>
                    {r.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </div>
        ) : (
          <>
            {restaurants.length > 1 && (
              <IonItem lines="full" style={{ '--padding-start': '12px' } as React.CSSProperties}>
                <IonLabel position="stacked">Restaurant</IonLabel>
                <IonSelect
                  value={restaurantId}
                  onIonChange={(e) => {
                    setSelectedCategory(CATEGORY_ALL);
                    setRestaurantId(String(e.detail.value ?? ''));
                  }}
                >
                  {restaurants.map((r) => (
                    <IonSelectOption key={r._id} value={r._id}>
                      {r.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            )}
            <div className="category-layout">
              <aside className="category-sidebar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-item ${selectedCategory === cat ? 'category-item--active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </aside>
              <div className="category-products">
                {selectedRestaurant && (
                  <p
                    style={{
                      margin: '0 8px 8px',
                      fontSize: 13,
                      color: 'var(--ion-color-medium)',
                      fontWeight: 600,
                    }}
                  >
                    {selectedRestaurant.name}
                  </p>
                )}
                <ProductGrid
                  products={filteredProducts}
                  restaurantId={restaurantId}
                  isLoading={loadingProducts}
                />
              </div>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Category;
