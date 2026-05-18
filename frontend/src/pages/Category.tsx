import { useEffect, useMemo, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';
import TabPageHeader from '@/components/TabPageHeader';
import FloatingBackButton from '@/components/FloatingBackButton';
import ProductGrid from '@/components/ProductGrid';
import api from '@/lib/api';
import { getCategoryRestaurantId } from '@/lib/categoryRestaurant';
import type { Product, Restaurant } from '@/types';

const CATEGORY_ALL = 'All';

const Category: React.FC = () => {
  const restaurantId = getCategoryRestaurantId();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_ALL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    setLoading(true);
    Promise.all([
      api.get<Restaurant>(`/restaurants/${restaurantId}`),
      api.get<Product[]>(`/products?restaurantId=${restaurantId}`),
    ])
      .then(([restaurantRes, productsRes]) => {
        setRestaurant(restaurantRes.data);
        setProducts(productsRes.data);
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false));
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

  if (!restaurantId) {
    return <Redirect to="/" />;
  }

  return (
    <IonPage>
      <TabPageHeader title={restaurant?.name ?? 'Category'} />
      <IonContent scrollY={false} className="category-ion-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <IonSpinner />
          </div>
        ) : error ? (
          <div className="ion-padding ion-text-center">
            <IonText color="danger"><p>{error}</p></IonText>
          </div>
        ) : (
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
              <ProductGrid
                products={filteredProducts}
                restaurantId={restaurantId}
                isLoading={false}
              />
            </div>
          </div>
        )}
        <FloatingBackButton restaurantPicker />
      </IonContent>
    </IonPage>
  );
};

export default Category;
