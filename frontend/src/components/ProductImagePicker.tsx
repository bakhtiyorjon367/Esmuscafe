import { useEffect, useRef } from 'react';
import { IonButton, IonIcon, IonLabel } from '@ionic/react';
import { closeOutline, imageOutline } from 'ionicons/icons';
import { productThumbSrcForDisplay } from '@/lib/product-images';

interface ProductImagePickerProps {
  storedImagePath: string;
  previewUrl: string | null;
  onPick: (file: File) => void;
  onClear: () => void;
}

const ProductImagePicker: React.FC<ProductImagePickerProps> = ({
  storedImagePath,
  previewUrl,
  onPick,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const displaySrc = previewUrl ?? (storedImagePath ? productThumbSrcForDisplay(storedImagePath) : '');

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
    e.target.value = '';
  };

  return (
    <div style={{ padding: '8px 16px' }}>
      <IonLabel style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem' }}>Product photo *</IonLabel>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {displaySrc ? (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={displaySrc}
              alt=""
              style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }}
            />
            <button
              type="button"
              onClick={onClear}
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
        ) : null}
        <IonButton
          type="button"
          fill="outline"
          size="small"
          onClick={() => inputRef.current?.click()}
        >
          <IonIcon icon={imageOutline} slot="start" />
          {displaySrc ? 'Change photo' : 'Choose photo'}
        </IonButton>
      </div>
    </div>
  );
};

export default ProductImagePicker;
