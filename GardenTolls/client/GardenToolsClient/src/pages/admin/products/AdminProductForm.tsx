import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  IconButton,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Paper,
  LinearProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Divider,
  Chip,
  CardMedia,
  Stack,
  CircularProgress,
  alpha,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Save,
  ArrowBack,
  Delete,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import type { Product, Category, Supplier } from '../../../types';
import productService from '../../../api/productService';
import categoryService from '../../../api/categoryService';
import supplierService from '../../../api/supplierService';
import ProductImage from '../../../components/ProductImage';
import './style.css';

// Початковий стан продукту для форми
const emptyProduct: Partial<Product> = {
  name: '',
  description: '',
  sku: '',
  price: 0,
  weight: 0,
  dimensions: '',
  imageBase64: '',
  categoryId: undefined,
  supplierId: undefined,
  supplierName: '',
  inStock: true,
  quantity: 0,
  isDiscontinued: false,
};

// Початкові дані форми нового постачальника
const emptySupplier = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: '',
  postalCode: '',
  website: '',
  isActive: true
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
      className="product-form__panel"
    >
      {value === index && children}
    </div>
  );
}

const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [product, setProduct] = useState<Partial<Product>>(emptyProduct);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Стан для створення нового постачальника
  const [newSupplierDialogOpen, setNewSupplierDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState(emptySupplier);
  const [supplierErrors, setSupplierErrors] = useState<Record<string, string>>({});
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  
  // Завантаження даних
  useEffect(() => {
    loadData();
  }, [id]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      // Завантажуємо категорії
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData.categories || []);
      
      // Завантажуємо постачальників
      const suppliersData = await supplierService.getSuppliersList();
      setSuppliers(Array.isArray(suppliersData) ? suppliersData.filter(s => s && s.supplierId) : []);
        
      if (isEdit && id) {
        // Завантажуємо дані редагованого товару
        const productId = parseInt(id);
        const productData = await productService.getProductById(productId);
        setProduct(productData);
      }
    } catch (error) {
      console.error('Помилка завантаження даних:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Помилка завантаження даних. Спробуйте оновити сторінку.'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
    
    // Очищення помилки при зміні значення
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value === '' ? 0 : Number(value) });
    
    // Очищення помилки при зміні значення
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    try {
      if (name === 'supplierId') {
        const selectedSupplier = value ? suppliers.find(s => s?.supplierId?.toString() === value) : null;
        setProduct(prev => ({
          ...prev,
          supplierId: value ? Number(value) : undefined,
          supplierName: selectedSupplier ? selectedSupplier.companyName : ''
        }));
      } else {
        setProduct(prev => ({
          ...prev,
          [name]: value ? Number(value) : undefined
        }));
      }

      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Помилка при зміні значення:', error);
      setErrors(prev => ({
        ...prev,
        [name]: 'Помилка при виборі значення'
      }));
    }
  };
  
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProduct({ ...product, [name]: checked });
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Для перегляду зображення використовуємо повний Base64 з префіксом
        setProduct({ 
          ...product, 
          imageFile: file,
          // Зберігаємо повний Base64 для відображення
          imageBase64: base64String
        });
      };
      reader.readAsDataURL(file);
      
      // Очищення помилки при зміні зображення
      if (errors['imageBase64']) {
        setErrors({ ...errors, imageBase64: '' });
      }
    }
  };
  
  const handleRemoveImage = () => {
    setProduct({ 
      ...product, 
      imageFile: undefined, 
      imageBase64: undefined
    });
  };
  
  // Обробка форми нового постачальника
  const handleNewSupplierInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSupplier({ ...newSupplier, [name]: value });
    
    // Очищення помилки при зміні значення
    if (supplierErrors[name]) {
      setSupplierErrors({ ...supplierErrors, [name]: '' });
    }
  };
  
  const handleNewSupplierSubmit = async () => {
    // Валідація форми постачальника
    const errors: Record<string, string> = {};
    
    if (!newSupplier.companyName) {
      errors.companyName = 'Назва компанії обов\'язкова';
    }
    
    if (!newSupplier.email) {
      errors.email = 'Email обов\'язковий';
    } else if (!/^\S+@\S+\.\S+$/.test(newSupplier.email)) {
      errors.email = 'Невірний формат email';
    }
    
    if (!newSupplier.phone) {
      errors.phone = 'Телефон обов\'язковий';
    }
    
    if (!newSupplier.address) {
      errors.address = 'Адреса обов\'язкова';
    }
    
    if (!newSupplier.city) {
      errors.city = 'Місто обов\'язкове';
    }
    
    if (!newSupplier.country) {
      errors.country = 'Країна обов\'язкова';
    }
    
    if (Object.keys(errors).length > 0) {
      setSupplierErrors(errors);
      return;
    }
    
    setCreatingSupplier(true);
    
    try {
      // Створення нового постачальника
      const supplierId = await supplierService.createSupplier(newSupplier);
      
      // Отримання оновленого списку постачальників
      const suppliersData = await supplierService.getSuppliersList();
      setSuppliers(suppliersData || []);
      
      // Встановлення нового постачальника для товару
      setProduct({ ...product, supplierId });
      
      // Закриття діалогу
      setNewSupplierDialogOpen(false);
      setNewSupplier(emptySupplier);
      
    } catch (error) {
      console.error('Помилка при створенні постачальника:', error);
      setSupplierErrors({ 
        submit: 'Не вдалося створити постачальника. Перевірте дані і спробуйте знову.' 
      });
    } finally {
      setCreatingSupplier(false);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Обов'язкові поля
    if (!product.name) {
      newErrors.name = 'Назва товару обов\'язкова';
    }
    
    if (!product.sku) {
      newErrors.sku = 'Артикул (SKU) обов\'язковий';
    }
    
    if (product.price === undefined || product.price <= 0) {
      newErrors.price = 'Введіть дійсну ціну';
    }
    
    if (!product.categoryId) {
      newErrors.categoryId = 'Виберіть категорію';
    }
    
    if (!product.supplierId) {
      newErrors.supplierId = 'Виберіть постачальника';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      if (isEdit && id) {
        await productService.updateProduct(parseInt(id), product);
      } else {
        const result = await productService.createProduct(product);
        console.log('Результат створення товару:', result);
      }
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);
      
    } catch (error) {
      console.error('Помилка при збереженні товару:', error);
      if (error instanceof Error) {
        setErrors({
          ...errors,
          submit: `Не вдалося зберегти товар: ${error.message}`
        });
      }
    } finally {
      setSaving(false);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          setProduct({ 
            ...product, 
            imageFile: file,
            imageBase64: base64String
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
          Завантаження даних...
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 1, md: 3 }, backgroundColor: '#121914', color: '#fff' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#7fffd4' }}>
            {isEdit ? 'Редагування товару' : 'Новий товар'}
          </Typography>
          <Typography variant="body1" color="rgba(255, 255, 255, 0.7)">
            {isEdit ? 'Змініть необхідну інформацію про товар' : 'Заповніть інформацію про новий товар'}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/products')}
            sx={{ mr: 1, color: '#7fffd4', borderColor: '#7fffd4', '&:hover': { backgroundColor: 'rgba(127, 255, 212, 0.1)' } }}
          >
            Назад
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<Save />}
            disabled={saving}
            sx={{ backgroundColor: '#7fffd4', color: '#172119', '&:hover': { backgroundColor: '#5ecfaa' } }}
          >
            {saving ? 'Збереження...' : 'Зберегти'}
          </Button>
        </Box>
      </Box>
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3, backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
          Товар успішно збережено!
        </Alert>
      )}
      
      {errors.submit && (
        <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336', border: '1px solid rgba(244, 67, 54, 0.3)' }}>
          {errors.submit}
        </Alert>
      )}

      <Card sx={{ backgroundColor: 'rgba(23, 33, 25, 0.7)', borderRadius: '8px', border: '1px solid rgba(127, 255, 212, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
        <CardContent>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            className="product-form__tabs"
            sx={{ 
              borderBottom: '1px solid rgba(127, 255, 212, 0.2)',
              '& .MuiTabs-indicator': {
                backgroundColor: '#7fffd4'
              }
            }}
          >
            <Tab
              label="Основна інформація"
              className="product-form__tab"
              sx={{ 
                color: tabValue === 0 ? '#7fffd4' : 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: '#7fffd4'
                }
              }}
            />
            <Tab
              label="Опис"
              className="product-form__tab"
              sx={{ 
                color: tabValue === 1 ? '#7fffd4' : 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: '#7fffd4'
                }
              }}
            />
            <Tab
              label="Склад"
              className="product-form__tab"
              sx={{ 
                color: tabValue === 2 ? '#7fffd4' : 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': {
                  color: '#7fffd4'
                }
              }}
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}
              gap={3}
            >
              <TextField
                fullWidth
                required
                label="Назва товару"
                name="name"
                value={product.name || ''}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                className="product-form__field"
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
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiFormHelperText-root.Mui-error': {
                    color: '#f44336',
                  },
                }}
              />
              
              <TextField
                fullWidth
                required
                label="Артикул (SKU)"
                name="sku"
                value={product.sku || ''}
                onChange={handleInputChange}
                error={!!errors.sku}
                helperText={errors.sku}
                className="product-form__field"
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
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiFormHelperText-root.Mui-error': {
                    color: '#f44336',
                  },
                }}
              />

              <FormControl
                fullWidth
                required
                error={!!errors.categoryId}
                className="product-form__field"
              >
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Категорія</InputLabel>
                <Select
                  name="categoryId"
                  value={product.categoryId?.toString() || ''}
                  onChange={handleSelectChange}
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
                  <MenuItem value="">
                    <em>Виберіть категорію</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.categoryId} value={category.categoryId.toString()}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.categoryId && (
                  <FormHelperText sx={{ color: '#f44336' }}>
                    {errors.categoryId}
                  </FormHelperText>
                )}
              </FormControl>

              <FormControl
                fullWidth
                required
                error={!!errors.supplierId}
                className="product-form__field"
              >
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Постачальник</InputLabel>
                <Select
                  name="supplierId"
                  value={product.supplierId ? product.supplierId.toString() : ''}
                  onChange={handleSelectChange}
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
                  <MenuItem value="">
                    <em>Виберіть постачальника</em>
                  </MenuItem>
                  {suppliers
                    .filter(supplier => supplier && supplier.supplierId && supplier.companyName)
                    .map(supplier => (
                      <MenuItem 
                        key={supplier.supplierId} 
                        value={supplier.supplierId.toString()}
                      >
                        {supplier.companyName}
                      </MenuItem>
                    ))
                  }
                </Select>
                {errors.supplierId && (
                  <FormHelperText sx={{ color: '#f44336' }}>
                    {errors.supplierId}
                  </FormHelperText>
                )}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setNewSupplierDialogOpen(true)}
                  sx={{ mt: 1, color: '#7fffd4', '&:hover': { backgroundColor: 'rgba(127, 255, 212, 0.1)' } }}
                >
                  + Додати нового постачальника
                </Button>
              </FormControl>
            </Box>

            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }}
              gap={3}
              mt={3}
            >
              <TextField
                fullWidth
                required
                type="number"
                label="Ціна"
                name="price"
                value={product.price || ''}
                onChange={handleNumberInputChange}
                error={!!errors.price}
                helperText={errors.price}
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
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiFormHelperText-root.Mui-error': {
                    color: '#f44336',
                  },
                }}
              />

              <TextField
                fullWidth
                type="number"
                label="Вага (кг)"
                name="weight"
                value={product.weight || ''}
                onChange={handleNumberInputChange}
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
                label="Розміри"
                name="dimensions"
                value={product.dimensions || ''}
                onChange={handleInputChange}
                placeholder="ДxШxВ"
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

            {isEdit && (
              <Box 
                sx={{ 
                  backgroundColor: 'rgba(23, 33, 25, 0.5)', 
                  borderRadius: '8px', 
                  border: '1px solid rgba(127, 255, 212, 0.2)',
                  p: 2,
                  mt: 3
                }}
              >
                <Typography sx={{ color: '#7fffd4', fontSize: '0.875rem', mb: 1, fontWeight: 500 }}>
                  Системна інформація
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                    ID: <strong>{product.productId}</strong>
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                    Створено: <strong>{product.createdAt || 'Н/Д'}</strong>
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.875rem' }}>
                    Оновлено: <strong>{product.updatedAt || 'Н/Д'}</strong>
                  </Typography>
                </Box>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }}
              gap={3}
            >
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Опис товару"
                name="description"
                value={product.description || ''}
                onChange={handleInputChange}
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
              
              <Box>
                <input
                  type="file"
                  accept="image/*"
                  id="product-image-upload"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <label htmlFor="product-image-upload">
                  <Paper 
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: 'rgba(23, 33, 25, 0.5)',
                      border: '2px dashed rgba(127, 255, 212, 0.3)',
                      borderRadius: '8px',
                      p: 2,
                      textAlign: 'center',
                      minHeight: '200px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s',
                      '&:hover': {
                        borderColor: '#7fffd4',
                        backgroundColor: 'rgba(127, 255, 212, 0.05)',
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {product.imageBase64 ? (
                      <Box position="relative">
                        <ProductImage
                          imageBase64={product.imageBase64}
                          alt={product.name || 'Зображення товару'}
                          style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '4px' }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveImage();
                          }}
                          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(23, 33, 25, 0.7)', color: '#fff' }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={1}
                        p={3}
                      >
                        <Upload fontSize="large" sx={{ color: 'rgba(127, 255, 212, 0.7)' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} align="center">
                          Клікніть або перетягніть зображення сюди
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Підтримуються формати: JPG, PNG, GIF
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </label>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}
              gap={3}
            >
              <TextField
                fullWidth
                type="number"
                label="Кількість на складі"
                name="quantity"
                value={product.quantity || ''}
                onChange={handleNumberInputChange}
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
              
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={product.inStock || false}
                      onChange={handleSwitchChange}
                      name="inStock"
                      color="primary"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#7fffd4',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'rgba(127, 255, 212, 0.5)',
                        },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: '#fff' }}>В наявності</Typography>}
                />
              </Box>
              
              <Box gridColumn="span 2">
                <FormControlLabel
                  control={
                    <Switch
                      checked={product.isDiscontinued || false}
                      onChange={handleSwitchChange}
                      name="isDiscontinued"
                      color="warning"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#ff9800',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: 'rgba(255, 152, 0, 0.5)',
                        },
                      }}
                    />
                  }
                  label={<Typography sx={{ color: '#fff' }}>Знято з виробництва</Typography>}
                />
              </Box>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Діалог створення нового постачальника */}
      <Dialog 
        open={newSupplierDialogOpen} 
        onClose={() => setNewSupplierDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(23, 33, 25, 0.95)',
            color: '#fff',
            borderRadius: '8px',
            border: '1px solid rgba(127, 255, 212, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#7fffd4' }}>Новий постачальник</DialogTitle>
        <DialogContent>
          {supplierErrors.submit && (
            <Alert severity="error" sx={{ mb: 2, backgroundColor: 'rgba(244, 67, 54, 0.1)', color: '#f44336', border: '1px solid rgba(244, 67, 54, 0.3)' }}>
              {supplierErrors.submit}
            </Alert>
          )}
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, mt: 2 }}>
            <Box>
              <TextField
                fullWidth
                required
                label="Назва компанії"
                name="companyName"
                value={newSupplier.companyName}
                onChange={handleNewSupplierInputChange}
                error={!!supplierErrors.companyName}
                helperText={supplierErrors.companyName}
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
                  '& .MuiFormHelperText-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiFormHelperText-root.Mui-error': {
                    color: '#f44336',
                  },
                }}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Контактна особа"
                name="contactPerson"
                value={newSupplier.contactPerson}
                onChange={handleNewSupplierInputChange}
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
            <Box>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={newSupplier.email}
                onChange={handleNewSupplierInputChange}
                error={!!supplierErrors.email}
                helperText={supplierErrors.email}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                required
                label="Телефон"
                name="phone"
                value={newSupplier.phone}
                onChange={handleNewSupplierInputChange}
                error={!!supplierErrors.phone}
                helperText={supplierErrors.phone}
              />
            </Box>
            <Box sx={{ gridColumn: 'span 2' }}>
              <TextField
                fullWidth
                required
                label="Адреса"
                name="address"
                value={newSupplier.address}
                onChange={handleNewSupplierInputChange}
                error={!!supplierErrors.address}
                helperText={supplierErrors.address}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                required
                label="Місто"
                name="city"
                value={newSupplier.city}
                onChange={handleNewSupplierInputChange}
                error={!!supplierErrors.city}
                helperText={supplierErrors.city}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                required
                label="Країна"
                name="country"
                value={newSupplier.country}
                onChange={handleNewSupplierInputChange}
                error={!!supplierErrors.country}
                helperText={supplierErrors.country}
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Поштовий індекс"
                name="postalCode"
                value={newSupplier.postalCode}
                onChange={handleNewSupplierInputChange}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
            <Button
            onClick={() => setNewSupplierDialogOpen(false)} 
            disabled={creatingSupplier}
          >
            Скасувати
            </Button>
            <Button
              variant="contained"
            onClick={handleNewSupplierSubmit}
            disabled={creatingSupplier}
          >
            {creatingSupplier ? 'Створення...' : 'Створити'}
            </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminProductForm; 