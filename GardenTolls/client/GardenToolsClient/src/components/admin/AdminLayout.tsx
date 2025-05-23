import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Inventory as InventoryIcon, 
  Category as CategoryIcon, 
  ShoppingCart as ShoppingCartIcon, 
  People as PeopleIcon, 
  Settings as SettingsIcon, 
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import authService from '../../api/authService';

const drawerWidth = 280;

interface AdminLayoutProps {
  children: ReactNode;
}

type MenuItem = {
  text: string;
  icon: JSX.Element;
  path: string;
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    authService.logout();
  };
  
  const menuItems: MenuItem[] = [
    { text: 'Дашборд', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Товари', icon: <InventoryIcon />, path: '/admin/products' },
    { text: 'Категорії', icon: <CategoryIcon />, path: '/admin/categories' },
    { text: 'Замовлення', icon: <ShoppingCartIcon />, path: '/admin/orders' },
    { text: 'Користувачі', icon: <PeopleIcon />, path: '/admin/users' },
  ];
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'primary.main',
          boxShadow: 3,
          transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          width: `calc(100% - ${open ? drawerWidth : 0}px)`,
          ml: `${open ? drawerWidth : 0}px`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Garden Tools - Адміністративна панель
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Відкрити налаштування">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar 
                  alt={user?.username || 'Admin'} 
                  src="/static/images/avatar/admin.jpg"
                  sx={{ 
                    bgcolor: 'secondary.main',
                    boxShadow: theme.shadows[3]
                  }}
                >
                  {user?.username?.[0]?.toUpperCase() || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => navigate('/admin/profile')}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Профіль</Typography>
              </MenuItem>
              <MenuItem onClick={() => navigate('/admin/settings')}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Налаштування</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <Typography textAlign="center">Вийти</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            boxShadow: 3,
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Toolbar 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 3,
            backgroundColor: 'primary.dark',
            color: 'primary.contrastText'
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Garden Tools
          </Typography>
        </Toolbar>
        <Divider />
        
        <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
          <List>
            {menuItems.map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton 
                  onClick={() => navigate(item.path)}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 48,
                      color: 'inherit'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        
        <Divider />
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © 2025 Garden Tools Admin
          </Typography>
        </Box>
      </Drawer>
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 3,
          width: `calc(100% - ${open ? drawerWidth : 0}px)`,
          minHeight: '100vh',
          backgroundColor: 'background.default',
          transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          marginLeft: 0,
          marginTop: '64px',
          overflow: 'auto'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout; 