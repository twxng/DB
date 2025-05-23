import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
} from '@mui/material';
import productService from '../../api/productService';
import promotionService from '../../api/promotionService';
import type { PromotionProduct } from '../../api/promotionService';
import type { Category } from '../../types';
import styles from './styles/CategorySection.module.css';
import { ArrowForward } from '@mui/icons-material';

// Розширений інтерфейс категорії з URL зображення
interface ExtendedCategory extends Category {
  imageUrl: string;
}

const GARDENA_SUPPLIER_ID = 1; // ID постачальника Gardena в базі даних
const PROMOTION_ID = 1; // ID акції для отримання товарів

// Функція для перевірки чи рядок є base64 зображенням
const isBase64Image = (str: string | null): boolean => {
  if (!str) return false;
  try {
    // Перевірка на всі варіанти base64 формату
    return str.startsWith('data:image/') || str.startsWith('/9j/') || str.startsWith('iVBOR');
  } catch {
    return false;
  }
};

// Функція для отримання URL зображення
const getImageUrl = (imageData: string | null): string => {
  if (!imageData) return 'https://via.placeholder.com/300';
  
  if (isBase64Image(imageData)) {
    // Якщо це вже готовий data URL
    if (imageData.startsWith('data:image/')) {
      return imageData;
    }
    
    // Якщо це Base64 JPEG без префіксу
    if (imageData.startsWith('/9j/')) {
      // Вирізаємо спеціальні символи, якщо вони є
      const cleanBase64 = imageData.replace(/[\r\n\t]/g, '');
      return `data:image/jpeg;base64,${cleanBase64}`;
    }
    
    // Якщо це Base64 PNG без префіксу
    if (imageData.startsWith('iVBOR')) {
      const cleanBase64 = imageData.replace(/[\r\n\t]/g, '');
      return `data:image/png;base64,${cleanBase64}`;
    }
    
    // Спроба відобразити як зображення, навіть якщо формат невідомий
    const cleanBase64 = imageData.replace(/[\r\n\t]/g, '');
    return `data:image/jpeg;base64,${cleanBase64}`;
  }
  
  return 'https://via.placeholder.com/300';
};

const CategorySection = () => {
  const [categories, setCategories] = useState<ExtendedCategory[]>([]);
  const [promotionProducts, setPromotionProducts] = useState<PromotionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Дані бренду
  const brandData = {
    name: "GARDENA",
    tagline: "Знайдіть ідеальні інструменти для вашого саду",
    description: "Широкий вибір якісних садових інструментів за найкращими цінами",
    imageUrl: "https://img.freepik.com/free-photo/photorealistic-wedding-venue-with-intricate-decor-ornaments_23-2151481538.jpg?ga=GA1.1.1045266873.1700907710&semt=ais_hybrid&w=740",
  };

  // Масив зображень для категорій з unsplash
  const categoryImages = [
    "https://www.adler1919.eu/cdn/shop/files/Startseite_Garten_Kategorie_banner_900x.jpg?v=1647865181",
    "https://img.freepik.com/free-photo/young-farmer-working-his-garden-getting-ready-summer-season-man-tenderly-planting-green-sprout-with-garden-tools-his-countryside-house_176420-19893.jpg?ga=GA1.1.1045266873.1700907710&semt=ais_hybrid&w=740",
    "https://img.freepik.com/free-photo/front-view-plant-growing-from-pellets_23-2148895418.jpg?ga=GA1.1.1045266873.1700907710&semt=ais_hybrid&w=740",
    "https://img.freepik.com/premium-photo/hand-holding-coffee-cup-table_1048944-16780601.jpg?ga=GA1.1.1045266873.1700907710&semt=ais_hybrid&w=740",
    "https://img.freepik.com/free-photo/gardener-repotting-houseplant_53876-125350.jpg?ga=GA1.1.1045266873.1700907710&semt=ais_hybrid&w=740",
    "https://img.freepik.com/premium-photo/watering-crops-western-germany-with-irrigation-system-using-sprinklers-cultivated-field_1048944-21039431.jpg?ga=GA1.1.1045266873.1700907710&semt=ais_hybrid&w=740",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Завантажуємо категорії
        const categoriesData = await productService.getCategories();
        // Фільтруємо тільки активні категорії верхнього рівня
        const mainCategories = categoriesData.filter(
          (category) => category.isActive && !category.parentCategoryId
        );

        // Додаємо URL зображення до кожної категорії
        const categoriesWithImages = mainCategories.map((category, index) => ({
          ...category,
          imageUrl: categoryImages[index % categoryImages.length]
        }));

        setCategories(categoriesWithImages);
        
        // Завантажуємо акційні товари безпосередньо з акції за її ID, замість постачальника
        try {
          const promotionProductsData = await promotionService.getPromotionProducts(PROMOTION_ID);
          
          // Діагностичний вивід для перевірки отриманих даних
          if (promotionProductsData && promotionProductsData.length > 0) {
            console.log('Діагностика зображень:');
            promotionProductsData.forEach((product, idx) => {
              console.log(`Товар ${idx + 1} - ${product.productName}:`);
              console.log(`- imageURL: ${product.imageURL?.substring(0, 30)}...`);
              console.log(`- imageURL є base64: ${isBase64Image(product.imageURL)}`);
              console.log(`- Фінальний URL: ${getImageUrl(product.imageURL).substring(0, 40)}...`);
            });
          }
          
          setPromotionProducts(promotionProductsData);
        } catch (promoErr) {
          console.error('Помилка при отриманні товарів з акції:', promoErr);
          
          // Запасний варіант: спробуємо отримати товари від постачальника
          const promotionProductsBySupplier = await promotionService.getPromotionProductsBySupplier(GARDENA_SUPPLIER_ID, 3);
          
          // Діагностичний вивід для перевірки отриманих даних від постачальника
          if (promotionProductsBySupplier && promotionProductsBySupplier.length > 0) {
            console.log('Діагностика зображень від постачальника:');
            promotionProductsBySupplier.forEach((product, idx) => {
              console.log(`Товар ${idx + 1} - ${product.productName}:`);
              console.log(`- imageURL: ${product.imageURL?.substring(0, 30)}...`);
              console.log(`- imageURL є base64: ${isBase64Image(product.imageURL)}`);
              console.log(`- Фінальний URL: ${getImageUrl(product.imageURL).substring(0, 40)}...`);
            });
          }
          
          setPromotionProducts(promotionProductsBySupplier);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Помилка завантаження даних:', err);
        setError('Не вдалося завантажити дані. Спробуйте пізніше.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box className={styles.loaderContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.sectionContainer}>
      <Container maxWidth="lg">
        <div className={styles.contentWrapper}>
          {/* Контейнер бренду партнеру (реклама) з акційними товарами (зліва) */}
          <div className={styles.brandContainer}>
            {/* Банер бренду */}
            <div className={styles.brandBanner}>
              <img src={brandData.imageUrl} alt={brandData.name} />
              <div className={styles.bannerContent}>
                <Typography variant="h2" className={styles.bannerTitle}>
                  {brandData.tagline}
                </Typography>
                <Typography variant="body1" className={styles.bannerSubtitle}>
                  {brandData.description}
                </Typography>
              </div>
            </div>
            
            <Typography variant="h5" className={styles.sectionTitle}>
              Акції від {brandData.name}
            </Typography>
            
            {/* Сітка акційних товарів */}
            <div className={styles.brandProductsGrid}>
              {promotionProducts.length > 0 ? (
                promotionProducts.map((product) => (
                  <RouterLink 
                    key={product.productID} 
                    to={`/products/${product.productID}`}
                    className={styles.brandProductCard}
                  >
                    <div className={`${styles.productImageContainer} ${styles.debug1}`}>
                      <img 
                        src={getImageUrl(product.imageURL)} 
                        alt={product.productName} 
                        className={styles.productImage} 
                        onError={(e) => {
                          console.error(`Помилка завантаження зображення для ${product.productName}`);
                          e.currentTarget.src = 'https://via.placeholder.com/300';
                        }}
                      />
                      <span className={styles.discountBadge}>-{product.discountPercentage}%</span>
                    </div>
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>{product.productName}</div>
                      <div className={styles.productPrice}>
                        <span>грн.{product.discountedPrice.toFixed(2)}</span>
                        <span className={styles.originalPrice}>грн.{product.originalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </RouterLink>
                ))
              ) : (
                // Фоллбек на випадок відсутності акційних товарів
                <div className={styles.noPromotions}>
                  <Typography variant="body1">Наразі немає активних акцій</Typography>
                </div>
              )}
            </div>
          </div>

          {/* Контейнер категорій (справа) */}
          <div className={styles.categoriesContainer}>
            
            <div className={styles.categoriesGrid}>
              {categories.map((category) => (
                <RouterLink 
                  key={category.categoryId} 
                  to={`/categories/${category.categoryId}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div className={styles.categoryCard}>
                    <img 
                      src={category.imageUrl} 
                      alt={category.name} 
                      className={styles.categoryImage} 
                    />
                    <div className={styles.categoryInfo}>
                      <Typography className={styles.categoryName}>
                        {category.name}
                      </Typography>
                    </div>
                  </div>
                </RouterLink>
              ))}
            </div>
            
            {/* Кнопка "Переглянути всі категорії" */}
            <RouterLink
              to="/categories"
              className={styles.viewAllButton}
            >
              Усі категорії <ArrowForward fontSize="small" />
            </RouterLink>
          </div>
        </div>
      </Container>
    </Box>
  );
};

export default CategorySection; 