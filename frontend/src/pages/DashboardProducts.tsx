import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  IonAlert,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonModal,
  IonInput,
  IonTextarea,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonSelect,
  IonSelectOption,
  IonChip,
  IonSpinner,
} from '@ionic/react';
import { arrowBackOutline, trashOutline, addOutline, storefrontOutline, closeOutline, personOutline } from 'ionicons/icons';
import ProductListItem from '@/components/ProductListItem';
import api from '@/lib/api';
import { getProfile, removeToken } from '@/lib/auth';
import type { Product, User } from '@/types';

interface CategoryItem {
  _id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  ingredients: string;
  price: number;
  discount: number;
  image: string;
  category: string;
  isAvailable: boolean;
  readyAt: number | '';
  tags: ('suggested' | 'new')[];
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  description: '',
  ingredients: '',
  price: 0,
  discount: 0,
  image: '',
  category: '',
  isAvailable: true,
  readyAt: '',
  tags: [],
};

const DashboardProducts: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(EMPTY_FORM);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userProfile = await getProfile();
      setUser(userProfile);
      if (userProfile.restaurantId) {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get(`/products?restaurantId=${userProfile.restaurantId}`),
          api.get(`/categories?restaurantId=${userProfile.restaurantId}`),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data ?? []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !user?.restaurantId) return;
    setCatLoading(true);
    try {
      await api.post('/categories', { name: newCategoryName.trim(), restaurantId: user.restaurantId });
      setNewCategoryName('');
      const res = await api.get(`/categories?restaurantId=${user.restaurantId}`);
      setCategories(res.data ?? []);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Failed to add category');
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch {
      alert('Failed to delete category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restaurantId) { alert('No restaurant assigned'); return; }
    const price = Number(formData.price);
    const discount = Number(formData.discount);
    if (isNaN(price) || price < 0) { alert('Please enter a valid price'); return; }
    if (isNaN(discount) || discount < 0) { alert('Please enter a valid discount'); return; }
    try {
      const basePayload = {
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
      };
      if (editingProduct) {
        await api.patch(`/products/${editingProduct._id}`, basePayload);
      } else {
        await api.post('/products', { ...basePayload, restaurantId: user.restaurantId });
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData(EMPTY_FORM);
      fetchData();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
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
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
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

  if (!user?.restaurantId) {
    return (
      <IonPage>
        <IonHeader><IonToolbar><IonTitle>My Products</IonTitle></IonToolbar></IonHeader>
        <IonContent className="ion-padding">
          <p style={{ color: 'var(--ion-color-danger)' }}>No restaurant assigned to your account</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => setShowLogoutConfirm(true)}>
              <IonIcon icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Dashboard</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => history.push('/my')}>
              <IonIcon icon={personOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonAlert
        isOpen={showLogoutConfirm}
        onDidDismiss={() => setShowLogoutConfirm(false)}
        header="Log out"
        message="Are you sure you want to log out?"
        buttons={[
          { text: 'Cancel', role: 'cancel' },
          { text: 'Logout', handler: () => { removeToken(); history.replace('/'); } },
        ]}
      />

      <IonContent>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <IonSpinner />
          </div>
        ) : (
          <>
            {/* ── Category filter bar ── */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 16px 8px', scrollbarWidth: 'none' }}>
              {/* + button to manage categories */}
              <button
                onClick={() => setShowCategoryModal(true)}
                style={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: '2px dashed var(--ion-color-primary)',
                  background: 'transparent',
                  color: 'var(--ion-color-primary)',
                  fontSize: '1.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                +
              </button>

              {/* All filter */}
              <button
                onClick={() => setSelectedCategory('All')}
                style={{
                  flexShrink: 0,
                  padding: '6px 16px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: selectedCategory === 'All' ? 700 : 400,
                  background: selectedCategory === 'All' ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
                  color: selectedCategory === 'All' ? '#fff' : 'var(--ion-color-dark)',
                  fontSize: '0.9rem',
                }}
              >
                All ({products.length})
              </button>

              {/* One button per category */}
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 16px',
                    borderRadius: 20,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: selectedCategory === cat.name ? 700 : 400,
                    background: selectedCategory === cat.name ? 'var(--ion-color-primary)' : 'var(--ion-color-light)',
                    color: selectedCategory === cat.name ? '#fff' : 'var(--ion-color-dark)',
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* ── Products section ── */}
            <div className="ion-padding" style={{ paddingTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                  {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                </h3>
                <IonButton size="small" onClick={() => { setEditingProduct(null); setFormData(EMPTY_FORM); setShowModal(true); }}>
                  <IonIcon icon={addOutline} slot="start" /> Add Product
                </IonButton>
              </div>

              {(() => {
                const filtered = selectedCategory === 'All'
                  ? products
                  : products.filter((p) => p.category === selectedCategory);
                return filtered.length === 0 ? (
                  <p className="ion-text-center" style={{ color: 'var(--ion-color-medium)' }}>No products yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {filtered.map((product) => (
                      <ProductListItem
                        key={product._id}
                        product={product}
                        restaurantId={user.restaurantId!}
                        ownerActions={{ onEdit: handleEdit, onDelete: handleDelete }}
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
          </>
        )}

        {/* ── Category management modal ── */}
        <IonModal isOpen={showCategoryModal} onDidDismiss={() => setShowCategoryModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Categories</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowCategoryModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
              <IonInput
                value={newCategoryName}
                onIonInput={(e) => setNewCategoryName(String((e.target as HTMLIonInputElement).value ?? ''))}
                placeholder="New category name"
                style={{ flex: 1, border: '1px solid var(--ion-color-light-shade)', borderRadius: 8, padding: '4px 10px' }}
              />
              <IonButton size="small" onClick={handleAddCategory} disabled={catLoading || !newCategoryName.trim()}>
                <IonIcon icon={addOutline} slot="icon-only" />
              </IonButton>
            </div>

            {categories.length === 0 ? (
              <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.85rem' }}>No categories yet. Add one above.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--ion-color-light)',
                      borderRadius: 12,
                      padding: '10px 14px',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{cat.name}</span>
                    <IonButton fill="clear" size="small" color="danger" onClick={() => handleDeleteCategory(cat._id)}>
                      <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonButton>
                  </div>
                ))}
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* ── Product form modal ── */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form onSubmit={handleSubmit}>
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
                <IonInput
                  type="number"
                  min="0"
                  step="1"
                  inputmode="numeric"
                  placeholder="e.g. 12000"
                  value={formData.price}
                  onIonInput={(e) => {
                    const raw = String((e.target as HTMLIonInputElement).value ?? '');
                    const parsed = raw === '' ? 0 : parseInt(raw, 10);
                    setFormData({ ...formData, price: isNaN(parsed) ? 0 : parsed });
                  }}
                  required
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Discount (₩)</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="1"
                  inputmode="numeric"
                  placeholder="e.g. 1000"
                  value={formData.discount}
                  onIonInput={(e) => {
                    const raw = String((e.target as HTMLIonInputElement).value ?? '');
                    const parsed = raw === '' ? 0 : parseInt(raw, 10);
                    setFormData({ ...formData, discount: isNaN(parsed) ? 0 : parsed });
                  }}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Image URL *</IonLabel>
                <IonInput type="url" value={formData.image} onIonInput={(e) => setFormData({ ...formData, image: String((e.target as HTMLIonInputElement).value ?? '') })} required />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Category *</IonLabel>
                {categories.length === 0 ? (
                  <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.85rem', paddingLeft: 8 }}>Add categories first</p>
                ) : (
                  <IonSelect
                    value={formData.category}
                    onIonChange={(e) => setFormData({ ...formData, category: String(e.detail.value ?? '') })}
                    placeholder="Select category"
                    interface="popover"
                  >
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
                <IonLabel position="stacked">Ready in (minutes, leave blank if ready now)</IonLabel>
                <IonInput
                  type="number"
                  min="0"
                  step="1"
                  value={formData.readyAt === '' ? '' : formData.readyAt}
                  placeholder="e.g. 30"
                  onIonInput={(e) => {
                    const v = (e.target as HTMLIonInputElement).value;
                    setFormData({ ...formData, readyAt: v === '' || v === null ? '' : parseInt(String(v), 10) });
                  }}
                />
              </IonItem>
              <div style={{ padding: '8px 16px' }}>
                <p style={{ margin: '8px 0 6px', fontSize: '0.85rem', color: 'var(--ion-color-medium)' }}>Tags</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <IonChip
                    color={formData.tags.includes('new') ? 'success' : 'medium'}
                    onClick={() => toggleTag('new')}
                  >
                    New
                  </IonChip>
                  <IonChip
                    color={formData.tags.includes('suggested') ? 'warning' : 'medium'}
                    onClick={() => toggleTag('suggested')}
                  >
                    Suggested
                  </IonChip>
                </div>
              </div>
              <IonItem>
                <IonLabel>Available</IonLabel>
                <IonCheckbox slot="end" checked={formData.isAvailable} onIonChange={(e) => setFormData({ ...formData, isAvailable: e.detail.checked ?? true })} />
              </IonItem>
              <IonButton type="submit" expand="block" className="ion-margin-top">Save</IonButton>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default DashboardProducts;
