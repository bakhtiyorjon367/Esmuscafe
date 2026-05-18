import { useRef } from 'react';
import { IonButton, IonIcon, IonLabel } from '@ionic/react';
import { closeOutline, imageOutline } from 'ionicons/icons';
import { MAX_PRODUCT_IMAGES, productThumbSrcForDisplay } from '@/lib/product-images';

export interface PendingImageItem {
  file: File;
  previewUrl: string;
}

interface ProductImagePickerProps {
  storedPaths: string[];
  pendingItems: PendingImageItem[];
  onPickFiles: (files: File[]) => void;
  onRemoveStored: (path: string) => void;
  onRemovePending: (previewUrl: string) => void;
}

const ProductImagePicker: React.FC<ProductImagePickerProps> = ({
  storedPaths,
  pendingItems,
  onPickFiles,
  onRemoveStored,
  onRemovePending,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const totalCount = storedPaths.length + pendingItems.length;
  const canAddMore = totalCount < MAX_PRODUCT_IMAGES;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    const slotsLeft = MAX_PRODUCT_IMAGES - totalCount;
    onPickFiles(picked.slice(0, slotsLeft));
    e.target.value = '';
  };

  return (
    <div style={{ padding: '8px 16px' }}>
      <IonLabel style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem' }}>
        Product photos * ({totalCount}/{MAX_PRODUCT_IMAGES})
      </IonLabel>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        {storedPaths.map((path) => (
          <ThumbChip
            key={path}
            src={productThumbSrcForDisplay(path)}
            onRemove={() => onRemoveStored(path)}
          />
        ))}
        {pendingItems.map((item) => (
          <ThumbChip
            key={item.previewUrl}
            src={item.previewUrl}
            onRemove={() => onRemovePending(item.previewUrl)}
          />
        ))}
      </div>
      {canAddMore && (
        <IonButton type="button" fill="outline" size="small" onClick={() => inputRef.current?.click()}>
          <IonIcon icon={imageOutline} slot="start" />
          {totalCount === 0 ? 'Choose photos' : 'Add photos'}
        </IonButton>
      )}
    </div>
  );
};

function ThumbChip({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <img src={src} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        style={{
          position: 'absolute',
          top: -6,
          right: -6,
          width: 22,
          height: 22,
          borderRadius: '50%',
          border: 'none',
          background: 'var(--ion-color-danger)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        <IonIcon icon={closeOutline} style={{ fontSize: 14 }} />
      </button>
    </div>
  );
}

export default ProductImagePicker;
