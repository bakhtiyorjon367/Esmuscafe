import { useEffect, useState, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
} from '@ionic/react';
import { cartOutline, heartOutline } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import ProductGrid from '@/components/ProductGrid';
import FloatingBackButton from '@/components/FloatingBackButton';
import api from '@/lib/api';
import { getTokenRole } from '@/lib/auth';
import { setCategoryRestaurantId } from '@/lib/categoryRestaurant';
import { useCart } from '../context/useCart';
import type { Restaurant, Product } from '@/types';

const CATEGORY_ALL = 'All';

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const restaurantId = id ?? '';
  const isUser = getTokenRole() === 'user';
  const { totalItems } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);

  useEffect(() => {
    if (restaurantId) {
      setCategoryRestaurantId(restaurantId);
    }
  }, [restaurantId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restaurantRes, productsRes] = await Promise.all([
          api.get(`/restaurants/${restaurantId}`),
          api.get(`/products?restaurantId=${restaurantId}`),
        ]);
        setRestaurant(restaurantRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        setError('Failed to load restaurant data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) fetchData();
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

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
          <IonSpinner />
        </IonContent>
        <FloatingBackButton defaultHref="/" />
      </IonPage>
    );
  }

  if (error || !restaurant) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Error</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p style={{ color: 'var(--ion-color-danger)' }}>{error || 'Restaurant not found'}</p>
        </IonContent>
        <FloatingBackButton defaultHref="/" />
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{restaurant.name}</IonTitle>
          {isUser && (
            <IonButtons slot="end">
              <IonButton onClick={() => history.push(`/collection?restaurantId=${restaurantId}`)}>
                <IonIcon icon={heartOutline} />
              </IonButton>
              <IonButton data-cart-icon onClick={() => history.push('/cart')} style={{ position: 'relative' }}>
                <IonIcon icon={cartOutline} />
                {totalItems > 0 && (
                  <IonBadge
                    color="danger"
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      fontSize: '0.6rem',
                      minWidth: 16,
                      height: 16,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                    }}
                  >
                    {totalItems}
                  </IonBadge>
                )}
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent scrollY={false} className="category-ion-content">
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
            <ProductGrid products={filteredProducts} restaurantId={restaurantId} />
          </div>
        </div>
      </IonContent>
      <FloatingBackButton defaultHref="/" />
    </IonPage>
  );
};

export default RestaurantDetail;
