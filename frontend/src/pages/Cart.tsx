import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { arrowBackOutline, addOutline, removeOutline, trashOutline } from 'ionicons/icons';
import { useCart, getProductId, getProductName, getProductImage, getEffectivePrice } from '../context/CartContext';
import type { Product } from '@/types';

const Cart: React.FC = () => {
  const history = useHistory();
  const { cart, loading, updateItem, removeItem, clear, refreshCart } = useCart();

  useEffect(() => {
    refreshCart();
  }, []);

  const items = cart?.items ?? [];

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = items.reduce((sum, item) => {
    return sum + getEffectivePrice(item) * item.quantity;
  }, 0);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Cart {totalQuantity > 0 ? `(${totalQuantity})` : ''}</IonTitle>
          {items.length > 0 && (
            <IonButtons slot="end">
              <IonButton fill="clear" color="danger" onClick={() => { if (confirm('Clear cart?')) clear(); }}>
                Clear
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading && items.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <IonSpinner />
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <p style={{ fontSize: '3rem' }}>🛒</p>
            <p style={{ color: 'var(--ion-color-medium)' }}>Your cart is empty</p>
            <IonButton onClick={() => history.push('/')}>Browse Restaurants</IonButton>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item) => {
                const pid = getProductId(item);
                const name = getProductName(item);
                const image = getProductImage(item);
                const price = getEffectivePrice(item);
                const product = typeof item.productId === 'object' ? item.productId as Product : null;

                return (
                  <div
                    key={pid}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--ion-card-background)',
                      borderRadius: 12,
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                      gap: 12,
                    }}
                  >
                    {image && (
                      <img
                        src={image}
                        alt={name}
                        style={{ width: 80, height: 80, objectFit: 'cover', flexShrink: 0 }}
                      />
                    )}
                    <div style={{ flex: 1, padding: '10px 0' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>{name}</p>
                      {product?.category && (
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--ion-color-medium)' }}>
                          {product.category}
                        </p>
                      )}
                      <p style={{ margin: '4px 0 0', fontWeight: 700, color: 'var(--ion-color-primary)' }}>
                        {(price * item.quantity).toFixed(0)} ₩
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 12 }}>
                      <IonButton
                        fill="clear"
                        size="small"
                        onClick={() => {
                          if (item.quantity <= 1) removeItem(pid);
                          else updateItem(pid, item.quantity - 1);
                        }}
                      >
                        <IonIcon icon={item.quantity <= 1 ? trashOutline : removeOutline} color={item.quantity <= 1 ? 'danger' : undefined} />
                      </IonButton>
                      <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                      <IonButton fill="clear" size="small" onClick={() => updateItem(pid, item.quantity + 1)}>
                        <IonIcon icon={addOutline} />
                      </IonButton>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total + Order */}
            <div style={{
              marginTop: 24,
              padding: 16,
              background: 'var(--ion-card-background)',
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: '1rem', fontWeight: 700 }}>Total</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ion-color-primary)' }}>
                  {totalPrice.toFixed(0)} ₩
                </span>
              </div>
              <IonButton expand="block" disabled>
                Place Order 
              </IonButton>
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Cart;
