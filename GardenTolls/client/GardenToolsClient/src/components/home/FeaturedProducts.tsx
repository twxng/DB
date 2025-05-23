import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Button,
  Container,
  Rating,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LocalOffer as LocalOfferIcon,
  Favorite as FavoriteIcon,
  ShoppingCart as ShoppingCartIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import productService from '../../api/productService';
import cartService from '../../api/cartService';
import type { Product } from '../../types';
import ProductImage from '../../components/ProductImage';

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featured, newArrival, bestSeller] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getNewArrivals(),
          productService.getBestSellers(),
        ]);
        
        setFeaturedProducts(featured);
        setNewArrivals(newArrival);
        setBestSellers(bestSeller);
        setLoading(false);
      } catch (err) {
        console.error('Помилка завантаження товарів:', err);
        setError('Не вдалося завантажити товари. Спробуйте пізніше.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Тимчасові дані для демо-режиму, якщо API недоступне
  const demoProducts: Product[] = [
    {
      productId: 1,
      name: 'Секатор професійний',
      description: 'Професійний секатор для обрізки гілок та пагонів',
      sku: 'SEC-1001',
      unitPrice: 899.99,
      discountPercentage: 10,
      weight: 0.3,
      dimensions: '22x8x3 см',
      imageUrl: 'https://images.unsplash.com/photo-1572717314882-31151c8c65af',
      categoryId: 1,
      categoryName: 'Садові інструменти',
      supplierId: 1,
      supplierName: 'GardenPro',
      isActive: true,
      createdDate: '2023-04-15',
      modifiedDate: '2023-04-15',
      inventoryCount: 50,
      reviewsCount: 24,
      averageRating: 4.7,
    },
    {
      productId: 2,
      name: 'Лопата штикова універсальна',
      description: 'Універсальна штикова лопата з ергономічною ручкою',
      sku: 'LOP-2002',
      unitPrice: 599.99,
      discountPercentage: 0,
      weight: 1.5,
      dimensions: '120x22x10 см',
      imageUrl: 'https://images.unsplash.com/photo-1600698479097-1845acebdcee',
      categoryId: 1,
      categoryName: 'Садові інструменти',
      supplierId: 2,
      supplierName: 'GardenMax',
      isActive: true,
      createdDate: '2023-04-10',
      modifiedDate: '2023-04-10',
      inventoryCount: 35,
      reviewsCount: 18,
      averageRating: 4.5,
    },
    {
      productId: 3,
      name: 'Система поливу автоматична',
      description: 'Автоматична система поливу з програмованим таймером',
      sku: 'POL-3003',
      unitPrice: 1499.99,
      discountPercentage: 15,
      weight: 2.0,
      dimensions: '30x20x15 см',
      imageUrl: 'https://images.unsplash.com/photo-1616691577642-8ce8c015240f',
      categoryId: 2,
      categoryName: 'Системи поливу',
      supplierId: 3,
      supplierName: 'WaterSystems',
      isActive: true,
      createdDate: '2023-04-05',
      modifiedDate: '2023-04-05',
      inventoryCount: 20,
      reviewsCount: 32,
      averageRating: 4.8,
    },
    {
      productId: 4,
      name: 'Насіння газонної трави',
      description: 'Суміш насіння для створення густого зеленого газону',
      sku: 'NAS-4004',
      unitPrice: 299.99,
      discountPercentage: 0,
      weight: 1.0,
      dimensions: '20x15x5 см',
      imageUrl: 'https://images.unsplash.com/photo-1599594004640-9a8cf4a1cf16',
      categoryId: 3,
      categoryName: 'Рослини та насіння',
      supplierId: 4,
      supplierName: 'SeedMaster',
      isActive: true,
      createdDate: '2023-04-01',
      modifiedDate: '2023-04-01',
      inventoryCount: 100,
      reviewsCount: 42,
      averageRating: 4.6,
    },
    {
      productId: 5,
      name: 'Добриво органічне',
      description: 'Органічне добриво для всіх видів рослин',
      sku: 'DOB-5005',
      unitPrice: 199.99,
      discountPercentage: 5,
      weight: 5.0,
      dimensions: '30x25x10 см',
      imageUrl: 'https://images.unsplash.com/photo-1611735341450-74d61e660ad2',
      categoryId: 4,
      categoryName: 'Добрива та грунти',
      supplierId: 2,
      supplierName: 'GardenMax',
      isActive: true,
      createdDate: '2023-03-25',
      modifiedDate: '2023-03-25',
      inventoryCount: 80,
      reviewsCount: 28,
      averageRating: 4.4,
    },
    {
      productId: 6,
      name: 'Горщик керамічний декоративний',
      description: 'Стильний керамічний горщик для домашніх рослин',
      sku: 'GOR-6006',
      unitPrice: 349.99,
      discountPercentage: 0,
      weight: 0.8,
      dimensions: '15x15x15 см',
      imageUrl: 'https://images.unsplash.com/photo-1618220252344-8ec99ec624b1',
      categoryId: 5,
      categoryName: 'Горщики та кашпо',
      supplierId: 5,
      supplierName: 'CeramicPro',
      isActive: true,
      createdDate: '2023-03-20',
      modifiedDate: '2023-03-20',
      inventoryCount: 45,
      reviewsCount: 22,
      averageRating: 4.9,
    },
  ];

  const getDisplayProducts = () => {
    // Використовуємо демо-продукти, якщо API не повернуло дані
    switch (tabValue) {
      case 0:
        return featuredProducts.length > 0 ? featuredProducts : demoProducts;
      case 1:
        return newArrivals.length > 0 ? newArrivals : demoProducts;
      case 2:
        return bestSellers.length > 0 ? bestSellers : demoProducts;
      default:
        return featuredProducts.length > 0 ? featuredProducts : demoProducts;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddToCart = (product: Product) => {
    cartService.addToCart(product);
    // Можна додати повідомлення про успішне додавання
    alert(`Товар "${product.name}" додано до кошика`);
  };

  // Розрахунок ціни з урахуванням знижки
  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
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
    <Box sx={{ py: 5, bgcolor: '#f7f9fb' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            mb: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 100,
              height: 3,
              bgcolor: 'primary.main',
            },
          }}
        >
          Наші товари
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 'bold',
                px: { xs: 1, sm: 3 },
                minWidth: { xs: 'auto', sm: 150 },
              },
            }}
          >
            <Tab label="Популярні" />
            <Tab label="Новинки" />
            <Tab label="Бестселери" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {getDisplayProducts().map((product) => (
            <Grid item key={product.productId} xs={12} sm={6} md={4}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                {product.discountPercentage > 0 && (
                  <Chip
                    label={`-${product.discountPercentage}%`}
                    color="secondary"
                    size="small"
                    icon={<LocalOfferIcon />}
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      zIndex: 1,
                    }}
                  />
                )}
                
                <CardActionArea
                  component={RouterLink}
                  to={`/products/${product.productId}`}
                  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
                >
                  <ProductImage
                    imageBase64={product.imageBase64}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover'
                    }}
                  />
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                      noWrap
                    >
                      {product.categoryName}
                    </Typography>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        height: 50,
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Rating
                        value={product.averageRating || 0}
                        precision={0.5}
                        size="small"
                        readOnly
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({product.reviewsCount || 0})
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      {product.discountPercentage > 0 ? (
                        <>
                          <Typography
                            variant="h6"
                            color="primary"
                            fontWeight="bold"
                            sx={{ mr: 1 }}
                          >
                            {calculateDiscountedPrice(
                              product.unitPrice,
                              product.discountPercentage
                            ).toFixed(2)} грн
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textDecoration: 'line-through' }}
                          >
                            {product.unitPrice.toFixed(2)} грн
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          {product.unitPrice.toFixed(2)} грн
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 2,
                    pt: 0,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<ShoppingCartIcon />}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    До кошика
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            component={RouterLink}
            to="/products"
            variant="contained"
            color="primary"
            size="large"
          >
            Переглянути всі товари
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedProducts; 