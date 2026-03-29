import { useEffect, useState, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
} from '@ionic/react';
import { cartOutline, personOutline, heartOutline, arrowBackOutline } from 'ionicons/icons';
import { useParams, useHistory } from 'react-router-dom';
import ProductListItem from '@/components/ProductListItem';
import api from '@/lib/api';
import { isAuthenticated, getTokenRole } from '@/lib/auth';
import { useCart } from '../context/CartContext';
import type { Restaurant, Product } from '@/types';

const CATEGORY_ALL = 'All';

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const restaurantId = id ?? '';
  const loggedIn = isAuthenticated();
  const isUser = getTokenRole() === 'user';
  const { totalItems } = useCart();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);

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

  const handleLikeUpdate = (productId: string, likeCount: number, liked: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, likeCount, likes: liked ? ['me'] : [] } : p)),
    );
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
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  if (error || !restaurant) {
    return (
      <IonPage>
        <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Error</IonTitle>
        </IonToolbar>
      </IonHeader>
        <IonContent className="ion-padding">
          <p style={{ color: 'var(--ion-color-danger)' }}>{error || 'Restaurant not found'}</p>
          <IonButton onClick={() => history.goBack()}>Back</IonButton>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>{restaurant.name}</IonTitle>
          <IonButtons slot="end">
            {isUser && (
              <IonButton onClick={() => history.push(`/collection?restaurantId=${restaurantId}`)}>
                <IonIcon icon={heartOutline} />
              </IonButton>
            )}
            {isUser && (
              <IonButton data-cart-icon onClick={() => history.push('/cart')} style={{ position: 'relative' }}>
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
        <IonToolbar>
          <IonSegment
            scrollable
            value={selectedCategory}
            onIonChange={(e) => setSelectedCategory(String(e.detail.value ?? CATEGORY_ALL))}
          >
            {categories.map((cat) => (
              <IonSegmentButton key={cat} value={cat}>
                <IonLabel>{cat}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {filteredProducts.length === 0 ? (
          <p className="ion-text-center" style={{ color: 'var(--ion-color-medium)', marginTop: 32 }}>
            No products in this category
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredProducts.map((product) => (
              <ProductListItem
                key={product._id}
                product={product}
                restaurantId={restaurantId}
                onLikeUpdate={handleLikeUpdate}
              />
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default RestaurantDetail;
