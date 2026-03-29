import React from 'react';
import { useHistory } from 'react-router-dom';
import { IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { copyOutline } from 'ionicons/icons';
import { copyToClipboard } from '@/lib/clipboard';
import type { Restaurant, WorkingHours } from '@/types';

function isWithinWorkingHours(workingHours: WorkingHours | undefined): boolean {
  if (!workingHours || typeof workingHours.open !== 'string' || typeof workingHours.close !== 'string') return true;
  const now = new Date();
  const [openH, openM] = workingHours.open.split(':').map(Number);
  const [closeH, closeM] = workingHours.close.split(':').map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

function getHoursLabel(workingHours: WorkingHours | undefined): string {
  if (!workingHours || typeof workingHours.open !== 'string' || typeof workingHours.close !== 'string') return '';
  return `${workingHours.open} – ${workingHours.close}`;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const history = useHistory();
  const address = restaurant.address ?? '';
  const withinHours = isWithinWorkingHours(restaurant.workingHours);
  const isOutsideHours = restaurant.isOpened && !withinHours;
  const hoursLabel = getHoursLabel(restaurant.workingHours);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (address) copyToClipboard(address);
  };

  return (
    <IonCard button onClick={() => history.push(`/restaurant/${restaurant._id}`)}>
      <IonCardContent className="ion-no-padding">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={restaurant.image}
              alt={restaurant.name}
              style={{
                width: 62,
                height: 62,
                objectFit: 'cover',
                borderRadius: 10,
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '1.1rem' }}>
              {restaurant.name}
            </strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: '1rem', color: 'var(--ion-color-medium)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {address || '—'}
              </span>
              {address && (
                <button type="button" onClick={handleCopy} aria-label="Copy address" style={{ flexShrink: 0, padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
                  <IonIcon icon={copyOutline} />
                </button>
              )}
            </div>
            {hoursLabel && (
              <span style={{ fontSize: '0.75rem', color: isOutsideHours ? 'var(--ion-color-warning)' : 'var(--ion-color-success)', marginTop: 2, display: 'block' }}>
                {hoursLabel}
              </span>
            )}
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default RestaurantCard;
