import { useIonRouter } from '@ionic/react';
import { IonIcon } from '@ionic/react';
import { chevronBack } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { clearCategoryRestaurantId } from '@/lib/categoryRestaurant';

type FloatingBackButtonProps = {
  defaultHref?: string;
  /** When false, sits lower (no tab bar). Default true. */
  aboveTabBar?: boolean;
  /** Clears selected restaurant and returns to the home restaurant list. */
  restaurantPicker?: boolean;
  /** Custom back action (e.g. close a modal). */
  onBack?: () => void;
};

const FloatingBackButton: React.FC<FloatingBackButtonProps> = ({
  defaultHref = '/',
  aboveTabBar = true,
  restaurantPicker = false,
  onBack,
}) => {
  const router = useIonRouter();
  const history = useHistory();

  const handleClick = (): void => {
    if (onBack) {
      onBack();
      return;
    }
    if (restaurantPicker) {
      clearCategoryRestaurantId();
      history.replace('/');
      return;
    }
    if (router.canGoBack()) {
      router.goBack();
      return;
    }
    if (defaultHref) {
      router.push(defaultHref, 'back');
    }
  };

  return (
    <button
      type="button"
      className={`floating-back-btn${aboveTabBar ? ' floating-back-btn--above-tabs' : ''}`}
      onClick={handleClick}
      aria-label={restaurantPicker ? 'Back to restaurants' : 'Go back'}
    >
      <IonIcon icon={chevronBack} style={{ fontSize: 28 }} />
    </button>
  );
};

export default FloatingBackButton;
