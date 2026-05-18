import { IonIcon, IonLabel, IonTabBar, IonTabButton } from '@ionic/react';
import { homeOutline, gridOutline, personOutline, addOutline, listOutline, restaurantOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';
import { isAdmin, isRestaurantOwner, shouldShowBottomNav } from '@/lib/bottomNavRoutes';
import { dispatchAdminOpenAddRestaurant } from '@/lib/adminDashboard';
import { dispatchOwnerOpenAddProduct } from '@/lib/ownerDashboard';

const TAB_ICON_STYLE = { fontSize: 22, marginBottom: 2 } as const;

const UserBottomNav: React.FC = () => {
  const loggedIn = isAuthenticated();

  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="main" href="/main">
        <IonIcon icon={homeOutline} style={TAB_ICON_STYLE} />
        <IonLabel>Main</IonLabel>
      </IonTabButton>
      <IonTabButton tab="category" href="/category">
        <IonIcon icon={gridOutline} style={TAB_ICON_STYLE} />
        <IonLabel>Category</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href={loggedIn ? '/my' : '/login'}>
        <IonIcon icon={personOutline} style={TAB_ICON_STYLE} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

const OwnerBottomNav: React.FC = () => {
  const history = useHistory();
  const { pathname, search } = useLocation();
  const addActive = pathname === '/dashboard/products' && new URLSearchParams(search).get('add') === '1';

  const handleAddProduct = () => {
    if (pathname === '/dashboard/products' && addActive) {
      dispatchOwnerOpenAddProduct();
      return;
    }
    history.push('/dashboard/products?add=1');
  };

  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="owner-main" href="/dashboard/products" selected={pathname === '/dashboard/products' && !addActive}>
        <IonIcon icon={homeOutline} style={TAB_ICON_STYLE} />
        <IonLabel>Main</IonLabel>
      </IonTabButton>
      <IonTabButton tab="owner-categories" href="/dashboard/categories" selected={pathname === '/dashboard/categories'}>
        <IonIcon icon={listOutline} style={TAB_ICON_STYLE} />
        <IonLabel>Categories</IonLabel>
      </IonTabButton>
      <IonTabButton tab="owner-add" selected={addActive} onClick={handleAddProduct}>
        <IonIcon icon={addOutline} style={TAB_ICON_STYLE} />
        <IonLabel>Add</IonLabel>
      </IonTabButton>
      <IonTabButton tab="owner-profile" href="/my" selected={pathname === '/my'}>
        <IonIcon icon={personOutline} style={TAB_ICON_STYLE} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

const AdminBottomNav: React.FC = () => {
  const history = useHistory();
  const { pathname, search } = useLocation();
  const addActive = pathname === '/admin/restaurants' && new URLSearchParams(search).get('add') === '1';

  const handleAddRestaurant = () => {
    if (pathname === '/admin/restaurants' && addActive) {
      dispatchAdminOpenAddRestaurant();
      return;
    }
    history.push('/admin/restaurants?add=1');
  };

  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="admin-main" href="/admin/restaurants" selected={pathname === '/admin/restaurants' && !addActive}>
        <IonIcon icon={restaurantOutline} style={TAB_ICON_STYLE} />
        <IonLabel>Main</IonLabel>
      </IonTabButton>
      <IonTabButton tab="admin-add" selected={addActive} onClick={handleAddRestaurant}>
        <IonIcon icon={addOutline} style={TAB_ICON_STYLE} />
        <IonLabel>Add</IonLabel>
      </IonTabButton>
      <IonTabButton tab="admin-profile" href="/admin/profile" selected={pathname === '/admin/profile'}>
        <IonIcon icon={personOutline} style={TAB_ICON_STYLE} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};

const BottomNav: React.FC = () => {
  const { pathname } = useLocation();

  if (!shouldShowBottomNav(pathname)) {
    return null;
  }

  if (isAdmin()) return <AdminBottomNav />;
  if (isRestaurantOwner()) return <OwnerBottomNav />;
  return <UserBottomNav />;
};

export default BottomNav;
