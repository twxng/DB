import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import cartService from '../api/cartService';
import orderService, { OrderCreateDto } from '../api/orderService';
import productsService from '../api/productService';
import type { CartItem, OrderFormData, Product } from '../types';

const initialFormData: OrderFormData = {
  shippingAddress: '',
  shippingCity: '',
  shippingCountry: '',
  shippingPostalCode: '',
  paymentMethod: 'card',
  notes: '',
  totalAmount: 0,
  orderDetails: []
};

export const OrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OrderFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<number, Product>>({});

  useEffect(() => {
    try {
      const cart = cartService.getCart();
      if (!cart || !cart.items.length) {
        console.error('Кошик порожній');
        setCartItems([]);
        return;
      }

      setCartItems(cart.items);
      
      // Оновлюємо formData з даними з кошика
      setFormData(prev => ({
        ...prev,
        totalAmount: cart.totalPrice,
        orderDetails: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      }));
    } catch (err) {
      console.error('Помилка при отриманні даних кошика:', err);
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      const productsData = productsService.getProducts();
      setProducts(productsData);
    } catch (err) {
      console.error('Помилка при отриманні даних товарів:', err);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      if (!cartItems.length) {
        throw new Error('Кошик порожній');
      }
  
      const orderData: OrderCreateDto = {
        paymentMethod: formData.paymentMethod === 'cash' ? 'Готівкою при отриманні' : 'Банківською картою',
        shippingAddress: formData.shippingAddress,
        shippingCity: formData.shippingCity,
        shippingCountry: formData.shippingCountry,
        shippingPostalCode: formData.shippingPostalCode,
        notes: formData.notes || 'string',
        orderDetails: cartItems.map(item => ({
          productID: item.productId,
          quantity: item.quantity
        }))
      };
  
      console.log('Sending order data:', orderData);
      const result = await orderService.createOrder(orderData);
      console.log('Order created:', result);
      console.log('Order ID field:', {
        orderID: result.orderID,
        Id: result.Id,
        id: result.id,
        allKeys: Object.keys(result)
      });
      
      cartService.clearCart();
      navigate(`/order-success/${result.orderID || result.Id || result.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Помилка при створенні замовлення';
      setError(errorMessage);
      console.error('Помилка при відправці замовлення:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Оформлення замовлення - Garden Tools</title>
        <meta name="description" content="Оформіть ваше замовлення на товари для саду та городу." />
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
            <Link component={RouterLink} to="/cart" sx={{ color: '#7fffd4', '&:hover': { color: '#64d8cb' } }}>
              Кошик
            </Link>
            <Typography sx={{ color: '#fff' }}>Оформлення замовлення</Typography>
          </Breadcrumbs>

          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            sx={{ 
              color: '#7fffd4',
              fontWeight: 600,
              mb: 4
            }}
          >
            Оформлення замовлення
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
              >
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ color: '#7fffd4', mb: 2 }}>
                        Товари в замовленні
                      </Typography>
											
                      <List>
                        {cartItems.map((item) => {
                          console.log('Cart Item:', item);
                          const product = products[item.productId];
                          const unitPrice = typeof product?.price === 'number' && product.price > 0 ? product.price : (typeof product?.unitPrice === 'number' && product.unitPrice > 0 ? product.unitPrice : (typeof item.unitPrice === 'number' && item.unitPrice > 0 ? item.unitPrice : 0));
                          const total = unitPrice * item.quantity;
                          
                          return (
                            <ListItem key={item.productId} sx={{ py: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                {/* Додаємо зображення товару */}
                                <Box
                                  component="img"
                                  src={item.imageUrl || '/images/placeholder.png'}
                                  alt={item.name}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/placeholder.png';
                                  }}
                                  sx={{
                                    width: 60,
                                    height: 60,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    mr: 2,
                                  }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                  <ListItemText
                                    primary={item.name}
                                    secondary={`Кількість: ${item.quantity} x ${unitPrice.toFixed(2)} грн`}
                                    primaryTypographyProps={{ color: '#fff' }}
                                    secondaryTypographyProps={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                  />
                                </Box>
                                <Typography sx={{ color: '#7fffd4' }}>
                                  {total.toFixed(2)} грн 
                                </Typography>
                              </Box>
                            </ListItem>
                          );
                        })}
                      </List>
                      <Divider sx={{ my: 2, borderColor: 'rgba(127, 255, 212, 0.2)' }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ color: '#7fffd4', mb: 2 }}>
                        Адреса доставки
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        label="Адреса"
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        sx={{
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
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#7fffd4',
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Місто"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleInputChange}
                        sx={{
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
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#7fffd4',
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Країна"
                        name="shippingCountry"
                        value={formData.shippingCountry}
                        onChange={handleInputChange}
                        sx={{
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
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#7fffd4',
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Поштовий індекс"
                        name="shippingPostalCode"
                        value={formData.shippingPostalCode}
                        onChange={handleInputChange}
                        sx={{
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
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#7fffd4',
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2, borderColor: 'rgba(127, 255, 212, 0.2)' }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ color: '#7fffd4', mb: 2 }}>
                        Спосіб оплати
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        select
                        label="Спосіб оплати"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        sx={{
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
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#7fffd4',
                          },
                        }}
                      >
                        <MenuItem value="card">Банківська карта</MenuItem>
                        <MenuItem value="cash">Готівка при отриманні</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Примітки до замовлення"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        sx={{
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
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255, 255, 255, 0.7)',
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#7fffd4',
                          },
                        }}
                      />
                    </Grid>

                    {error && (
                      <Grid item xs={12}>
                        <Alert severity="error" sx={{ 
                          backgroundColor: 'rgba(255, 107, 107, 0.1)',
                          color: '#ff6b6b',
                          '& .MuiAlert-icon': {
                            color: '#ff6b6b'
                          }
                        }}>
                          {error}
                        </Alert>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        sx={{ 
                          py: 1.5,
                          backgroundColor: '#7fffd4',
                          color: '#0f1a12',
                          '&:hover': {
                            backgroundColor: '#64d8cb'
                          },
                          '&.Mui-disabled': {
                            backgroundColor: 'rgba(127, 255, 212, 0.3)',
                            color: 'rgba(15, 26, 18, 0.5)'
                          }
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} sx={{ color: '#0f1a12' }} />
                        ) : (
                          'Підтвердити замовлення'
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
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
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: '#7fffd4',
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  Сума замовлення
                </Typography>

                <Box sx={{ my: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Вартість товарів:</Typography>
                    <Typography sx={{ color: '#fff' }}>{(formData.totalAmount || 0).toFixed(2)} грн</Typography>
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
                    {(formData.totalAmount || 0).toFixed(2)} грн
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </HelmetProvider>
  );
};