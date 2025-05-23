import React, { useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import { ImageNotSupported as ImageNotSupportedIcon } from '@mui/icons-material';

interface ProductImageProps {
  imageBase64?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Компонент для відображення зображення товару
 * Автоматично додає префікс data:image/jpeg;base64, якщо його немає
 */
const ProductImage: React.FC<ProductImageProps> = ({ imageBase64, alt, className, style }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!imageBase64) {
    return (
      <Box
        className={className}
        sx={{
          backgroundColor: 'rgba(23, 33, 25, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          ...style
        }}
      >
        <ImageNotSupportedIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '2rem' }} />
      </Box>
    );
  }

  // Перевіряємо чи містить рядок префікс data:image
  const imageSrc = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  return (
    <Box position="relative" className={className} sx={{ overflow: 'hidden', ...style }}>
      {isLoading && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            zIndex: 1
          }}
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoading || hasError ? 0 : 1,
          transition: 'opacity 0.3s ease',
          ...style
        }}
      />
      {hasError && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(23, 33, 25, 0.7)',
            borderRadius: '8px'
          }}
        >
          <ImageNotSupportedIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '2rem' }} />
        </Box>
      )}
    </Box>
  );
};

export default ProductImage; 