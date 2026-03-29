import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { IonBadge, IonIcon } from '@ionic/react';
import { heart, heartOutline, chatbubbleOutline, addCircle, checkmarkCircle, createOutline, trashOutline } from 'ionicons/icons';
import type { Product } from '@/types';
import { useCart } from '../context/CartContext';
import { isAuthenticated } from '../lib/auth';
import api from '../lib/api';
import { useReadyCountdown, formatReadyAt } from '../hooks/useReadyCountdown';

interface OwnerActions {
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

interface ProductListItemProps {
  product: Product;
  restaurantId: string;
  onLikeUpdate?: (productId: string, likeCount: number, liked: boolean) => void;
  /** When provided, shows Edit/Delete instead of Like/Cart (owner dashboard mode) */
  ownerActions?: OwnerActions;
  /** Hide the add-to-cart button */
  hideCart?: boolean;
}

const FLY_DURATION = 620;

const ProductListItem: React.FC<ProductListItemProps> = ({ product, restaurantId, onLikeUpdate, ownerActions, hideCart }) => {
  const history = useHistory();
  const { addItem, cart } = useCart();
  const loggedIn = isAuthenticated();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(product.likeCount ?? 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [flyStyle, setFlyStyle] = useState<React.CSSProperties | null>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ownerActions || !loggedIn) return;
    api.get('/auth/profile').then((r) => {
      const uid = r.data.id;
      setLiked(Array.isArray(product.likes) && product.likes.includes(uid));
    }).catch(() => {});
  }, [product._id, loggedIn, ownerActions]);

  const finalPrice = product.price - (product.discount || 0);
  const remainingMinutes = useReadyCountdown(product.readyAt, product.updatedAt);
  const isReady = remainingMinutes === null;

  const triggerFlyAnimation = useCallback(() => {
    const imgEl = imgContainerRef.current;
    if (!imgEl) return;
    const src = imgEl.getBoundingClientRect();
    const cartBtn = document.querySelector('[data-cart-icon]') as HTMLElement | null;
    let destX = window.innerWidth - 32;
    let destY = 16;
    if (cartBtn) {
      const cr = cartBtn.getBoundingClientRect();
      destX = cr.left + cr.width / 2;
      destY = cr.top + cr.height / 2;
    }
    const size = src.width;
    setFlyStyle({
      position: 'fixed', left: src.left, top: src.top, width: size, height: src.height,
      borderRadius: 8, overflow: 'hidden', pointerEvents: 'none', zIndex: 9999,
      transition: `transform ${FLY_DURATION}ms cubic-bezier(0.4,0,0.2,1), opacity ${FLY_DURATION}ms ease`,
      transform: 'scale(1)', opacity: 1,
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const tx = destX - src.left - size / 2;
        const ty = destY - src.top - src.height / 2;
        setFlyStyle((prev) => prev ? { ...prev, transform: `translate(${tx}px,${ty}px) scale(0.15)`, opacity: 0 } : null);
      });
    });
    setTimeout(() => setFlyStyle(null), FLY_DURATION + 100);
  }, []);

  const cartQuantity = (() => {
    if (!cart) return 0;
    const item = cart.items.find((i) => {
      const id = typeof i.productId === 'string' ? i.productId : (i.productId as any)._id;
      return id === product._id;
    });
    return item?.quantity ?? 0;
  })();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loggedIn) { history.replace(`/login?redirect=${encodeURIComponent(history.location.pathname + history.location.search)}`); return; }
    if (cartQuantity > 0) return;
    try {
      await addItem(product._id);
      triggerFlyAnimation();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Could not add to cart');
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loggedIn) { history.replace(`/login?redirect=${encodeURIComponent(history.location.pathname + history.location.search)}`); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await api.post(`/products/${product._id}/like`);
      const { likeCount: newCount, liked: newLiked } = res.data;
      setLiked(newLiked);
      setLikeCount(newCount);
      onLikeUpdate?.(product._id, newCount, newLiked);
    } catch {
      // ignore
    } finally {
      setLikeLoading(false);
    }
  };

  const handleNavigate = () => {
    history.push(`/restaurant/${restaurantId}/product/${product._id}`);
  };

  const bottomRow = ownerActions ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <button
        onClick={(e) => { e.stopPropagation(); ownerActions.onEdit(product); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 6, color: 'var(--ion-color-primary)', fontSize: '0.8rem' }}
      >
        <IonIcon icon={createOutline} style={{ fontSize: '0.95rem' }} />
        Edit
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); ownerActions.onDelete(product._id); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 6, color: 'var(--ion-color-danger)', fontSize: '0.8rem' }}
      >
        <IonIcon icon={trashOutline} style={{ fontSize: '0.95rem' }} />
        Delete
      </button>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
      <button
        onClick={handleLike}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: 0, color: liked ? 'var(--ion-color-danger)' : 'var(--ion-color-medium)' }}
      >
        <IonIcon icon={liked ? heart : heartOutline} style={{ fontSize: '1rem' }} />
        <span style={{ fontSize: '0.8rem' }}>{likeCount}</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); handleNavigate(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: 0, color: 'var(--ion-color-medium)' }}
      >
        <IonIcon icon={chatbubbleOutline} style={{ fontSize: '1rem' }} />
        <span style={{ fontSize: '0.8rem' }}>{product.commentCount ?? 0}</span>
      </button>
    </div>
  );

  return (
    <>
      {flyStyle && (
        <div style={flyStyle}>
          <img src={product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <div
        onClick={handleNavigate}
        style={{
          display: 'flex',
          alignItems: 'stretch',
          background: 'var(--ion-card-background)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          marginBottom: 12,
          cursor: 'pointer',
          minHeight: 110,
          maxHeight: 120,
        }}
      >
        {/* Left: product details */}
        <div style={{ flex: 1, padding: '12px 12px 8px', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, lineHeight: 1.2 }}>
            {product.name}
          </h4>

          {product.ingredients && (
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--ion-color-medium)', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
              {product.ingredients}
            </p>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            {product.discount > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--ion-color-medium)', textDecoration: 'line-through' }}>
                {product.price.toFixed(0)} ₩
              </span>
            )}
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--ion-color-primary)' }}>
              {finalPrice.toFixed(0)} ₩
            </span>
          </div>

          {bottomRow}
        </div>

        {/* Right: image */}
        <div ref={imgContainerRef} style={{ position: 'relative', width: 110, flexShrink: 0, alignSelf: 'stretch', minHeight: 110 }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: !isReady ? 'blur(3px) brightness(0.6)' : undefined }}
          />

          {!isReady && remainingMinutes !== null && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', padding: 4 }}>
              <span style={{ fontSize: '1.1rem' }}>⏱</span>
              <span>{formatReadyAt(remainingMinutes)}</span>
            </div>
          )}

          {!product.isAvailable && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>Unavailable</span>
            </div>
          )}

          {(product.tags?.includes('new') || product.tags?.includes('suggested')) && (
            <div style={{ position: 'absolute', bottom: 6, left: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {product.tags?.includes('new') && (
                <IonBadge color="success" style={{ fontSize: '0.6rem' }}>New</IonBadge>
              )}
              {product.tags?.includes('suggested') && (
                <IonBadge color="warning" style={{ fontSize: '0.6rem' }}>Suggested</IonBadge>
              )}
            </div>
          )}

          {!ownerActions && !hideCart && product.isAvailable && (
            <button
              onClick={handleAddToCart}
              disabled={cartQuantity > 0}
              style={{
                position: 'absolute', bottom: 6, right: 6,
                background: cartQuantity > 0 ? 'var(--ion-color-success)' : 'var(--ion-color-primary)',
                border: 'none', borderRadius: '50%',
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: cartQuantity > 0 ? 'default' : 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                padding: 0,
                opacity: cartQuantity > 0 ? 0.9 : 1,
              }}
            >
              <IonIcon
                icon={cartQuantity > 0 ? checkmarkCircle : addCircle}
                style={{ fontSize: '1.1rem', color: 'white' }}
              />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductListItem;
