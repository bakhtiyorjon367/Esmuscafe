import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import { cartOutline, heartOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getTokenRole } from '@/lib/auth';
import { useCart } from '@/context/useCart';

type TabPageHeaderProps = {
  title: string;
};

const TabPageHeader: React.FC<TabPageHeaderProps> = ({ title }) => {
  const history = useHistory();
  const isUser = getTokenRole() === 'user';
  const { totalItems } = useCart();

  return (
    <IonHeader>
      <IonToolbar>
        <IonTitle>{title}</IonTitle>
        {isUser && (
          <IonButtons slot="end">
            <IonButton onClick={() => history.push('/collection')}>
              <IonIcon icon={heartOutline} />
            </IonButton>
            <IonButton data-cart-icon onClick={() => history.push('/cart')} style={{ position: 'relative' }}>
              <IonIcon icon={cartOutline} />
              {totalItems > 0 && (
                <IonBadge
                  color="danger"
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    fontSize: '0.6rem',
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                  }}
                >
                  {totalItems}
                </IonBadge>
              )}
            </IonButton>
          </IonButtons>
        )}
      </IonToolbar>
    </IonHeader>
  );
};

export default TabPageHeader;
