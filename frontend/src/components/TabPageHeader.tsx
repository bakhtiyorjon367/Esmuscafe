import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import { cartOutline, heartOutline, chevronBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { getTokenRole } from '@/lib/auth';
import { clearCategoryRestaurantId } from '@/lib/categoryRestaurant';
import { useCart } from '@/context/useCart';

type TabPageHeaderProps = {
  title: string;
  /** Show back control to return to the restaurant picker (clears selection). */
  showRestaurantPickerBack?: boolean;
};

const TabPageHeader: React.FC<TabPageHeaderProps> = ({ title, showRestaurantPickerBack }) => {
  const history = useHistory();
  const isUser = getTokenRole() === 'user';
  const { totalItems } = useCart();

  const goToRestaurantPicker = (): void => {
    clearCategoryRestaurantId();
    history.replace('/');
  };

  return (
    <IonHeader>
      <IonToolbar>
        {showRestaurantPickerBack && (
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={goToRestaurantPicker}>
              <IonIcon icon={chevronBack} />
            </IonButton>
          </IonButtons>
        )}
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
