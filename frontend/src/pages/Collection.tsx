import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
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
} from '@ionic/react';
import { arrowBackOutline, heartDislikeOutline, cartOutline } from 'ionicons/icons';
import api from '@/lib/api';
import { getTokenRole } from '@/lib/auth';
import type { Product, Restaurant } from '@/types';
import ProductListItem from '@/components/ProductListItem';
import { useCart } from '../context/CartContext';

const Collection: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { totalItems } = useCart();
  const isUser = getTokenRole() === 'user';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const restaurantId = new URLSearchParams(location.search).get('restaurantId');

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('/products/liked')
      .then((r) => {
        const all: Product[] = r.data;
        const filtered = restaurantId
          ? all.filter((p) => {
              const rid = typeof p.restaurantId === 'string' ? p.restaurantId : (p.restaurantId as Restaurant)._id;
              return rid === restaurantId;
            })
          : all;
        setProducts(filtered);
      })
      .catch(() => setError('Failed to load your collection'))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const handleLikeUpdate = (productId: string, _likeCount: number, liked: boolean) => {
    if (!liked) {
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    }
  };

  const getRestaurantId = (product: Product): string => {
    if (typeof product.restaurantId === 'string') return product.restaurantId;
    return (product.restaurantId as Restaurant)._id;
  };

  const title = restaurantId ? 'Liked' : 'My Collection';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>{title}</IonTitle>
          {isUser && (
            <IonButtons slot="end">
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
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <IonSpinner />
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--ion-color-danger)' }}>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: 60, color: 'var(--ion-color-medium)' }}>
            <IonIcon icon={heartDislikeOutline} style={{ fontSize: '3rem', marginBottom: 12 }} />
            <p style={{ fontWeight: 600, fontSize: '1rem', margin: '0 0 6px' }}>No liked products yet</p>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>
              {restaurantId ? 'Like some products from this restaurant' : 'Browse restaurants and heart products you love'}
            </p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div style={{ maxWidth: '32rem', margin: '0 auto' }}>
            {products.map((product) => (
              <ProductListItem
                key={product._id}
                product={product}
                restaurantId={getRestaurantId(product)}
                onLikeUpdate={handleLikeUpdate}
                hideCart
              />
            ))}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Collection;
