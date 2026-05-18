import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminProfile from './pages/AdminProfile';
import DashboardProducts from './pages/DashboardProducts';
import DashboardCategories from './pages/DashboardCategories';
import Cart from './pages/Cart';
import MyProfile from './pages/MyProfile';
import Collection from './pages/Collection';
import Category from './pages/Category';
import RestaurantMain from './pages/RestaurantMain';
import AuthGuard from './components/AuthGuard';
import BottomNav from './components/BottomNav';
import { CartProvider } from './context/CartContext';
import { setCategoryRestaurantId } from './lib/categoryRestaurant';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './theme/global.css';
import './theme/koruz-ui.css';

setupIonicReact();

const AppTabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/" component={Home} />
      <Route exact path="/main" component={RestaurantMain} />
      <Route exact path="/category" component={Category} />
      <Route
        exact
        path="/restaurant/:id"
        render={({ match }) => {
          setCategoryRestaurantId(match.params.id);
          return <Redirect to="/main" />;
        }}
      />
      <Route exact path="/restaurant/:restaurantId/product/:productId" component={ProductDetail} />
      <Route exact path="/login" component={Login} />
      <Route
        exact
        path="/cart"
        render={() => (
          <AuthGuard requireAuth>
            <Cart />
          </AuthGuard>
        )}
      />
      <Route
        exact
        path="/my"
        render={() => (
          <AuthGuard requireAuth>
            <MyProfile />
          </AuthGuard>
        )}
      />
      <Route
        exact
        path="/collection"
        render={() => (
          <AuthGuard requireAuth>
            <Collection />
          </AuthGuard>
        )}
      />
      <Route
        exact
        path="/admin/restaurants"
        render={() => (
          <AuthGuard requireAuth>
            <AdminRestaurants />
          </AuthGuard>
        )}
      />
      <Route
        exact
        path="/admin/profile"
        render={() => (
          <AuthGuard requireAuth>
            <AdminProfile />
          </AuthGuard>
        )}
      />
      <Route
        exact
        path="/dashboard/products"
        render={() => (
          <AuthGuard requireAuth>
            <DashboardProducts />
          </AuthGuard>
        )}
      />
      <Route
        exact
        path="/dashboard/categories"
        render={() => (
          <AuthGuard requireAuth>
            <DashboardCategories />
          </AuthGuard>
        )}
      />
      <Redirect exact from="/dashboard" to="/dashboard/products" />
    </IonRouterOutlet>
    <BottomNav />
  </IonTabs>
);

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <CartProvider>
        <AppTabs />
      </CartProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;
