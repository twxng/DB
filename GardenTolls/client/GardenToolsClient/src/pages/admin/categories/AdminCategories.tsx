import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Switch,
  Grid,
  InputAdornment,
  LinearProgress,
  Tooltip,
  useTheme,
  alpha,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Collapse,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  ExpandMore,
  ExpandLess,
  SubdirectoryArrowRight,
  FolderOpen,
} from '@mui/icons-material';
import type { Category } from '../../../types';
import categoryService from '../../../api/categoryService';
import '../products/style.css';

// Константи для єдиної кольорової схеми сайту
const COLORS = {
  primary: '#7fffd4',
  primaryDark: '#5ecfaa',
  primaryLight: 'rgba(127, 255, 212, 0.3)',
  background: '#121914', // Темніший фон
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

// Початкова категорія для форми
const emptyCategory: Omit<Category, 'categoryId' | 'createdAt'> = {
  name: '',
  description: '',
  isActive: true,
  parentCategoryId: undefined
};

function AdminCategories() {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Omit<Category, 'categoryId' | 'createdAt'>>(emptyCategory);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [subcategories, setSubcategories] = useState<Record<number, Category[]>>({});
  const [loadingSubcategories, setLoadingSubcategories] = useState<Record<number, boolean>>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Завантаження даних
  useEffect(() => {
    loadCategories();
  }, []);
  
  // Завантаження категорій
  const loadCategories = async () => {
    try {
    setLoading(true);
      const response = await categoryService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Помилка при завантаженні категорій:', error);
      setSnackbar({
        open: true,
        message: 'Помилка при завантаженні категорій',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Завантаження підкатегорій
  const loadSubcategories = async (parentId: number) => {
    if (subcategories[parentId]?.length > 0) {
      // Якщо підкатегорії вже завантажені - показуємо/приховуємо їх
      setExpandedCategories(prev => ({
        ...prev, 
        [parentId]: !prev[parentId]
      }));
      return;
    }
    
    try {
      setLoadingSubcategories(prev => ({ ...prev, [parentId]: true }));
      const response = await categoryService.getSubcategories(parentId);
      setSubcategories(prev => ({ 
        ...prev, 
        [parentId]: response.categories 
      }));
      setExpandedCategories(prev => ({ 
        ...prev, 
        [parentId]: true 
      }));
    } catch (error) {
      console.error(`Помилка при завантаженні підкатегорій для категорії ${parentId}:`, error);
      setSnackbar({
        open: true,
        message: 'Помилка при завантаженні підкатегорій',
        severity: 'error'
      });
    } finally {
      setLoadingSubcategories(prev => ({ ...prev, [parentId]: false }));
    }
  };
  
  // Фільтрація головних категорій (без батьківської категорії)
  const mainCategories = categories.filter(
    category => 
      !category.parentCategoryId && 
      category.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Фільтрація всіх категорій за пошуком
  const allFilteredCategories = categories.filter(
    category => category.name.toLowerCase().includes(search.toLowerCase())
  );
  
  // Чи використовується пошук
  const isSearchActive = search.trim().length > 0;
  
  // Відкриття діалогу для створення нової категорії
  const handleAddClick = () => {
    setCurrentCategory(emptyCategory);
    setEditMode(false);
    setOpenDialog(true);
  };
  
  // Відкриття діалогу для створення нової підкатегорії
  const handleAddSubcategoryClick = (parentId: number) => {
    setCurrentCategory({
      ...emptyCategory,
      parentCategoryId: parentId
    });
    setEditMode(false);
    setOpenDialog(true);
  };
  
  // Відкриття діалогу для редагування категорії
  const handleEditClick = (category: Category) => {
    setCurrentCategory({
      name: category.name,
      description: category.description || '',
      parentCategoryId: category.parentCategoryId,
      isActive: category.isActive
    });
    setEditMode(true);
    setOpenDialog(true);
  };
  
  // Відкриття діалогу підтвердження видалення
  const handleDeleteClick = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setDeleteDialogOpen(true);
  };
  
  // Зміна активності категорії
  const handleToggleActive = async (categoryId: number) => {
    try {
      setLoading(true);
      await categoryService.toggleCategoryActive(categoryId);
      await loadCategories();
      
      // Оновлюємо підкатегорії, якщо вони були завантажені
      const parentIds = Object.keys(subcategories).map(Number);
      for (const parentId of parentIds) {
        if (subcategories[parentId]?.length > 0 && expandedCategories[parentId]) {
          const response = await categoryService.getSubcategories(parentId);
          setSubcategories(prev => ({ 
            ...prev, 
            [parentId]: response.categories 
          }));
        }
      }
      
      setSnackbar({
        open: true,
        message: 'Статус категорії успішно змінено',
        severity: 'success'
      });
    } catch (error) {
      console.error('Помилка при зміні статусу категорії:', error);
      setSnackbar({
        open: true,
        message: 'Помилка при зміні статусу категорії',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Обробка зміни полів форми
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCategory({ ...currentCategory, [name]: value });
  };
  
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCategory({ ...currentCategory, isActive: e.target.checked });
  };
  
  const handleParentCategoryChange = (e: any) => {
    const value = e.target.value === '' ? undefined : Number(e.target.value);
    setCurrentCategory({ ...currentCategory, parentCategoryId: value });
  };
  
  // Збереження категорії
  const handleSaveCategory = async () => {
    try {
      setLoading(true);
    if (editMode) {
      // Оновлення існуючої категорії
        const categoryId = categoryToEdit?.categoryId;
        if (categoryId) {
          await categoryService.updateCategory(categoryId, currentCategory);
          setSnackbar({
            open: true,
            message: 'Категорію успішно оновлено',
            severity: 'success'
          });
        }
    } else {
      // Створення нової категорії
        await categoryService.createCategory(currentCategory);
        setSnackbar({
          open: true,
          message: 'Категорію успішно створено',
          severity: 'success'
        });
      }
      
      // Оновлюємо категорії
      await loadCategories();
      
      // Оновлюємо підкатегорії, якщо вони були завантажені і змінилася батьківська категорія
      if (currentCategory.parentCategoryId && expandedCategories[currentCategory.parentCategoryId]) {
        const response = await categoryService.getSubcategories(currentCategory.parentCategoryId);
        setSubcategories(prev => ({ 
          ...prev, 
          [currentCategory.parentCategoryId!]: response.categories 
        }));
      }
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Помилка при збереженні категорії:', error);
      setSnackbar({
        open: true,
        message: 'Помилка при збереженні категорії',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Видалення категорії
  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        setLoading(true);
        await categoryService.deleteCategory(categoryToDelete);
        
        // Оновлюємо категорії
        await loadCategories();
        
        // Видаляємо підкатегорії з стану, якщо вони були завантажені
        if (subcategories[categoryToDelete]) {
          setSubcategories(prev => {
            const newState = { ...prev };
            delete newState[categoryToDelete];
            return newState;
          });
          
          setExpandedCategories(prev => {
            const newState = { ...prev };
            delete newState[categoryToDelete];
            return newState;
          });
        }
        
        // Оновлюємо підкатегорії для всіх батьківських категорій, які були розгорнуті
        const parentIds = Object.keys(expandedCategories)
          .map(Number)
          .filter(id => expandedCategories[id]);
          
        for (const parentId of parentIds) {
          const response = await categoryService.getSubcategories(parentId);
          setSubcategories(prev => ({ 
            ...prev, 
            [parentId]: response.categories 
          }));
        }
        
        setSnackbar({
          open: true,
          message: 'Категорію успішно видалено',
          severity: 'success'
        });
      } catch (error) {
        console.error('Помилка при видаленні категорії:', error);
        setSnackbar({
          open: true,
          message: 'Помилка при видаленні категорії. Можливо, вона містить товари або підкатегорії',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      }
    }
  };
  
  // Знаходимо категорію для редагування
  const categoryToEdit = categories.find(c => editMode && c.name === currentCategory.name);

  // Рендер рядка категорії
  const renderCategoryRow = (category: Category, isSubcategory = false) => (
    <TableRow
      key={category.categoryId}
      hover
      sx={{ 
        '&:last-child td, &:last-child th': { border: 0 },
        transition: 'background-color 0.2s',
        '&:hover': {
          backgroundColor: alpha('#7fffd4', 0.05),
        },
        backgroundColor: isSubcategory ? alpha('#7fffd4', 0.03) : 'inherit'
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isSubcategory && <SubdirectoryArrowRight sx={{ mr: 1, fontSize: 18, color: 'rgba(127, 255, 212, 0.7)' }} />}
          <Typography variant="body2" sx={{ color: '#fff' }}>{category.categoryId}</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!isSubcategory && (
            <IconButton
              size="small"
              onClick={() => loadSubcategories(category.categoryId)}
              disabled={loadingSubcategories[category.categoryId]}
              sx={{ mr: 1 }}
              className="admin-panel-icon-button"
            >
              {expandedCategories[category.categoryId] ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
          {isSubcategory ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" sx={{ color: '#fff' }}>
                {category.name}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FolderOpen sx={{ fontSize: 20, mr: 1, color: '#7fffd4' }} />
              <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#fff' }}>
                {category.name}
              </Typography>
            </Box>
          )}
        </Box>
      </TableCell>
      <TableCell sx={{ maxWidth: 300 }}>
        <Typography variant="body2" noWrap sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {category.description || "—"}
        </Typography>
      </TableCell>
      <TableCell align="center">
        <Chip 
          label={category.isActive ? 'Активна' : 'Неактивна'} 
          size="small"
          className={category.isActive ? "admin-panel-chip-success" : "admin-panel-chip"}
        />
      </TableCell>
      <TableCell align="right">
        {!isSubcategory && (
          <Tooltip title="Додати підкатегорію">
            <IconButton
              size="small"
              onClick={() => handleAddSubcategoryClick(category.categoryId)}
              className="admin-panel-icon-button"
            >
              <Add />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Редагувати">
          <IconButton
            size="small"
            onClick={() => handleEditClick(category)}
            className="admin-panel-icon-button"
          >
            <Edit />
          </IconButton>
        </Tooltip>
        <Tooltip title="Видалити">
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeleteClick(category.categoryId)}
            sx={{
              color: '#f44336'
            }}
          >
            <Delete />
          </IconButton>
        </Tooltip>
        <Tooltip title={category.isActive ? 'Деактивувати' : 'Активувати'}>
          <Switch 
            size="small" 
            checked={category.isActive}
            onChange={() => handleToggleActive(category.categoryId)}
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': {
                color: '#7fffd4',
              },
              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                backgroundColor: 'rgba(127, 255, 212, 0.5)',
              },
            }}
          />
        </Tooltip>
      </TableCell>
    </TableRow>
  );
  
  return (
    <Box className="admin-panel-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom className="admin-panel-title">
            Категорії
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Управління категоріями товарів
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddClick}
          className="admin-panel-button"
        >
          Додати категорію
        </Button>
      </Box>
      
      {/* Пошук та фільтрація */}
      <Card className="admin-panel-card" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flexGrow: 1, width: { xs: '100%', md: '75%' } }}>
              <TextField
                fullWidth
                placeholder="Пошук категорій"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-panel-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'rgba(127, 255, 212, 0.7)' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: { xs: '100%', md: '25%' } }}>
              <Button
                startIcon={<Refresh />}
                onClick={loadCategories}
                disabled={loading}
                className="admin-panel-button-outlined"
              >
                Оновити
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
      
      {/* Таблиця категорій */}
      <Card className="admin-panel-card">
        {loading && <LinearProgress className="admin-panel-progress" />}
        
        <TableContainer>
          <Table className="admin-panel-table">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha('#7fffd4', 0.08) }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }}>Назва</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }}>Опис</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }} align="center">Статус</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }} align="right">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isSearchActive ? (
                // При пошуку показуємо всі знайдені категорії
                allFilteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      Категорії не знайдено
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Спробуйте змінити пошуковий запит або додайте нову категорію
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                  allFilteredCategories.map(category => renderCategoryRow(
                    category, 
                    !!category.parentCategoryId
                  ))
                )
              ) : (
                // При звичайному перегляді показуємо ієрархічно
                mainCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        Категорії не знайдено
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Спробуйте додати нову категорію
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  mainCategories.map(category => (
                    <React.Fragment key={category.categoryId}>
                      {renderCategoryRow(category)}
                      
                      {expandedCategories[category.categoryId] && (
                        <>
                          {loadingSubcategories[category.categoryId] ? (
                            <TableRow>
                              <TableCell colSpan={5} sx={{ py: 2 }}>
                                <LinearProgress className="admin-panel-progress" />
                              </TableCell>
                            </TableRow>
                          ) : subcategories[category.categoryId]?.length > 0 ? (
                            subcategories[category.categoryId].map(subcategory => 
                              renderCategoryRow(subcategory, true)
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} sx={{ py: 2, backgroundColor: alpha('#7fffd4', 0.03) }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    У цієї категорії немає підкатегорій
                                  </Typography>
                                  <Button 
                                    size="small"
                                    startIcon={<Add />} 
                                    sx={{ ml: 2 }}
                                    className="admin-panel-button-outlined"
                                    onClick={() => handleAddSubcategoryClick(category.categoryId)}
                                  >
                                    Додати підкатегорію
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      )}
                    </React.Fragment>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      
      {/* Діалог редагування/створення категорії */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
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
        <DialogTitle sx={{ color: '#7fffd4' }}>
          {editMode ? 'Редагувати категорію' : 'Додати нову категорію'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Назва категорії"
            name="name"
            value={currentCategory.name}
            onChange={handleInputChange}
            margin="normal"
            required
            className="admin-panel-input"
          />
          <TextField
            fullWidth
            label="Опис"
            name="description"
            value={currentCategory.description}
            onChange={handleInputChange}
            margin="normal"
            multiline
            rows={3}
            className="admin-panel-input"
          />
          
          <FormControl fullWidth margin="normal" className="admin-panel-input">
            <InputLabel id="parent-category-label">Батьківська категорія</InputLabel>
            <Select
              labelId="parent-category-label"
              value={currentCategory.parentCategoryId === undefined ? '' : currentCategory.parentCategoryId}
              onChange={handleParentCategoryChange}
              label="Батьківська категорія"
            >
              <MenuItem value="">
                <em>Немає (головна категорія)</em>
              </MenuItem>
              {categories
                .filter(cat => (!editMode || cat.categoryId !== categoryToEdit?.categoryId))
                .map(category => (
                  <MenuItem key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </MenuItem>
                ))
              }
            </Select>
            <FormHelperText sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Виберіть батьківську категорію або залиште порожнім для створення головної категорії
            </FormHelperText>
          </FormControl>
          
          <Box sx={{ mt: 2 }}>
            <Typography component="div" variant="body2" sx={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
              Статус:
              <Switch
                checked={currentCategory.isActive}
                onChange={handleSwitchChange}
                name="isActive"
                sx={{
                  ml: 1,
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#7fffd4',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: 'rgba(127, 255, 212, 0.5)',
                  },
                }}
              />
              <Typography variant="body2" sx={{ color: '#fff', ml: 1 }}>
                {currentCategory.isActive ? 'Активна' : 'Неактивна'}
              </Typography>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} className="admin-panel-button-outlined">
            Скасувати
          </Button>
          <Button 
            onClick={handleSaveCategory} 
            variant="contained" 
            className="admin-panel-button"
            disabled={!currentCategory.name.trim()}
          >
            Зберегти
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Діалог підтвердження видалення */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
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
            Ви впевнені, що хочете видалити цю категорію? Ця дія не може бути скасована.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} className="admin-panel-button-outlined">
            Скасувати
          </Button>
          <Button onClick={handleDeleteConfirm} sx={{ 
            backgroundColor: 'rgba(244, 67, 54, 0.1)', 
            color: '#f44336',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.2)',
            }
          }} autoFocus>
            Видалити
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для повідомлень */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%', color: '#172119', '& .MuiAlert-icon': { color: '#172119' } }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminCategories; 