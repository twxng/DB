import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button,
  CircularProgress,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import categoryService from '../../api/categoryService';
import type { Category } from '../../types';

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

interface SubcategoryListProps {
  parentCategoryId: number;
}

const SubcategoryList: React.FC<SubcategoryListProps> = ({ parentCategoryId }) => {
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await categoryService.getSubcategories(parentCategoryId);
        setSubcategories(response.categories.filter(c => c.isActive));
        setLoading(false);
      } catch (err) {
        console.error('Помилка завантаження підкатегорій:', err);
        setError('Не вдалося завантажити підкатегорії');
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [parentCategoryId]);

  if (loading) {
    return <CircularProgress size={20} sx={{ color: COLORS.primary }} />;
  }

  if (error) {
    return <Typography color="error" variant="caption">{error}</Typography>;
  }

  if (subcategories.length === 0) {
    return <Typography variant="body2" color={COLORS.textSecondary}>Немає підкатегорій</Typography>;
  }

  return (
    <Box sx={{ mt: 1 }}>
      <List dense disablePadding>
        {subcategories.map((subcategory) => (
          <ListItem 
            key={subcategory.categoryId} 
            disablePadding
            sx={{ 
              pl: 1,
              py: 0.5,
              borderLeft: '2px solid',
              borderColor: COLORS.primary,
              ml: 1,
              my: 0.5
            }}
          >
            <ListItemText
              primary={
                <RouterLink 
                  to={`/categories/${subcategory.categoryId}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: COLORS.text,
                      '&:hover': { 
                        color: COLORS.primary,
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {subcategory.name}
                  </Typography>
                </RouterLink>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

const CategoryCard: React.FC<{ category: Category }> = ({ category }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card 
      elevation={3}
      sx={{ 
        height: '100%', 
        borderRadius: 2, 
        transition: 'all 0.3s ease',
        backgroundColor: COLORS.bgDark,
        border: `1px solid ${COLORS.border}`,
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 12px 20px ${COLORS.primaryLight}`,
        }
      }}
    >
      <CardActionArea 
        component={RouterLink}
        to={`/categories/${category.categoryId}`}
        sx={{ height: 140 }}
      >
        <Box 
          sx={{ 
            height: '100%', 
            bgcolor: 'rgba(127, 255, 212, 0.15)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <Typography 
            variant="h5" 
            component="h3" 
            sx={{ 
              color: COLORS.text, 
              textAlign: 'center',
              fontWeight: 'bold',
              px: 2,
              textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
            }}
          >
            {category.name}
          </Typography>
        </Box>
      </CardActionArea>
      
      <CardContent>
        {category.description && (
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 1, 
              color: COLORS.textSecondary,
              minHeight: '3rem',
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2
            }}
          >
            {category.description}
          </Typography>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Button
            size="small"
            component={RouterLink}
            to={`/categories/${category.categoryId}`}
            sx={{ 
              fontWeight: 'bold',
              backgroundColor: COLORS.primary,
              color: COLORS.textDark,
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: COLORS.primaryDark,
                boxShadow: 2
              }
            }}
          >
            Переглянути
          </Button>
          
          <Button 
            size="small" 
            onClick={(e) => {
              e.preventDefault();
              setExpanded(!expanded);
            }}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            sx={{
              color: COLORS.primary,
              '&:hover': {
                backgroundColor: 'rgba(127, 255, 212, 0.1)'
              }
            }}
          >
            Підкатегорії
          </Button>
        </Box>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <SubcategoryList parentCategoryId={category.categoryId} />
        </Collapse>
      </CardContent>
    </Card>
  );
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        // Переконуємося, що categories існує і є масивом
        const categoriesData = response.categories || [];
        // Фільтруємо тільки активні категорії верхнього рівня
        const mainCategories = categoriesData.filter(
          category => category.isActive && !category.parentCategoryId
        );
        setCategories(mainCategories);
        setLoading(false);
      } catch (err) {
        console.error('Помилка завантаження категорій:', err);
        setError('Не вдалося завантажити категорії. Спробуйте пізніше.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <>
      <Helmet>
        <title>Каталог категорій - Garden Tools</title>
        <meta name="description" content="Перегляньте всі категорії товарів для саду та городу. Широкий вибір інструментів та аксесуарів для садівництва та городництва." />
      </Helmet>
      
      <Box 
        sx={{ 
          py: 5, 
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h1" 
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{
              color: COLORS.text,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -16,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 100,
                height: 4,
                bgcolor: COLORS.primary,
                borderRadius: 2
              },
            }}
          >
            Каталог категорій
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              mt: 3, 
              mb: 2,
              color: COLORS.textSecondary,
              fontWeight: 'normal',
              opacity: 0.9
            }}
          >
            Оберіть категорію та знайдіть все необхідне для вашого саду
          </Typography>
        </Container>
      </Box>
        
      <Container 
        maxWidth="lg"
        sx={{ 
          py: 5, 
          mt: { xs: 2, md: -5 },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress size={60} sx={{ color: COLORS.primary }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 3 }}>
            {error}
          </Alert>
        ) : categories.length === 0 ? (
          <Alert severity="info" sx={{ my: 3 }}>
            Наразі немає доступних категорій
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {categories.map((category) => (
              <Box key={category.categoryId} sx={{ width: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.333% - 24px)' } }}>
                <CategoryCard category={category} />
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </>
  );
};

export default CategoriesPage; 