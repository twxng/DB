import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  Divider,
  Paper,
  Alert,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Breadcrumbs,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import cartService from '../../api/cartService';
import authService from '../../api/authService';
import productService from '../../api/productService';

interface CartItem {
  productId: number;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

interface Product {
  productId: number;
  name: string;
  description: string;
  imageUrl: string;
  unitPrice: number;
  categoryId: number;
  stockQuantity: number;
}

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart>({ items: [], totalItems: 0, totalPrice: 0 });
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [loading, setLoading] = useState(true);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const currentCart = cartService.getCart();
        setCart(currentCart);

        // Отримуємо повну інформацію про товари
        const productPromises = currentCart.items.map((item: CartItem) => 
          productService.getProductById(item.productId)
        );
        
        const productsData = await Promise.all(productPromises);
        const productsMap = productsData.reduce((acc: Record<number, Product>, product: Product | null) => {
          if (product) {
            acc[product.productId] = product;
          }
          return acc;
        }, {});
        
        setProducts(productsMap);
      } catch (err) {
        console.error('Помилка завантаження кошика:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    const updatedCart = cartService.updateQuantity(productId, quantity);
    setCart(updatedCart);

    // Оновлюємо інформацію про товар, якщо його ще немає в стані
    if (!products[productId]) {
      try {
        const product = await productService.getProductById(productId);
        if (product) {
          setProducts((prev: Record<number, Product>) => ({ ...prev, [productId]: product }));
        }
      } catch (err) {
        console.error('Помилка отримання інформації про товар:', err);
      }
    }
  };

  const handleRemoveItem = (productId: number) => {
    const updatedCart = cartService.removeItem(productId);
    setCart(updatedCart);
  };

  const handleClearCart = () => {
    if (window.confirm('Ви впевнені, що хочете очистити кошик?')) {
      const updatedCart = cartService.clearCart();
      setCart(updatedCart);
      setProducts({});
    }
  };

  const handleIncreaseQuantity = (item: CartItem) => {
    handleUpdateQuantity(item.productId, item.quantity + 1);
  };

  const handleDecreaseQuantity = (item: CartItem) => {
    if (item.quantity > 1) {
      handleUpdateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleQuantityChange = (item: CartItem, event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(event.target.value, 10);
    
    if (!isNaN(newQuantity) && newQuantity >= 1) {
      handleUpdateQuantity(item.productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/order');
    } else {
      navigate('/order');
    }
  };

  // Динамічний підрахунок підсумкової суми кошика
  const cartTotal = cart.items.reduce((sum, item) => {
    const product = products[item.productId];
    const unitPrice = typeof product?.price === 'number' && product.price > 0
      ? product.price
      : (typeof product?.unitPrice === 'number' && product.unitPrice > 0
        ? product.unitPrice
        : (typeof item.unitPrice === 'number' && item.unitPrice > 0 ? item.unitPrice : 0));
    return sum + unitPrice * item.quantity;
  }, 0);

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: 'calc(100vh - 64px - 64px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f1a12',
        color: '#fff',
        backgroundImage: 'linear-gradient(to bottom, #0f1a12, #172119)'
      }}>
        <CircularProgress sx={{ color: '#7fffd4' }} />
      </Box>
    );
  }

  return (
    <HelmetProvider>
      <Helmet>
        <title>Кошик - Garden Tools</title>
        <meta name="description" content="Перегляньте свій кошик та оформіть замовлення на товари для саду та городу." />
      </Helmet>
      
      <Box sx={{ 
        minHeight: 'calc(100vh - 64px - 64px)',
        padding: '2rem 0',
        backgroundColor: '#0f1a12',
        color: '#fff',
        backgroundImage: 'linear-gradient(to bottom, #0f1a12, #172119)'
      }}>
        <Container maxWidth="lg">
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" sx={{ color: '#7fffd4' }} />}
            sx={{ mb: 3 }}
          >
            <Link component={RouterLink} to="/" sx={{ color: '#7fffd4', '&:hover': { color: '#64d8cb' } }}>
              Головна
            </Link>
            <Typography sx={{ color: '#fff' }}>Кошик</Typography>
          </Breadcrumbs>
          
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: '#7fffd4',
              fontWeight: 600,
              mb: 4
            }}
          >
            <ShoppingCartIcon sx={{ mr: 1 }} />
            Кошик
          </Typography>
          
          {cart.items.length === 0 ? (
            <Paper 
              elevation={2} 
              sx={{ 
                p: 4, 
                borderRadius: 2, 
                textAlign: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ color: '#7fffd4' }}>
                Ваш кошик порожній
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
                Перейдіть до каталогу, щоб додати товари до кошика
              </Typography>
              <Button
                component={RouterLink}
                to="/products"
                variant="contained"
                startIcon={<ArrowBackIcon />}
                sx={{ 
                  backgroundColor: '#7fffd4',
                  color: '#0f1a12',
                  '&:hover': {
                    backgroundColor: '#64d8cb'
                  }
                }}
              >
                Повернутися до каталогу
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <TableContainer 
                  component={Paper} 
                  elevation={2} 
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#7fffd4', borderBottom: '1px solid rgba(127, 255, 212, 0.2)' }}>Товар</TableCell>
                        <TableCell align="center" sx={{ color: '#7fffd4', borderBottom: '1px solid rgba(127, 255, 212, 0.2)' }}>Ціна</TableCell>
                        <TableCell align="center" sx={{ color: '#7fffd4', borderBottom: '1px solid rgba(127, 255, 212, 0.2)' }}>Кількість</TableCell>
                        <TableCell align="right" sx={{ color: '#7fffd4', borderBottom: '1px solid rgba(127, 255, 212, 0.2)' }}>Сума</TableCell>
                        <TableCell align="right" sx={{ color: '#7fffd4', borderBottom: '1px solid rgba(127, 255, 212, 0.2)' }}></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.items.map((item: CartItem) => {
                        const product = products[item.productId];
                        let imageUrl = '';
                        if (product?.imageBase64) {
                          imageUrl = `data:image/png;base64,${product.imageBase64}`;
                        } else if (product?.imageUrl && product.imageUrl !== '') {
                          imageUrl = product.imageUrl;
                        } else if (item.imageUrl && item.imageUrl !== '') {
                          imageUrl = item.imageUrl;
                        } else {
                          imageUrl = '/images/placeholder.png';
                        }
                        const name = product?.name || item.name;
                        const unitPrice = typeof product?.price === 'number' && product.price > 0 ? product.price : (typeof product?.unitPrice === 'number' && product.unitPrice > 0 ? product.unitPrice : (typeof item.unitPrice === 'number' && item.unitPrice > 0 ? item.unitPrice : 0));
                        const description = product?.description;
                        const stockQuantity = product?.stockQuantity;
                        const total = Number(unitPrice) * item.quantity;

                        return (
                          <TableRow key={item.productId}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {imageUrl && (
                                  <Box
                                    component="img"
                                    src={imageUrl}
                                    alt={name}
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/images/placeholder.png';
                                    }}
                                    sx={{
                                      width: 80,
                                      height: 80,
                                      objectFit: 'cover',
                                      borderRadius: 1,
                                      mr: 2,
                                    }}
                                  />
                                )}
                                <Box>
                                  <Typography
                                    component={RouterLink}
                                    to={`/products/${item.productId}`}
                                    sx={{
                                      textDecoration: 'none',
                                      color: '#fff',
                                      fontWeight: 'bold',
                                      '&:hover': {
                                        color: '#7fffd4',
                                      },
                                    }}
                                  >
                                    {name}
                                  </Typography>
                                  {description && (
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        mt: 0.5,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      {description}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Typography sx={{ color: '#7fffd4' }}>
                                {Number(unitPrice).toFixed(2)} грн
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDecreaseQuantity(item)}
                                  disabled={item.quantity <= 1}
                                  sx={{ 
                                    color: '#7fffd4',
                                    '&:hover': { backgroundColor: 'rgba(127, 255, 212, 0.1)' },
                                    '&.Mui-disabled': { color: 'rgba(127, 255, 212, 0.3)' }
                                  }}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <TextField
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item, e as React.ChangeEvent<HTMLInputElement>)}
                                  type="number"
                                  inputProps={{
                                    min: 1,
                                    max: stockQuantity,
                                    style: { 
                                      textAlign: 'center',
                                      color: '#fff'
                                    },
                                  }}
                                  size="small"
                                  sx={{ 
                                    width: 60, 
                                    mx: 1,
                                    '& .MuiOutlinedInput-root': {
                                      color: '#fff',
                                      '& fieldset': {
                                        borderColor: 'rgba(127, 255, 212, 0.3)',
                                      },
                                      '&:hover fieldset': {
                                        borderColor: '#7fffd4',
                                      },
                                      '&.Mui-focused fieldset': {
                                        borderColor: '#7fffd4',
                                      },
                                    }
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => handleIncreaseQuantity(item)}
                                  disabled={stockQuantity !== undefined && item.quantity >= stockQuantity}
                                  sx={{ 
                                    color: '#7fffd4',
                                    '&:hover': { backgroundColor: 'rgba(127, 255, 212, 0.1)' },
                                    '&.Mui-disabled': { color: 'rgba(127, 255, 212, 0.3)' }
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              {stockQuantity !== undefined && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    textAlign: 'center',
                                    mt: 0.5,
                                    color: 'rgba(255, 255, 255, 0.7)'
                                  }}
                                >
                                  В наявності: {stockQuantity}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Typography sx={{ color: '#7fffd4', fontWeight: 'bold' }}>
                                {total.toFixed(2)} грн
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={() => handleRemoveItem(item.productId)}
                                sx={{ 
                                  color: '#ff6b6b',
                                  '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    component={RouterLink}
                    to="/products"
                    startIcon={<ArrowBackIcon />}
                    sx={{ 
                      color: '#7fffd4',
                      '&:hover': { backgroundColor: 'rgba(127, 255, 212, 0.1)' }
                    }}
                  >
                    Продовжити покупки
                  </Button>
                  <Button
                    onClick={handleClearCart}
                    startIcon={<DeleteIcon />}
                    sx={{ 
                      color: '#ff6b6b',
                      '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' }
                    }}
                  >
                    Очистити кошик
                  </Button>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ 
                      color: '#7fffd4',
                      fontWeight: 600,
                      mb: 3
                    }}
                  >
                    Разом
                  </Typography>
                  
                  <Box sx={{ my: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Кількість товарів:</Typography>
                      <Typography sx={{ color: '#fff' }}>{cart.totalItems}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Вартість товарів:</Typography>
                      <Typography sx={{ color: '#fff' }}>{cartTotal.toFixed(2)} грн</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Вартість доставки:</Typography>
                      <Typography sx={{ color: '#fff' }}>0.00 грн</Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2, borderColor: 'rgba(127, 255, 212, 0.2)' }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#7fffd4' }}>До сплати:</Typography>
                    <Typography variant="h6" sx={{ color: '#7fffd4', fontWeight: 'bold' }}>
                      {cartTotal.toFixed(2)} грн
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleCheckout}
                    sx={{ 
                      py: 1.5,
                      backgroundColor: '#7fffd4',
                      color: '#0f1a12',
                      '&:hover': {
                        backgroundColor: '#64d8cb'
                      }
                    }}
                  >
                    Оформити замовлення
                  </Button>
                  
                  {!isAuthenticated && (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mt: 2,
                        backgroundColor: 'rgba(127, 255, 212, 0.1)',
                        color: '#7fffd4',
                        '& .MuiAlert-icon': {
                          color: '#7fffd4'
                        }
                      }}
                    >
                      Для оформлення замовлення необхідно{' '}
                      <Link component={RouterLink} to="/login" sx={{ color: '#7fffd4', textDecoration: 'underline' }}>
                        увійти
                      </Link>{' '}
                      або{' '}
                      <Link component={RouterLink} to="/register" sx={{ color: '#7fffd4', textDecoration: 'underline' }}>
                        зареєструватися
                      </Link>
                      .
                    </Alert>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </HelmetProvider>
  );
};

export default CartPage; 