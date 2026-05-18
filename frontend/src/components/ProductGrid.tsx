import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonImg,
  IonSkeletonText,
  IonText,
  IonIcon,
  IonButton,
} from '@ionic/react';
import { createOutline, trashOutline } from 'ionicons/icons';
import type { Product } from '@/types';

interface OwnerActions {
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

interface ProductGridProps {
  products: Product[];
  restaurantId: string;
  isLoading?: boolean;
  ownerActions?: OwnerActions;
}

const GRID_STYLE: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 8,
  padding: '0 8px 16px',
};

function formatPrice(product: Product): string {
  const finalPrice = product.price - (product.discount || 0);
  return `${finalPrice.toFixed(0)} ₩`;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  restaurantId,
  isLoading = false,
  ownerActions,
}) => {
  if (isLoading) {
    return (
      <div className="product-grid" style={GRID_STYLE}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <IonCard key={i} style={{ margin: 0 }}>
            <IonSkeletonText animated style={{ width: '100%', height: 140 }} />
            <IonCardHeader style={{ paddingBottom: 4 }}>
              <IonSkeletonText animated style={{ width: '80%', height: 16 }} />
            </IonCardHeader>
            <IonCardContent style={{ paddingTop: 0 }}>
              <IonSkeletonText animated style={{ width: '50%', height: 18 }} />
            </IonCardContent>
          </IonCard>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="product-grid" style={GRID_STYLE}>
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 24 }}>
          <IonText color="medium">
            <p style={{ margin: 0 }}>No products</p>
          </IonText>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid" style={GRID_STYLE}>
      {products.map((product) => {
        const link = `/restaurant/${restaurantId}/product/${product._id}`;
        return (
          <IonCard
            key={product._id}
            button={!ownerActions}
            routerLink={ownerActions ? undefined : link}
            style={{ margin: 0 }}
            onClick={ownerActions ? () => ownerActions.onEdit(product) : undefined}
          >
            {product.image && (
              <IonImg
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: 140, objectFit: 'cover' }}
              />
            )}
            <IonCardHeader style={{ paddingBottom: 4 }}>
              <IonCardTitle style={{ fontSize: 14, lineHeight: 1.25 }}>{product.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent style={{ paddingTop: 0 }}>
              <p className="product-grid-desc">{product.description ?? ''}</p>
              <IonText color="primary" style={{ fontWeight: 700, fontSize: 14 }}>
                {formatPrice(product)}
              </IonText>
              {ownerActions && (
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  <IonButton
                    fill="clear"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      ownerActions.onEdit(product);
                    }}
                  >
                    <IonIcon icon={createOutline} slot="start" />
                    Edit
                  </IonButton>
                  <IonButton
                    fill="clear"
                    size="small"
                    color="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      ownerActions.onDelete(product._id);
                    }}
                  >
                    <IonIcon icon={trashOutline} slot="start" />
                    Delete
                  </IonButton>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        );
      })}
    </div>
  );
};

export default ProductGrid;
