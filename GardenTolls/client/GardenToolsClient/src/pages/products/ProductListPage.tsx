import { useState, useEffect } from 'react';
import { useSearchParams, Link as RouterLink, useParams } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Pagination,
  Rating,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Divider,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  CardActionArea,
  Grid,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocalOffer as LocalOfferIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from '@mui/icons-material';
import productService from '../../api/productService';
import cartService from '../../api/cartService';
import type { Product, Category, ProductFilterParams } from '../../types';
import ProductImage from '../../components/ProductImage';
// Константи для єдиної кольорової схеми сайту
const COLORS = {
  primary: '#7fffd4',
  primaryDark: '#5ecfaa',
  primaryLight: 'rgba(127, 255, 212, 0.3)',
  background: '#121914',
  bgLight: 'rgba(255, 255, 255, 0.95)',
  bgDark: 'rgba(23, 33, 25, 0.9)',
  text: '#ffffff',
  textDark: '#172119',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  border: 'rgba(127, 255, 212, 0.2)',
  shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  accent: '#e8f5e9',
  error: '#f44336',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3'
};

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categoryId } = useParams<{ categoryId?: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [gridView, setGridView] = useState(true);
  
  // Фільтри
  const [filters, setFilters] = useState<ProductFilterParams>({
    categoryID: categoryId ? Number(categoryId) : searchParams.get('category') ? Number(searchParams.get('category')) : undefined,
    searchTerm: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    sortBy: searchParams.get('sortBy') || 'name',
    sortDescending: searchParams.get('sortDirection') === 'desc',
    pageNumber: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    pageSize: 9,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await productService.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Помилка завантаження категорій:', err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await productService.getProducts(filters);
        console.log('Products response:', response);
        console.log('First product:', response.items[0]);
        setProducts(response.items);
        setTotalProducts(response.totalItems);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Помилка завантаження товарів:', err);
        setError('Не вдалося завантажити товари. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    
    // Оновлюємо URL з параметрами пошуку
    const params: Record<string, string> = {};
    if (filters.categoryID) params.category = filters.categoryID.toString();
    if (filters.searchTerm) params.search = filters.searchTerm;
    if (filters.minPrice) params.minPrice = filters.minPrice.toString();
    if (filters.maxPrice) params.maxPrice = filters.maxPrice.toString();
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortDescending !== undefined) params.sortDirection = filters.sortDescending ? 'desc' : 'asc';
    if (filters.pageNumber && filters.pageNumber > 1) params.page = filters.pageNumber.toString();
    
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Оновлення фільтрів коли змінюється ID категорії в URL
  useEffect(() => {
    if (categoryId) {
      setFilters(prevFilters => ({
        ...prevFilters,
        categoryID: Number(categoryId),
        pageNumber: 1
      }));
    }
  }, [categoryId]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      pageNumber: value,
    }));
    
    // Прокручуємо до верху сторінки
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleCategoryChange = (event: SelectChangeEvent<number>) => {
    const value = event.target.value as number;
    setFilters((prevFilters) => ({
      ...prevFilters,
      categoryID: value || undefined,
      pageNumber: 1,
    }));
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    const [sortBy, direction] = value.split('-') as [string, 'asc' | 'desc'];
    
    setFilters((prevFilters) => ({
      ...prevFilters,
      sortBy,
      sortDescending: direction === 'desc',
      pageNumber: 1,
    }));
  };

  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };

  const handlePriceRangeChangeCommitted = (
    event: Event | React.SyntheticEvent<Element, Event>,
    newValue: number | number[]
  ) => {
    const [minPrice, maxPrice] = newValue as [number, number];
    
    setFilters((prevFilters) => ({
      ...prevFilters,
      minPrice,
      maxPrice,
      pageNumber: 1,
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    
    setFilters((prevFilters) => ({
      ...prevFilters,
      searchTerm: value,
    }));
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    
    setFilters((prevFilters) => ({
      ...prevFilters,
      pageNumber: 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      sortBy: 'name',
      sortDescending: false,
      pageNumber: 1,
      pageSize: 9,
    });
    setPriceRange([0, 5000]);
  };

  const handleAddToCart = (product: Product) => {
    cartService.addToCart(product);
    alert(`Товар "${product.name}" додано до кошика`);
  };

  // Розрахунок ціни з урахуванням знижки
  const calculateDiscountedPrice = (price: number, discount: number) => {
    if (price === undefined || price === null) return 0;
    return price - (price * discount) / 100;
  };

  // Отримання значення сортування для Select
  const getSortValue = () => {
    return `${filters.sortBy}-${filters.sortDescending ? 'desc' : 'asc'}`;
  };

  // Дані для сортування
  const sortOptions = [
    { value: 'name-asc', label: 'Назва (А-Я)' },
    { value: 'name-desc', label: 'Назва (Я-А)' },
    { value: 'unitPrice-asc', label: 'Ціна (від низької до високої)' },
    { value: 'unitPrice-desc', label: 'Ціна (від високої до низької)' },
    { value: 'createdDate-desc', label: 'Нові надходження' },
    { value: 'averageRating-desc', label: 'Рейтинг (від високого до низького)' },
  ];

  if (loading && products.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '50vh',
        py: 8 
      }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  return (
    <HelmetProvider>
      <Helmet>
        <title>Каталог товарів - Garden Tools</title>
        <meta name="description" content="Широкий вибір садових інструментів, системи поливу, рослин, добрив та інших товарів для саду та городу." />
      </Helmet>
      
      <Container maxWidth={false} sx={{ maxWidth: '1600px', px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Пошук та сортування */}
        <Box sx={{ mb: 4, mt: 2 }}>
          <Grid container spacing={2}>
            <Grid sx={{ width: { xs: '100%', sm: '60%' } }}>
              <Box component="form" onSubmit={handleSearch}>
                <TextField
                  fullWidth
                  placeholder="Пошук товарів..."
                  value={filters.searchTerm || ''}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: COLORS.primary }} />
                      </InputAdornment>
                    ),
                    sx: {
                      color: COLORS.text,
                      backgroundColor: 'rgba(23, 33, 25, 0.7)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.border
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.primary
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.primary
                      }
                    }
                  }}
                />
              </Box>
            </Grid>
            
            <Grid sx={{ width: { xs: '100%', sm: '40%' } }}>
              <FormControl fullWidth>
                <InputLabel 
                  id="sort-select-label" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: COLORS.textSecondary
                  }}
                >
                  <SortIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                  Сортування
                </InputLabel>
                <Select
                  labelId="sort-select-label"
                  id="sort-select"
                  value={getSortValue()}
                  label="Сортування"
                  onChange={handleSortChange}
                  sx={{
                    color: COLORS.text,
                    backgroundColor: 'rgba(23, 33, 25, 0.7)',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.border
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.primary
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: COLORS.primary
                    },
                    '& .MuiSvgIcon-root': {
                      color: COLORS.primary
                    }
                  }}
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Фільтри */}
          <Box 
            sx={{ 
              display: { xs: 'none', md: 'block' },
              width: '280px',
              flexShrink: 0
            }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 2, md: 3 }, 
                borderRadius: 2,
                background: 'rgba(23, 33, 25, 0.6)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${COLORS.border}`,
                boxShadow: COLORS.shadow,
                position: 'sticky',
                top: '1rem'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: COLORS.primary,
                  fontWeight: 600,
                  mb: 3
                }}
              >
                <FilterListIcon sx={{ mr: 1 }} />
                Фільтри
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel 
                    id="category-select-label"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Категорія
                  </InputLabel>
                  <Select
                    labelId="category-select-label"
                    id="category-select"
                    value={filters.categoryID || ''}
                    label="Категорія"
                    onChange={handleCategoryChange}
                    sx={{
                      color: COLORS.text,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.border
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.primary
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: COLORS.primary
                      },
                      '& .MuiSvgIcon-root': {
                        color: COLORS.primary
                      }
                    }}
                  >
                    <MenuItem value="">Усі категорії</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.categoryId} value={category.categoryId}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Typography gutterBottom sx={{ color: COLORS.textSecondary }}>Ціна</Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  onChangeCommitted={handlePriceRangeChangeCommitted}
                  min={0}
                  max={5000}
                  step={50}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value} грн`}
                  sx={{
                    color: COLORS.primary,
                    '& .MuiSlider-thumb': {
                      backgroundColor: COLORS.primary,
                    },
                    '& .MuiSlider-rail': {
                      backgroundColor: 'rgba(127, 255, 212, 0.2)',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: COLORS.primary,
                    }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color={COLORS.textSecondary}>
                    {priceRange[0]} грн
                  </Typography>
                  <Typography variant="body2" color={COLORS.textSecondary}>
                    {priceRange[1]} грн
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2, borderColor: COLORS.border }} />
              
              <Button
                variant="outlined"
                fullWidth
                onClick={handleResetFilters}
                sx={{ 
                  mt: 2,
                  color: COLORS.primary,
                  borderColor: COLORS.primary,
                  '&:hover': {
                    borderColor: COLORS.primaryDark,
                    backgroundColor: 'rgba(127, 255, 212, 0.1)'
                  }
                }}
              >
                Скинути фільтри
              </Button>
            </Paper>
          </Box>
          
          {/* Основний контент */}
          <Box 
            sx={{ 
              flex: 1,
              minWidth: 0 // Важливо для правильного переносу flex-елементів
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {products.length === 0 && !loading ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                Товари не знайдено. Спробуйте змінити параметри пошуку.
              </Alert>
            ) : (
              <>
                <Box 
                  sx={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    margin: -1 // Компенсація внутрішніх відступів
                  }}
                >
                  {products.map((product) => (
                    <Box
                      key={product.productId}
                      sx={{
                        width: {
                          xs: '100%',
                          sm: '50%',
                          md: '33.333%',
                          lg: '25%'
                        },
                        p: 1
                      }}
                    >
                      <Card 
                        sx={{
                          height: '100%',
                          minHeight: { xs: '420px', sm: '440px', md: '460px' },
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          backgroundColor: COLORS.bgDark,
                          borderRadius: 2,
                          border: `1px solid ${COLORS.border}`,
                          boxShadow: COLORS.shadow,
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      >
                        {product.discountPercentage && product.discountPercentage > 0 && (
                          <Chip
                            label={`-${product.discountPercentage}%`}
                            size="small"
                            icon={<LocalOfferIcon />}
                            sx={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              zIndex: 1,
                              backgroundColor: 'rgba(255, 0, 0, 0.8)',
                              color: '#fff',
                              fontWeight: 'bold',
                              '& .MuiChip-icon': {
                                color: '#fff'
                              }
                            }}
                          />
                        )}

                        <Box
                          sx={{
                            width: '100%',
                            height: 'auto',
                            minHeight: { xs: '200px', sm: '220px', md: '240px' },
                            maxHeight: { xs: '240px', sm: '260px', md: '280px' },
                            position: 'relative',
                            overflow: 'hidden',
                            backgroundColor: '#ffffff',
                            borderRadius: '8px 8px 0 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2
                          }}
                        >
                          <CardActionArea 
                            component={RouterLink} 
                            to={`/products/${product.productId}`}
                            sx={{
                              height: '100%',
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <ProductImage
                              imageBase64={product.imageBase64}
                              alt={product.name}
                              className="productImage"
                              style={{
                                width: 'auto',
                                height: 'auto',
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                transition: 'transform 0.3s ease'
                              }}
                            />
                          </CardActionArea>
                        </Box>

                        <CardContent 
                          sx={{ 
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            color: COLORS.text,
                            p: { xs: 2, sm: 2.5 },
                            backgroundColor: 'transparent'
                          }}
                        >
                          <Box>
                            <Typography
                              variant="subtitle2"
                              color="primary"
                              gutterBottom
                              noWrap
                              sx={{
                                mb: 1,
                                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                color: COLORS.primary
                              }}
                            >
                              {product.categoryName}
                            </Typography>

                            <Typography
                              variant="h6"
                              component="h2"
                              gutterBottom
                              sx={{
                                fontWeight: 'bold',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                height: { xs: '40px', sm: '44px' },
                                color: COLORS.text,
                                fontSize: { xs: '0.95rem', sm: '1rem' },
                                mb: 1,
                                lineHeight: 1.2
                              }}
                            >
                              {product.name}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Rating 
                                value={product.averageRating || 0} 
                                precision={0.5}
                                readOnly 
                                size="small"
                                sx={{
                                  '& .MuiRating-iconFilled': {
                                    color: COLORS.primary
                                  }
                                }}
                              />
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  ml: 1,
                                  color: COLORS.textSecondary,
                                  fontSize: '0.75rem' 
                                }}
                              >
                                {product.averageRating ? product.averageRating.toFixed(1) : 'Немає оцінок'}
                              </Typography>
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{
                                mb: 1,
                                fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                lineHeight: 1.5,
                                maxHeight: '4.5em',
                                overflow: 'hidden',
                                position: 'relative',
                                color: COLORS.textSecondary,
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  bottom: 0,
                                  right: 0,
                                  width: '40%',
                                  height: '1.5em',
                                  background: 'linear-gradient(to right, rgba(23, 33, 25, 0), rgba(23, 33, 25, 0.9) 50%)'
                                }
                              }}
                            >
                              {product.description || 'Опис товару відсутній'}
                            </Typography>
                          </Box>

                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              {product.discountPercentage && product.discountPercentage > 0 && product.price ? (
                                <>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ 
                                      mr: 1,
                                      fontSize: { xs: '1rem', sm: '1.1rem' },
                                      color: COLORS.primary
                                    }}
                                  >
                                    {calculateDiscountedPrice(
                                      product.price,
                                      product.discountPercentage
                                    ).toFixed(2)} грн
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ 
                                      textDecoration: 'line-through',
                                      fontSize: { xs: '0.8rem', sm: '0.85rem' },
                                      color: COLORS.textSecondary
                                    }}
                                  >
                                    {product.price.toFixed(2)} грн
                                  </Typography>
                                </>
                              ) : (
                                <Typography 
                                  variant="h6" 
                                  fontWeight="bold"
                                  sx={{ 
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    color: COLORS.primary
                                  }}
                                >
                                  {product.price ? `${product.price.toFixed(2)} грн` : 'Ціна за запитом'}
                                </Typography>
                              )}
                            </Box>

                            <Button
                              variant="contained"
                              fullWidth
                              startIcon={<ShoppingCartIcon />}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              sx={{
                                backgroundColor: COLORS.primary,
                                color: COLORS.textDark,
                                fontWeight: 'bold',
                                py: { xs: 0.75, sm: 1 },
                                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                '&:hover': {
                                  backgroundColor: COLORS.primaryDark
                                }
                              }}
                            >
                              До кошика
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
                
                {totalPages > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    mt: { xs: 3, md: 4 },
                    mb: { xs: 2, md: 3 }
                  }}>
                    <Pagination
                      count={totalPages}
                      page={filters.pageNumber || 1}
                      onChange={handlePageChange}
                      sx={{ 
                        '& .MuiPaginationItem-root': {
                          color: COLORS.text
                        },
                        '& .MuiPaginationItem-page.Mui-selected': {
                          backgroundColor: COLORS.primary,
                          color: COLORS.textDark
                        }
                      }}
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
                
                <Box sx={{ 
                  mt: 2, 
                  textAlign: 'center',
                  color: COLORS.textSecondary,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' }
                }}>
                  <Typography variant="body2">
                    Показано {products.length} з {totalProducts} товарів
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </HelmetProvider>
  );
};

export default ProductListPage; 