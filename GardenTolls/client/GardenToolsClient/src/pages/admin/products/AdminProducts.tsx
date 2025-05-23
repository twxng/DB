import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Avatar,
  alpha,
  Divider,
  Stack
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  Refresh,
  FilterList,
  Visibility,
  VisibilityOff,
  Sort,
  ClearAll,
} from '@mui/icons-material';
import type { Product, Category, Supplier } from '../../../types';
import productService from '../../../api/productService';
import categoryService from '../../../api/categoryService';
import supplierService from '../../../api/supplierService';
import ProductImage from '../../../components/ProductImage';
import './style.css';

// Фільтри для товарів
interface ProductFilters {
  search: string;
  categoryId: number;
  supplierId: number;
  minPrice: number;
  maxPrice: number;
  inStock: boolean | undefined | null;
}

// Сортування
type SortField = 'name' | 'price' | 'quantity' | 'rating';
type SortDirection = 'asc' | 'desc';

interface ProductSort {
  field: SortField;
  direction: SortDirection;
}

const AdminProducts = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    categoryId: 0,
    supplierId: 0,
    minPrice: 0,
    maxPrice: 0,
    inStock: null,
  });
  const [sort, setSort] = useState<ProductSort>({
    field: 'name',
    direction: 'asc',
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // Завантаження даних
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    try {
      // Завантаження категорій
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData.categories || []);
      
      // Завантаження постачальників
      const suppliersData = await supplierService.getSuppliersList();
      setSuppliers(suppliersData || []);
      
      // Обробка для inStock
      const inStockValue = filters.inStock === null ? undefined : filters.inStock;
      
      // Завантаження товарів
      const productsData = await productService.getProducts({
        pageNumber: page + 1,
        pageSize: rowsPerPage,
        searchTerm: filters.search || undefined,
        categoryID: filters.categoryId > 0 ? filters.categoryId : undefined,
        supplierID: filters.supplierId > 0 ? filters.supplierId : undefined,
        minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
        maxPrice: filters.maxPrice > 0 ? filters.maxPrice : undefined,
        inStock: inStockValue
      });
      
      setProducts(productsData.items || []);
      setTotalCount(productsData.totalCount || 0);
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Обробка фільтрів
  const handleFilterChange = (name: keyof ProductFilters, value: string | number | boolean | null) => {
    setFilters({ ...filters, [name]: value });
    setPage(0); // Скидаємо сторінку при зміні фільтрів
  };
  
  const handleSortChange = (field: SortField) => {
    setSort((prev: ProductSort) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    
    // Перезавантажуємо дані з новими параметрами сортування
    loadDataWithFilters(0, rowsPerPage, field, 
      sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc');
  };
  
  const handleResetFilters = () => {
    setFilters({
      search: '',
      categoryId: 0,
      supplierId: 0,
      minPrice: 0,
      maxPrice: 0,
      inStock: null,
    });
    
    // Перезавантажуємо дані з скинутими фільтрами
    loadDataWithFilters(0, rowsPerPage);
  };
  
  // Функція для завантаження даних з поточними фільтрами
  const loadDataWithFilters = (newPage: number, newRowsPerPage: number, sortField?: SortField, sortDirection?: SortDirection) => {
    setLoading(true);
    
    const currentSort = sortField 
      ? { field: sortField, direction: sortDirection || 'asc' } 
      : sort;
    
    const inStockValue = filters.inStock === null ? undefined : filters.inStock;
    
    productService.getProducts({
      pageNumber: newPage + 1,
      pageSize: newRowsPerPage,
      searchTerm: filters.search || undefined,
      categoryID: filters.categoryId > 0 ? filters.categoryId : undefined,
      supplierID: filters.supplierId > 0 ? filters.supplierId : undefined,
      minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
      maxPrice: filters.maxPrice > 0 ? filters.maxPrice : undefined,
      inStock: inStockValue,
      sortBy: currentSort.field,
      sortDescending: currentSort.direction === 'desc'
    })
    .then(data => {
      setProducts(data.items || []);
      setTotalCount(data.totalCount || 0);
      setLoading(false);
    })
    .catch(error => {
      console.error('Помилка завантаження даних:', error);
      setLoading(false);
    });
  };
  
  // Обробка пагінації
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    loadDataWithFilters(newPage, rowsPerPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    loadDataWithFilters(0, newRowsPerPage);
  };
  
  // Обробка діалогу видалення
  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      setLoading(true);
      try {
        const result = await productService.deleteProduct(productToDelete);
        if (result) {
          // Перезавантажуємо дані після успішного видалення
          loadData();
        }
      } catch (error) {
        console.error('Помилка при видаленні товару:', error);
      } finally {
        setLoading(false);
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };
  
  // Функція для отримання назви категорії за ID
  const getCategoryNameById = (categoryId?: number) => {
    if (!categoryId) return '';
    const category = categories.find(c => c.categoryId === categoryId);
    return category ? category.name : '';
  };
  
  // Функція для оновлення статусу активності товару
  const toggleProductStatus = async (productId: number, currentStatus: boolean) => {
    setLoading(true);
    try {
      await productService.updateProduct(productId, { isDiscontinued: !currentStatus });
      // Оновлюємо список товарів
      loadData();
    } catch (error) {
      console.error('Помилка при оновленні статусу товару:', error);
    } finally {
      setLoading(false);
    }
  };

  // Функція для перевірки, чи є активні фільтри
  const hasActiveFilters = () => {
    return filters.search !== '' || 
           filters.categoryId > 0 || 
           filters.supplierId > 0 || 
           filters.minPrice > 0 || 
           filters.maxPrice > 0 || 
           filters.inStock !== null;
  };
  
  return (
    <Box className="admin-panel-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/admin/products/add')}
          className="admin-panel-button"
        >
          Додати товар
        </Button>
      </Box>
      
      {/* Панель пошуку та фільтрів */}
      <Card className="admin-panel-card" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Пошук товарів за назвою"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  variant="outlined"
                  className="admin-panel-input"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'rgba(127, 255, 212, 0.7)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      backgroundColor: 'rgba(23, 33, 25, 0.7)',
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
              </Box>
              <Button
                startIcon={<FilterList />}
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                className={filtersExpanded ? "admin-panel-button" : "admin-panel-button-outlined"}
                variant={filtersExpanded ? "contained" : "outlined"}
              >
                {filtersExpanded ? "Згорнути фільтри" : "Розгорнути фільтри"}
              </Button>
              {hasActiveFilters() && (
                <Tooltip title="Скинути всі фільтри">
                  <IconButton 
                    onClick={handleResetFilters}
                    className="admin-panel-icon-button"
                    sx={{ color: '#7fffd4' }}
                  >
                    <ClearAll />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Оновити дані">
                <IconButton 
                  onClick={() => loadData()}
                  className="admin-panel-icon-button"
                  sx={{ color: '#7fffd4' }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
            
            {filtersExpanded && (
              <>
                <Divider className="admin-panel-divider" />
                <Typography variant="subtitle1" className="admin-panel-title" sx={{ mb: 1 }}>
                  Фільтри товарів
                </Typography>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <FormControl fullWidth className="admin-panel-input">
                      <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Категорія</InputLabel>
                      <Select
                        value={filters.categoryId > 0 ? filters.categoryId.toString() : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleFilterChange('categoryId', value === '' ? 0 : Number(value));
                        }}
                        label="Категорія"
                        sx={{
                          color: '#fff',
                          backgroundColor: 'rgba(23, 33, 25, 0.7)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(127, 255, 212, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7fffd4',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7fffd4',
                          },
                          '& .MuiSvgIcon-root': {
                            color: 'rgba(127, 255, 212, 0.7)',
                          }
                        }}
                      >
                        <MenuItem value="">Всі категорії</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.categoryId} value={category.categoryId.toString()}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl fullWidth className="admin-panel-input">
                      <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Постачальник</InputLabel>
                      <Select
                        value={filters.supplierId > 0 ? filters.supplierId.toString() : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleFilterChange('supplierId', value === '' ? 0 : Number(value));
                        }}
                        label="Постачальник"
                        sx={{
                          color: '#fff',
                          backgroundColor: 'rgba(23, 33, 25, 0.7)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(127, 255, 212, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7fffd4',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7fffd4',
                          },
                          '& .MuiSvgIcon-root': {
                            color: 'rgba(127, 255, 212, 0.7)',
                          }
                        }}
                      >
                        <MenuItem value="">Всі постачальники</MenuItem>
                        {suppliers.map((supplier) => (
                          <MenuItem key={supplier.supplierId} value={supplier.supplierId.toString()}>
                            {supplier.companyName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl fullWidth className="admin-panel-input">
                      <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Наявність</InputLabel>
                      <Select
                        value={filters.inStock === null ? '' : String(filters.inStock)}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleFilterChange('inStock', value === '' ? null : value === 'true');
                        }}
                        label="Наявність"
                        sx={{
                          color: '#fff',
                          backgroundColor: 'rgba(23, 33, 25, 0.7)',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(127, 255, 212, 0.3)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7fffd4',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#7fffd4',
                          },
                          '& .MuiSvgIcon-root': {
                            color: 'rgba(127, 255, 212, 0.7)',
                          }
                        }}
                      >
                        <MenuItem value="">Всі товари</MenuItem>
                        <MenuItem value="true">В наявності</MenuItem>
                        <MenuItem value="false">Немає в наявності</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                  
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Мін. ціна"
                      type="number"
                      value={filters.minPrice > 0 ? filters.minPrice : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFilterChange('minPrice', value === '' ? 0 : Number(value));
                      }}
                      className="admin-panel-input"
                      InputProps={{
                        startAdornment: <InputAdornment position="start" sx={{ color: 'rgba(127, 255, 212, 0.7)' }}>₴</InputAdornment>,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#fff',
                          backgroundColor: 'rgba(23, 33, 25, 0.7)',
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
                    
                    <TextField
                      fullWidth
                      label="Макс. ціна"
                      type="number"
                      value={filters.maxPrice > 0 ? filters.maxPrice : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleFilterChange('maxPrice', value === '' ? 0 : Number(value));
                      }}
                      className="admin-panel-input"
                      InputProps={{
                        startAdornment: <InputAdornment position="start" sx={{ color: 'rgba(127, 255, 212, 0.7)' }}>₴</InputAdornment>,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: '#fff',
                          backgroundColor: 'rgba(23, 33, 25, 0.7)',
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
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flex: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={handleResetFilters}
                        startIcon={<ClearAll />}
                        className="admin-panel-button-outlined"
                      >
                        Скинути фільтри
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          loadDataWithFilters(0, rowsPerPage);
                          setFiltersExpanded(false);
                        }}
                        className="admin-panel-button"
                      >
                        Застосувати фільтри
                      </Button>
                    </Box>
                  </Stack>
                </Stack>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Таблиця товарів */}
      <Card className="admin-panel-card">
        {loading && <LinearProgress className="admin-panel-progress" />}
        
        <TableContainer>
          <Table stickyHeader className="admin-panel-table">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'rgba(23, 33, 25, 0.9)' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.8)', backgroundColor: 'rgba(23, 33, 25, 0.9)', borderColor: 'rgba(127, 255, 212, 0.2)' }}>Фото</TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    backgroundColor: 'rgba(23, 33, 25, 0.9)',
                    borderColor: 'rgba(127, 255, 212, 0.2)'
                  }}
                  onClick={() => handleSortChange('name')}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Назва товару
                    {sort.field === 'name' && (
                      <Sort 
                        sx={{ 
                          ml: 0.5, 
                          fontSize: 18, 
                          transform: sort.direction === 'desc' ? 'rotate(180deg)' : 'none',
                          color: '#7fffd4'
                        }} 
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  backgroundColor: 'rgba(23, 33, 25, 0.9)',
                  borderColor: 'rgba(127, 255, 212, 0.2)'
                }}>Категорія</TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  backgroundColor: 'rgba(23, 33, 25, 0.9)',
                  borderColor: 'rgba(127, 255, 212, 0.2)'  
                }}>Постачальник</TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    backgroundColor: 'rgba(23, 33, 25, 0.9)',
                    borderColor: 'rgba(127, 255, 212, 0.2)'
                  }}
                  onClick={() => handleSortChange('price')}
                  align="right"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    Ціна
                    {sort.field === 'price' && (
                      <Sort 
                        sx={{ 
                          ml: 0.5, 
                          fontSize: 18, 
                          transform: sort.direction === 'desc' ? 'rotate(180deg)' : 'none',
                          color: '#7fffd4'
                        }} 
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    cursor: 'pointer', 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    backgroundColor: 'rgba(23, 33, 25, 0.9)',
                    borderColor: 'rgba(127, 255, 212, 0.2)'
                  }}
                  onClick={() => handleSortChange('quantity')}
                  align="center"
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Наявність
                    {sort.field === 'quantity' && (
                      <Sort 
                        sx={{ 
                          ml: 0.5, 
                          fontSize: 18, 
                          transform: sort.direction === 'desc' ? 'rotate(180deg)' : 'none',
                          color: '#7fffd4'
                        }} 
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ 
                  fontWeight: 'bold', 
                  color: 'rgba(255, 255, 255, 0.8)', 
                  backgroundColor: 'rgba(23, 33, 25, 0.9)',
                  borderColor: 'rgba(127, 255, 212, 0.2)' 
                }} align="right">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length === 0 ? (
                <TableRow key="no-products">
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      Товари не знайдено
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Спробуйте змінити параметри фільтрації або додати нові товари
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product.productId}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: alpha('#7fffd4', 0.05),
                      },
                    }}
                    onClick={() => navigate(`/admin/products/edit/${product.productId}`)}
                  >
                    <TableCell sx={{ width: 80 }}>
                      <Avatar
                        variant="rounded"
                        src={product.imageBase64 ? undefined : undefined}
                        alt={product.name}
                        sx={{ width: 50, height: 50, borderRadius: '8px' }}
                        className="product-avatar"
                      >
                        {product.imageBase64 ? (
                          <ProductImage
                            imageBase64={product.imageBase64}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          product.name.charAt(0).toUpperCase()
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 0.5, color: '#fff' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        SKU: {product.sku || 'Не вказано'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getCategoryNameById(product.categoryId) || 'Не вказано'}
                        size="small"
                        className="admin-panel-chip"
                        sx={{ color: '#fff' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#fff' }}>
                        {product.supplierName || 'Не вказано'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" fontWeight="medium" sx={{ color: '#7fffd4' }}>
                          {product.price ? product.price.toLocaleString('uk-UA') : '0'} ₴
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={product.inStock
                          ? `${product.quantity} шт.` 
                          : 'Немає'
                        }
                        size="small"
                        className={
                          !product.inStock || product.quantity <= 0 
                            ? "admin-panel-chip-error" 
                            : product.quantity < 10 
                              ? "admin-panel-chip-warning" 
                              : "admin-panel-chip-success"
                        }
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Редагувати">
                          <IconButton
                            size="small"
                            className="admin-panel-icon-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/products/edit/${product.productId}`);
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={!product.isDiscontinued ? 'Деактивувати' : 'Активувати'}>
                          <IconButton
                            size="small"
                            className={product.isDiscontinued ? "admin-panel-icon-button" : "admin-panel-icon-button-secondary"}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleProductStatus(product.productId, !product.isDiscontinued);
                            }}
                          >
                            {!product.isDiscontinued ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Видалити">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(product.productId);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Товарів на сторінці:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} з ${count}`}
          sx={{
            color: '#fff',
            '& .MuiToolbar-root': {
              color: '#fff',
            },
            '& .MuiSvgIcon-root': {
              color: 'rgba(127, 255, 212, 0.7)',
            }
          }}
        />
      </Card>
      
      {/* Діалог підтвердження видалення */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(23, 33, 25, 0.95)',
            color: '#fff',
            borderRadius: '8px',
            border: '1px solid rgba(127, 255, 212, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#7fffd4' }}>Підтвердження видалення</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Ви впевнені, що хочете видалити цей товар? Ця дія не може бути скасована.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDeleteCancel} 
            className="admin-panel-button-outlined"
          >
            Скасувати
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            autoFocus
            sx={{ 
              backgroundColor: 'rgba(244, 67, 54, 0.1)', 
              color: '#f44336',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
              }
            }}
          >
            Видалити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProducts; 