import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Container,
  Button,
  Toolbar,
  AppBar,
  IconButton,
  Divider,
  alpha
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  ShoppingBag,
  People,
  Category,
  ArrowBack,
  Home as HomeIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../pages/admin/products/style.css';

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

// Константа для ширини бічної панелі
const drawerWidth = 240;

// Навігаційні пункти для бічної панелі
interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navigationItems: NavigationItem[] = [
  { name: 'Панель управління', path: '/admin', icon: <TrendingUp /> },
  { name: 'Товари', path: '/admin/products', icon: <Inventory /> },
  { name: 'Замовлення', path: '/admin/orders', icon: <ShoppingBag /> },
  { name: 'Користувачі', path: '/admin/users', icon: <People /> },
  { name: 'Категорії', path: '/admin/categories', icon: <Category /> },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = "Адміністративна панель", subtitle = "Garden Tools" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleBackToMainSite = () => {
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const activeRoute = (path: string) => {
    return location.pathname === path;
  };

  const drawer = (
    <>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${COLORS.border}` }}>
        <Typography variant="h6" component="div" fontWeight="bold" color={COLORS.primary}>
          Garden Tools
        </Typography>
      </Box>
      <List sx={{ pt: 2 }}>
        {navigationItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{
                color: COLORS.text,
                borderRadius: '8px',
                m: 0.5,
                backgroundColor: activeRoute(item.path) ? alpha(COLORS.primary, 0.1) : 'transparent',
                '&.active': {
                  color: COLORS.primary,
                  bgcolor: alpha(COLORS.primary, 0.1),
                },
                '&:hover': {
                  bgcolor: alpha(COLORS.primary, 0.05),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: activeRoute(item.path) ? COLORS.primary : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.name} sx={{ color: activeRoute(item.path) ? COLORS.primary : COLORS.text }}/>
            </ListItemButton>
          </ListItem>
        ))}
        
        {/* Кнопка повернення на сайт */}
        <ListItem disablePadding sx={{ mt: 2 }}>
          <ListItemButton
            onClick={handleBackToMainSite}
            sx={{
              color: COLORS.primary,
              borderRadius: '8px',
              m: 0.5,
              borderTop: `1px solid ${COLORS.border}`,
              mt: 2,
              pt: 2,
              '&:hover': {
                bgcolor: alpha(COLORS.primary, 0.05),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: COLORS.primary }}>
              <ArrowBack />
            </ListItemIcon>
            <ListItemText primary="Повернутися на сайт" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: COLORS.background }}>
      {/* AppBar для мобільних пристроїв */}
      <AppBar
        position="fixed"
        sx={{
          display: { sm: 'none' },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: COLORS.bgDark,
          boxShadow: 'none',
          borderBottom: `1px solid ${COLORS.border}`
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: COLORS.primary }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap color={COLORS.primary}>
            {title}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Навігаційна панель */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Мобільна версія навігації */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Краще для продуктивності на мобільних
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: COLORS.bgDark,
              borderRight: `1px solid ${COLORS.border}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Десктопна версія навігації */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: COLORS.bgDark,
              borderRight: `1px solid ${COLORS.border}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Головний вміст */}
      <Box component="main" sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <Toolbar sx={{ display: { sm: 'none' } }} />
        <Container maxWidth="xl" sx={{ p: 4 }}>
          {/* Шапка з назвою сторінки і кнопкою повернення */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom color={COLORS.primary}>
                {title}
              </Typography>
              <Typography variant="body1" color={COLORS.textSecondary}>
                {subtitle}
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              startIcon={<HomeIcon />} 
              onClick={handleBackToMainSite}
              sx={{
                color: COLORS.primary,
                borderColor: COLORS.primary,
                '&:hover': {
                  backgroundColor: alpha(COLORS.primary, 0.1),
                  borderColor: COLORS.primary,
                },
                borderRadius: '8px'
              }}
            >
              На головну
            </Button>
          </Box>
          
          {/* Вміст сторінки */}
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout; 