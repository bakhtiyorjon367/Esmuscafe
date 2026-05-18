import { IonIcon, IonLabel, IonTabBar, IonTabButton } from '@ionic/react';
import { homeOutline, gridOutline, personOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';
import { shouldShowBottomNav } from '@/lib/bottomNavRoutes';

const TAB_ICON_STYLE = { fontSize: 22, marginBottom: 2 } as const;

const BottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const loggedIn = isAuthenticated();

  if (!shouldShowBottomNav(pathname)) {
    return null;
  }

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

export default BottomNav;
