import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Container,
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
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
  Breadcrumbs,
  Chip,
  Rating,
  Pagination,
  CardActionArea,
  List,
  ListItem,
  ListItemText,
  Collapse,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocalOffer as LocalOfferIcon,
  ShoppingCart as ShoppingCartIcon,
  Sort as SortIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  ExpandMore,
  ExpandLess,
  NavigateNext,
} from '@mui/icons-material';
import productService from '../../api/productService';
import categoryService from '../../api/categoryService';
import cartService from '../../api/cartService';
import type { Product, Category, ProductFilterParams } from '../../types';
import ProductImage from '../../components/ProductImage';

const CategoryProductsPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  // Стан для даних
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Стан для UI
  const [expandedSubcategories, setExpandedSubcategories] = useState(true);
  const [gridView, setGridView] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  
  // Фільтри
  const [filters, setFilters] = useState<ProductFilterParams>({
    pageNumber: 1,
    pageSize: 9,
    categoryID: Number(categoryId),
    sortBy: 'productName',
    sortDescending: false,
  });

  // Завантаження даних про категорію
  useEffect(() => {
    const fetchCategoryData = async () => {
      setLoading(true);
      setError(null);
      
      if (!categoryId) {
        setError('ID категорії не вказано');
        setLoading(false);
        return;
      }
      
      try {
        const categoryIdNum = Number(categoryId);
        
        // Отримуємо дані про категорію
        const categoryData = await categoryService.getCategoryById(categoryIdNum);
        setCategory(categoryData);
        
        // Отримуємо підкатегорії
        const subcategoriesData = await categoryService.getSubcategories(categoryIdNum);
        setSubcategories(subcategoriesData.categories.filter(c => c.isActive));
        
        // Якщо категорія має батьківську категорію, завантажуємо її дані
        if (categoryData.parentCategoryId) {
          const parentData = await categoryService.getCategoryById(categoryData.parentCategoryId);
          setParentCategory(parentData);
        } else {
          setParentCategory(null);
        }
        
        // Скидаємо фільтри при зміні категорії
        setFilters({
          pageNumber: 1,
          pageSize: 9,
          categoryID: categoryIdNum,
          sortBy: 'productName',
          sortDescending: false,
        });
      } catch (err) {
        console.error('Помилка завантаження даних категорії:', err);
        setError('Не вдалося завантажити дані категорії');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [categoryId]);
  
  // Завантаження товарів з урахуванням фільтрів
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await productService.getProducts(filters);
        setProducts(response.items);
        setTotalProducts(response.totalCount);
        setTotalPages(response.totalPages);
      } catch (err) {
        console.error('Помилка завантаження товарів:', err);
        setError('Не вдалося завантажити товари. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [filters]);
  
  // Обробники подій
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setFilters(prev => ({
      ...prev,
      pageNumber: value
    }));
    
    // Прокручуємо до верху сторінки
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  
  const handleSubcategoryClick = (id: number) => {
    navigate(`/categories/${id}`);
  };
  
  const handleSortChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    const [sortBy, sortDir] = value.split('-');
    
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortDescending: sortDir === 'desc',
      pageNumber: 1
    }));
  };
  
  const handlePriceRangeChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };
  
  const handlePriceRangeChangeCommitted = (event: Event, newValue: number | number[]) => {
    const [minPrice, maxPrice] = newValue as [number, number];
    
    setFilters(prev => ({
      ...prev,
      minPrice,
      maxPrice,
      pageNumber: 1
    }));
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    
    setFilters(prev => ({
      ...prev,
      searchTerm,
      // Не скидаємо номер сторінки відразу,
      // щоб користувач міг продовжити введення
    }));
  };
  
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Скидаємо номер сторінки при пошуку
    setFilters(prev => ({
      ...prev,
      pageNumber: 1
    }));
  };
  
  const handleResetFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 9,
      categoryID: Number(categoryId),
      sortBy: 'productName',
      sortDescending: false,
    });
    setPriceRange([0, 5000]);
  };
  
  const handleAddToCart = (product: Product) => {
    cartService.addToCart(product);
    alert(`Товар "${product.productName}" додано до кошика`);
  };
  
  // Допоміжні функції
  const calculateDiscountedPrice = (price: number, discount: number) => {
    return price - (price * discount) / 100;
  };
  
  const getSortValue = () => {
    return `${filters.sortBy}-${filters.sortDescending ? 'desc' : 'asc'}`;
  };
  
  // Дані для сортування
  const sortOptions = [
    { value: 'productName-asc', label: 'Назва (А-Я)' },
    { value: 'productName-desc', label: 'Назва (Я-А)' },
    { value: 'unitPrice-asc', label: 'Ціна (від низької до високої)' },
    { value: 'unitPrice-desc', label: 'Ціна (від високої до низької)' },
    { value: 'createdAt-desc', label: 'Нові надходження' },
    { value: 'averageRating-desc', label: 'Рейтинг (від високого до низького)' },
  ];
  
  if (loading && !category) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{category?.name || 'Категорія'} - Garden Tools</title>
        <meta name="description" content={`${category?.description || 'Каталог товарів у категорії. Широкий вибір садових інструментів та аксесуарів.'}`} />
      </Helmet>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Хлібні крихти */}
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <RouterLink to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Головна
          </RouterLink>
          <RouterLink to="/categories" style={{ color: 'inherit', textDecoration: 'none' }}>
            Каталог
          </RouterLink>
          {parentCategory && (
            <RouterLink to={`/categories/${parentCategory.categoryId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
              {parentCategory.name}
            </RouterLink>
          )}
          <Typography color="text.primary">{category?.name}</Typography>
        </Breadcrumbs>
        
        <Grid container spacing={4}>
          {/* Фільтри для десктопу */}
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterListIcon sx={{ mr: 1 }} />
                Фільтри
              </Typography>
              
              {subcategories.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Button
                    fullWidth
                    color="inherit"
                    sx={{
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      mb: 1
                    }}
                    onClick={() => setExpandedSubcategories(!expandedSubcategories)}
                    endIcon={expandedSubcategories ? <ExpandLess /> : <ExpandMore />}
                  >
                    <Typography variant="subtitle2">Підкатегорії</Typography>
                  </Button>
                  
                  <Collapse in={expandedSubcategories} timeout="auto" unmountOnExit>
                    <List dense disablePadding>
                      {subcategories.map((subcat) => (
                        <ListItem 
                          key={subcat.categoryId}
                          button
                          onClick={() => handleSubcategoryClick(subcat.categoryId)}
                          sx={{
                            borderLeft: '2px solid',
                            borderColor: 'primary.light',
                            pl: 2,
                            py: 0.7,
                            mb: 0.5,
                            '&:hover': {
                              bgcolor: 'action.hover',
                            }
                          }}
                        >
                          <ListItemText 
                            primary={subcat.name} 
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontWeight: 'medium'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
              
              <Box sx={{ mb: 3 }}>
                <form onSubmit={handleSearch}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Пошук товарів..."
                    value={filters.searchTerm || ''}
                    onChange={handleSearchChange}
                    sx={{ mb: 2 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </form>
                
                <Typography gutterBottom>Ціна</Typography>
                <Slider
                  value={priceRange}
                  onChange={handlePriceRangeChange}
                  onChangeCommitted={handlePriceRangeChangeCommitted}
                  min={0}
                  max={5000}
                  step={50}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value} грн`}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {priceRange[0]} грн
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {priceRange[1]} грн
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Сортування</InputLabel>
                <Select
                  value={getSortValue()}
                  onChange={handleSortChange}
                  label="Сортування"
                >
                  {sortOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={handleResetFilters}
                sx={{ mt: 2 }}
              >
                Скинути фільтри
              </Button>
            </Paper>
          </Grid>
          
          {/* Основний контент */}
          <Grid item xs={12} md={9}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                {category?.name}
              </Typography>
              
              {category?.description && (
                <Typography variant="body1" color="text.secondary" paragraph>
                  {category.description}
                </Typography>
              )}
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <Typography variant="body2" color="text.secondary">
                    Знайдено товарів: {totalProducts}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton
                    color={gridView ? 'primary' : 'default'}
                    onClick={() => setGridView(true)}
                    size="small"
                  >
                    <ViewModuleIcon />
                  </IconButton>
                  <IconButton
                    color={!gridView ? 'primary' : 'default'}
                    onClick={() => setGridView(false)}
                    size="small"
                  >
                    <ViewListIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
            
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
                <Grid container spacing={3}>
                  {products.map((product) => (
                    <Grid item key={product.productID} xs={12} sm={gridView ? 6 : 12} md={gridView ? 4 : 12}>
                      <Card 
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: gridView ? 'column' : 'row',
                          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                          position: 'relative',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
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
                          to={`/products/${product.productID}`}
                          sx={{
                            display: 'flex',
                            flexDirection: gridView ? 'column' : 'row',
                            flex: 1,
                          }}
                        >
                          {/* Зображення */}
                          <Box
                            sx={{
                              width: gridView ? '100%' : '180px',
                              position: 'relative',
                              flexShrink: 0,
                            }}
                          >
                            <ProductImage
                              imageBase64={product.imageBase64}
                              alt={product.productName}
                              style={{
                                width: '100%',
                                height: gridView ? '200px' : '180px',
                                objectFit: 'cover',
                                borderRadius: gridView ? '8px 8px 0 0' : '8px 0 0 8px',
                              }}
                            />
                          </Box>
                          
                          <CardContent sx={{ flex: 1 }}>
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
                              component="h2"
                              gutterBottom
                              sx={{
                                fontWeight: 'bold',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                height: gridView ? 50 : 'auto',
                              }}
                            >
                              {product.productName}
                            </Typography>
                            
                            {!gridView && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                paragraph
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {product.description}
                              </Typography>
                            )}
                            
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
                                ({product.reviewCount || 0})
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="h6" color="primary" fontWeight="bold">
                                {product.unitPrice.toFixed(2)} грн
                              </Typography>
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
                
                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                      count={totalPages}
                      page={filters.pageNumber || 1}
                      onChange={handlePageChange}
                      color="primary"
                      showFirstButton
                      showLastButton
                    />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default CategoryProductsPage; 