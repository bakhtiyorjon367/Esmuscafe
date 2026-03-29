import { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
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
  IonInput,
  IonModal,
  IonTextarea,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonSelect,
  IonSelectOption,
  IonChip,
} from '@ionic/react';
import { heart, heartOutline, sendOutline, trashOutline, createOutline, addOutline, arrowBackOutline } from 'ionicons/icons';
import api from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import type { Product, Comment, User } from '@/types';
import { useReadyCountdown, formatReadyAt } from '@/hooks/useReadyCountdown';

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

interface CategoryItem { _id: string; name: string; }
interface ProductFormData {
  name: string; description: string; ingredients: string;
  price: number; discount: number; image: string; category: string;
  isAvailable: boolean; readyAt: number | ''; tags: ('suggested' | 'new')[];
}
const EMPTY_FORM: ProductFormData = {
  name: '', description: '', ingredients: '', price: 0, discount: 0,
  image: '', category: '', isAvailable: true, readyAt: '', tags: [],
};

const ProductDetail: React.FC = () => {
  const { restaurantId, productId } = useParams<{ restaurantId: string; productId: string }>();
  const history = useHistory();
  const loggedIn = isAuthenticated();

  const [product, setProduct] = useState<Product | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [myUser, setMyUser] = useState<User | null>(null);

  // Owner edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [saving, setSaving] = useState(false);

  // Live countdown – reads readyAt + updatedAt from product state
  const remainingMinutes = useReadyCountdown(product?.readyAt, product?.updatedAt);

  useEffect(() => {
    const init = async () => {
      try {
        const requests: Promise<any>[] = [
          api.get(`/products/${productId}`),
          api.get(`/products/${productId}/comments`),
        ];
        if (loggedIn) requests.push(api.get('/auth/profile'));
        const results = await Promise.all(requests);
        const [productRes, commentsRes, profileRes] = results;
        const p = productRes.data;
        setProduct(p);
        setLikeCount(p.likeCount ?? 0);
        setComments(commentsRes.data);
        if (profileRes) {
          const u: User = profileRes.data;
          setMyUser(u);
          setLiked(Array.isArray(p.likes) && p.likes.includes(u.id));
          if (u.role === 'restaurant_owner' && u.restaurantId) {
            api.get(`/categories?restaurantId=${u.restaurantId}`)
              .then((r) => setCategories(r.data ?? []))
              .catch(() => {});
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [productId, loggedIn]);

  const isOwner = myUser?.role === 'restaurant_owner' &&
    product &&
    String(typeof product.restaurantId === 'object' ? (product.restaurantId as any)._id : product.restaurantId) === myUser.restaurantId;

  const handleLike = async () => {
    if (!loggedIn) { history.replace(`/login?redirect=${encodeURIComponent(history.location.pathname)}`); return; }
    try {
      const res = await api.post(`/products/${productId}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.likeCount);
    } catch { /* ignore */ }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedIn) { history.replace(`/login?redirect=${encodeURIComponent(history.location.pathname)}`); return; }
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/products/${productId}/comments`, { text: commentText.trim() });
      setComments((prev) => [res.data, ...prev]);
      setCommentText('');
      if (product) setProduct({ ...product, commentCount: (product.commentCount ?? 0) + 1 });
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/products/${productId}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (product) setProduct({ ...product, commentCount: Math.max(0, (product.commentCount ?? 0) - 1) });
    } catch {
      // ignore
    }
  };

  const openEditModal = () => {
    if (!product) return;
    setFormData({
      name: product.name,
      description: product.description,
      ingredients: product.ingredients ?? '',
      price: product.price,
      discount: product.discount,
      image: product.image,
      category: product.category,
      isAvailable: product.isAvailable,
      readyAt: product.readyAt ?? '',
      tags: (product.tags as ('suggested' | 'new')[]) ?? [],
    });
    setShowEditModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const price = Number(formData.price);
    const discount = Number(formData.discount);
    if (isNaN(price) || price < 0 || isNaN(discount) || discount < 0) return;
    setSaving(true);
    try {
      const res = await api.patch(`/products/${product._id}`, {
        name: formData.name,
        description: formData.description,
        ingredients: formData.ingredients,
        price,
        discount,
        image: formData.image,
        category: formData.category,
        isAvailable: formData.isAvailable,
        readyAt: formData.readyAt === '' ? null : Number(formData.readyAt),
        tags: formData.tags,
      });
      setProduct(res.data);
      setShowEditModal(false);
    } catch {
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!product || !confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${product._id}`);
      history.replace(`/restaurant/${restaurantId}`);
    } catch {
      alert('Failed to delete product');
    }
  };

  const toggleTag = (tag: 'suggested' | 'new') => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
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
            <IonTitle>Product</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}><IonSpinner /></div>
        </IonContent>
      </IonPage>
    );
  }

  if (!product) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton fill="clear" onClick={() => history.goBack()}>
                <IonIcon icon={arrowBackOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding"><p>Product not found.</p></IonContent>
      </IonPage>
    );
  }

  const finalPrice = product.price - (product.discount || 0);
  const isReady = remainingMinutes === null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>{product.name}</IonTitle>
          {isOwner && (
            <IonButtons slot="end">
              <IonButton fill="clear" onClick={openEditModal}>
                <IonIcon icon={createOutline} />
              </IonButton>
              <IonButton fill="clear" color="danger" onClick={handleDeleteProduct}>
                <IonIcon icon={trashOutline} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Product image */}
        <div style={{ position: 'relative', width: '100%', height: 240 }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: !isReady ? 'blur(4px) brightness(0.55)' : undefined }}
          />
          {!isReady && remainingMinutes !== null && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
              <span style={{ fontSize: '2.5rem' }}>⏱</span>
              <span style={{ fontSize: '1.2rem' }}>Ready in {formatReadyAt(remainingMinutes)}</span>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 16px 0' }}>
          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {product.tags.includes('new') && <IonBadge color="success">New</IonBadge>}
              {product.tags.includes('suggested') && <IonBadge color="warning">Suggested</IonBadge>}
            </div>
          )}

          {/* Name + price */}
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>{product.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
            {product.discount > 0 && (
              <span style={{ textDecoration: 'line-through', color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>
                {product.price.toFixed(0)} ₩
              </span>
            )}
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--ion-color-primary)' }}>
              {finalPrice.toFixed(0)} ₩
            </span>
          </div>

          {/* Description */}
          <p style={{ color: 'var(--ion-color-medium-shade)', fontSize: '0.9rem', margin: '8px 0' }}>
            {product.description}
          </p>

          {/* Ingredients */}
          {product.ingredients && (
            <p style={{ fontSize: '0.85rem', color: 'var(--ion-color-medium)', margin: '0 0 12px' }}>
              <strong>Ingredients:</strong> {product.ingredients}
            </p>
          )}

          {/* Like */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <button
              onClick={handleLike}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: liked ? 'var(--ion-color-danger)' : 'var(--ion-color-medium)', fontSize: '1rem' }}
            >
              <IonIcon icon={liked ? heart : heartOutline} style={{ fontSize: '1.3rem' }} />
              <span>{likeCount}</span>
            </button>
          </div>

          {/* Comments section */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>
            Comments ({product.commentCount ?? comments.length})
          </h3>

          {loggedIn ? (
            <form onSubmit={handleComment} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <IonInput
                value={commentText}
                onIonInput={(e) => setCommentText(String((e.target as HTMLIonInputElement).value ?? ''))}
                placeholder="Write a comment..."
                style={{ flex: 1, border: '1px solid var(--ion-color-light-shade)', borderRadius: 8, padding: '4px 10px' }}
              />
              <IonButton type="submit" disabled={submitting || !commentText.trim()} size="small">
                <IonIcon icon={sendOutline} slot="icon-only" />
              </IonButton>
            </form>
          ) : (
            <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.85rem', marginBottom: 16 }}>
              <IonButton fill="clear" size="small" onClick={() => history.replace(`/login?redirect=${encodeURIComponent(history.location.pathname)}`)}>Log in</IonButton>
              {' '}to leave a comment.
            </p>
          )}

          {comments.length === 0 ? (
            <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.85rem' }}>No comments yet. Be the first!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 32 }}>
              {comments.map((c) => {
                const author = typeof c.userId === 'object' ? c.userId : null;
                const authorId = typeof c.userId === 'object' ? (c.userId as any)._id : c.userId;
                const isOwn = myUser && authorId === myUser.id;
                return (
                  <div key={c._id} style={{ background: 'var(--ion-color-light)', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {author ? author.nickname : 'User'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ion-color-medium)' }}>
                          {timeAgo(c.createdAt)}
                        </span>
                        {isOwn && (
                          <IonButton fill="clear" size="small" color="danger" onClick={() => handleDeleteComment(c._id)} style={{ height: 22, margin: 0 }}>
                            <IonIcon icon={trashOutline} style={{ fontSize: '0.85rem' }} />
                          </IonButton>
                        )}
                      </div>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: '0.9rem' }}>{c.text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Owner edit modal */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Product</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowEditModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={handleSave}>
              <IonItem>
                <IonLabel position="stacked">Name *</IonLabel>
                <IonInput value={formData.name} onIonInput={(e) => setFormData({ ...formData, name: String((e.target as HTMLIonInputElement).value ?? '') })} required />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Description *</IonLabel>
                <IonTextarea value={formData.description} onIonInput={(e) => setFormData({ ...formData, description: String((e.target as HTMLIonTextareaElement).value ?? '') })} rows={3} required />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Ingredients</IonLabel>
                <IonInput value={formData.ingredients} onIonInput={(e) => setFormData({ ...formData, ingredients: String((e.target as HTMLIonInputElement).value ?? '') })} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Price (₩) *</IonLabel>
                <IonInput type="number" min="0" step="1" inputmode="numeric" value={formData.price}
                  onIonInput={(e) => { const v = String((e.target as HTMLIonInputElement).value ?? ''); setFormData({ ...formData, price: v === '' ? 0 : parseInt(v, 10) || 0 }); }} required />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Discount (₩)</IonLabel>
                <IonInput type="number" min="0" step="1" inputmode="numeric" value={formData.discount}
                  onIonInput={(e) => { const v = String((e.target as HTMLIonInputElement).value ?? ''); setFormData({ ...formData, discount: v === '' ? 0 : parseInt(v, 10) || 0 }); }} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Image URL *</IonLabel>
                <IonInput type="url" value={formData.image} onIonInput={(e) => setFormData({ ...formData, image: String((e.target as HTMLIonInputElement).value ?? '') })} required />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Category *</IonLabel>
                {categories.length === 0 ? (
                  <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.85rem', paddingLeft: 8 }}>No categories found</p>
                ) : (
                  <IonSelect value={formData.category} onIonChange={(e) => setFormData({ ...formData, category: String(e.detail.value ?? '') })} placeholder="Select category" interface="popover">
                    {formData.category && !categories.some((c) => c.name === formData.category) && (
                      <IonSelectOption value={formData.category}>{formData.category}</IonSelectOption>
                    )}
                    {categories.map((cat) => (
                      <IonSelectOption key={cat._id} value={cat.name}>{cat.name}</IonSelectOption>
                    ))}
                  </IonSelect>
                )}
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Ready in (minutes, blank = ready now)</IonLabel>
                <IonInput type="number" min="0" step="1" value={formData.readyAt === '' ? '' : formData.readyAt} placeholder="e.g. 30"
                  onIonInput={(e) => { const v = (e.target as HTMLIonInputElement).value; setFormData({ ...formData, readyAt: v === '' || v === null ? '' : parseInt(String(v), 10) }); }} />
              </IonItem>
              <div style={{ padding: '8px 16px' }}>
                <p style={{ margin: '8px 0 6px', fontSize: '0.85rem', color: 'var(--ion-color-medium)' }}>Tags</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <IonChip color={formData.tags.includes('new') ? 'success' : 'medium'} onClick={() => toggleTag('new')}>New</IonChip>
                  <IonChip color={formData.tags.includes('suggested') ? 'warning' : 'medium'} onClick={() => toggleTag('suggested')}>Suggested</IonChip>
                </div>
              </div>
              <IonItem>
                <IonLabel>Available</IonLabel>
                <IonCheckbox slot="end" checked={formData.isAvailable} onIonChange={(e) => setFormData({ ...formData, isAvailable: e.detail.checked ?? true })} />
              </IonItem>
              <IonButton type="submit" expand="block" className="ion-margin-top" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </IonButton>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ProductDetail;
