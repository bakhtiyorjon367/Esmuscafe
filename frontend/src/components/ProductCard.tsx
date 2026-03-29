import React from 'react';
import { IonCard, IonCardContent } from '@ionic/react';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const finalPrice = product.price - (product.discount || 0);

  return (
    <IonCard>
      <div style={{ position: 'relative', height: 160, width: '100%' }}>
        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {!product.isAvailable && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 600 }}>Unavailable</span>
          </div>
        )}
      </div>
      <IonCardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h4 style={{ margin: 0 }}>{product.name}</h4>
            <span style={{ fontSize: '0.75rem', background: 'var(--ion-color-light)', padding: '2px 8px', borderRadius: 4 }}>{product.category}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            {product.discount > 0 && <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--ion-color-medium)', textDecoration: 'line-through' }}>${product.price.toFixed(2)}</p>}
            <p style={{ margin: 0, fontWeight: 700 }}>${finalPrice.toFixed(2)}</p>
          </div>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: 'var(--ion-color-medium)' }}>{product.description}</p>
      </IonCardContent>
    </IonCard>
  );
};

export default ProductCard;
