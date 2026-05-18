import { useIonRouter } from '@ionic/react';
import { IonIcon } from '@ionic/react';
import { chevronBack } from 'ionicons/icons';

type FloatingBackButtonProps = {
  defaultHref?: string;
  /** When false, sits lower (no tab bar). Default true. */
  aboveTabBar?: boolean;
};

const FloatingBackButton: React.FC<FloatingBackButtonProps> = ({
  defaultHref = '/',
  aboveTabBar = true,
}) => {
  const router = useIonRouter();

  const handleClick = (): void => {
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
      aria-label="Go back"
    >
      <IonIcon icon={chevronBack} style={{ fontSize: 28 }} />
    </button>
  );
};

export default FloatingBackButton;
