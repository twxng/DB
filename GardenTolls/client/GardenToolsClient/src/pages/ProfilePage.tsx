import { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  Avatar, 
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Tab,
  Tabs,
  List,
  ListItem
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../api/authService';
import orderService from '../api/orderService';
import type { UserProfileDto, UpdateUserProfileDto } from '../types';

// Стильові константи
const COLORS = {
  primary: '#7fffd4',
  primaryDark: '#5ecfaa',
  primaryLight: 'rgba(127, 255, 212, 0.3)',
  background: '#172119',
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
  warning: '#ff9800'
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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, color: '#fff' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface OrderSummary {
  orderID: number;
  orderDate: string;
  shippedDate: string | null;
  deliveryDate: string | null;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  numberOfItems: number;
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfileDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  
  // Форма даних користувача
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });

  // Статистика аккаунту
  const [accountStats, setAccountStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    reviewsCount: 0,
    lastLoginDate: new Date()
  });

  // Завантаження даних користувача
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Перевірка, чи користувач авторизований
        if (!authService.isAuthenticated()) {
          navigate('/login', { replace: true });
          return;
        }

        // Отримання повного профілю користувача
        const userData = await authService.getFullUserProfile();
        setUser(userData);
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          country: userData.country || '',
          postalCode: userData.postalCode || ''
        });
        
        // Отримання даних про замовлення користувача
        try {
          setOrdersLoading(true);
          const orderData = await orderService.getMyOrders();
          
          if (orderData && Array.isArray(orderData.items)) {
            // Сортуємо замовлення за датою - від найновіших до найстаріших
            const sortedOrders = [...orderData.items].sort((a, b) => 
              new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
            );
            
            setOrders(sortedOrders.map(order => ({
              orderID: order.orderID,
              orderDate: order.orderDate,
              shippedDate: order.shippedDate,
              deliveryDate: order.deliveryDate,
              status: order.status,
              paymentStatus: order.paymentStatus,
              paymentMethod: order.paymentMethod,
              totalAmount: order.totalAmount,
              numberOfItems: order.orderDetails ? order.orderDetails.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) : 0
            })));
            
            setAccountStats(prev => ({ 
              ...prev, 
              totalOrders: sortedOrders.length,
              lastLoginDate: userData.lastLoginDate ? new Date(userData.lastLoginDate) : new Date()
            }));
          } else if (orderData && !Array.isArray(orderData.items) && Array.isArray(orderData)) {
            // Обробка випадку, коли API повертає масив напряму
            const sortedOrders = [...orderData].sort((a, b) => 
              new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
            );
            
            setOrders(sortedOrders.map(order => ({
              orderID: order.orderID,
              orderDate: order.orderDate,
              shippedDate: order.shippedDate,
              deliveryDate: order.deliveryDate,
              status: order.status,
              paymentStatus: order.paymentStatus,
              paymentMethod: order.paymentMethod,
              totalAmount: order.totalAmount,
              numberOfItems: order.orderDetails ? order.orderDetails.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) : 0
            })));
            
            setAccountStats(prev => ({ 
              ...prev, 
              totalOrders: sortedOrders.length,
              lastLoginDate: userData.lastLoginDate ? new Date(userData.lastLoginDate) : new Date()
            }));
          }
        } catch (orderErr) {
          console.error('Помилка при завантаженні замовлень:', orderErr);
        } finally {
          setOrdersLoading(false);
        }
      } catch (err) {
        console.error('Помилка при завантаженні профілю:', err);
        setError('Не вдалося завантажити дані профілю. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Обробник зміни полів форми
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Переключення режиму редагування
  const toggleEditMode = () => {
    if (isEditing) {
      // Якщо скасовуємо редагування - повертаємо початкові дані
      setFormData({
        username: user?.username || '',
        email: user?.email || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        address: user?.address || '',
        city: user?.city || '',
        country: user?.country || '',
        postalCode: user?.postalCode || ''
      });
    }
    setIsEditing(!isEditing);
  };

  // Оновлення профілю
  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      
      const updateData: UpdateUserProfileDto = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        postalCode: formData.postalCode
      };
      
      // Оновлення профілю через API
      const success = await authService.updateUserProfile(updateData);
      
      if (success) {
        // Отримуємо оновлений профіль
        const updatedProfile = await authService.getFullUserProfile();
        setUser(updatedProfile);
        setSuccess('Профіль успішно оновлено');
        setIsEditing(false);
      } else {
        setError('Не вдалося оновити профіль. Спробуйте пізніше.');
      }
    } catch (err) {
      console.error('Помилка при оновленні профілю:', err);
      setError('Не вдалося оновити профіль. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  // Зміна паролю
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangePassword = async () => {
    // Валідація
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Новий пароль та підтвердження не співпадають');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Новий пароль має бути не менше 6 символів');
      return;
    }

    try {
      setLoading(true);
      
      const result = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result) {
        setSuccess('Пароль успішно змінено');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError('Не вдалося змінити пароль. Перевірте поточний пароль.');
      }
    } catch (err) {
      console.error('Помилка при зміні паролю:', err);
      setPasswordError('Сталася помилка. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Допоміжні функції для відображення статусів
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'виконано':
      case 'доставлено':
        return 'rgba(76, 175, 80, 0.2)';
      case 'в обробці':
      case 'прийнято':
        return 'rgba(255, 152, 0, 0.2)';
      case 'в дорозі':
      case 'відправлено':
        return 'rgba(33, 150, 243, 0.2)';
      case 'скасовано':
        return 'rgba(244, 67, 54, 0.2)';
      default:
        return 'rgba(158, 158, 158, 0.2)';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'виконано':
      case 'доставлено':
        return '#4caf50';
      case 'в обробці':
      case 'прийнято':
        return '#ff9800';
      case 'в дорозі':
      case 'відправлено':
        return '#2196f3';
      case 'скасовано':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'виконано':
      case 'доставлено':
        return 'rgba(76, 175, 80, 0.4)';
      case 'в обробці':
      case 'прийнято':
        return 'rgba(255, 152, 0, 0.4)';
      case 'в дорозі':
      case 'відправлено':
        return 'rgba(33, 150, 243, 0.4)';
      case 'скасовано':
        return 'rgba(244, 67, 54, 0.4)';
      default:
        return 'rgba(158, 158, 158, 0.4)';
    }
  };

  // Форматування дати
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('uk-UA', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !user) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: COLORS.primary }} size={60} />
      </Container>
    );
  }

  // Inline стилі для компонентів
  const styles = {
    pageContainer: {
      py: 5,
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: COLORS.background,
      color: COLORS.text,
    },
    headerBox: {
      mb: 4,
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-10px',
        left: '0',
        width: '100px',
        height: '3px',
        background: `linear-gradient(90deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
        borderRadius: '2px'
      }
    },
    mainTitle: {
      color: COLORS.text,
      fontWeight: 600,
    },
    subTitle: {
      color: COLORS.textSecondary,
    },
    profileCard: {
      p: 3,
      borderRadius: '12px',
      backgroundColor: 'rgba(23, 33, 25, 0.5)',
      color: COLORS.text,
      border: `1px solid ${COLORS.border}`,
      boxShadow: COLORS.shadow,
      mb: 3,
    },
    profileAvatar: {
      width: 100,
      height: 100,
      bgcolor: COLORS.primary,
      color: COLORS.textDark,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontSize: '2.5rem',
      fontWeight: 'bold',
    },
    profileBox: {
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'center', sm: 'flex-start' },
      gap: 3
    },
    profileInfo: {
      textAlign: { xs: 'center', sm: 'left' }
    },
    profileName: {
      color: COLORS.primary,
      fontWeight: 600
    },
    profileEmail: {
      mt: 0.5,
      mb: 1,
      opacity: 0.8
    },
    roleChip: {
      bgcolor: 'rgba(127, 255, 212, 0.15)',
      color: COLORS.primary,
      border: '1px solid rgba(127, 255, 212, 0.3)'
    },
    buttonBox: {
      ml: { xs: 0, sm: 'auto' },
      mt: { xs: 2, sm: 0 }
    },
    editButton: {
      borderRadius: '50px',
      textTransform: 'none',
      backgroundColor: isEditing ? 'transparent' : COLORS.primary,
      color: isEditing ? COLORS.primary : COLORS.textDark,
      borderColor: COLORS.primary,
      px: 3,
      '&:hover': {
        backgroundColor: isEditing ? 'rgba(127, 255, 212, 0.1)' : COLORS.primaryDark,
        borderColor: COLORS.primary
      }
    },
    tabsContainer: {
      borderRadius: '12px',
      backgroundColor: 'rgba(23, 33, 25, 0.5)',
      color: COLORS.text,
      overflow: 'hidden',
      boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
      border: `1px solid ${COLORS.border}`,
    },
    tabs: {
      backgroundColor: COLORS.primary,
      '& .MuiTabs-indicator': {
        backgroundColor: COLORS.background,
        height: '3px'
      },
      '& .MuiTab-root': {
        color: 'rgba(23, 33, 25, 0.9)',
        fontWeight: 500,
        textTransform: 'none',
        '&.Mui-selected': {
          color: COLORS.background,
          fontWeight: 600
        },
      }
    },
    personDataTitle: {
      fontWeight: 600,
      mb: 3,
      position: 'relative',
      display: 'inline-block',
      color: COLORS.text,
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-8px',
        left: '0',
        width: '40px',
        height: '3px',
        backgroundColor: COLORS.primary,
        borderRadius: '3px'
      }
    },
    textField: {
      mb: 2,
      '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        color: COLORS.text,
        backgroundColor: 'rgba(23, 33, 25, 0.7)',
        '& fieldset': {
          borderColor: 'rgba(127, 255, 212, 0.3)',
        },
        '&:hover fieldset': {
          borderColor: COLORS.primary,
        },
        '&.Mui-focused fieldset': {
          borderColor: COLORS.primary,
        },
      },
      '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: COLORS.primary,
      },
      '& .MuiFormHelperText-root': {
        color: 'rgba(255, 255, 255, 0.7)',
      },
      '& .MuiInputBase-input': {
        color: '#ffffff',
        '&.Mui-disabled': {
          color: 'rgba(255, 255, 255, 0.8)',
          WebkitTextFillColor: 'rgba(255, 255, 255, 0.8)',
          backgroundColor: 'rgba(127, 255, 212, 0.05)',
          borderRadius: '12px',
        }
      }
    },
    saveButton: {
      borderRadius: '50px',
      textTransform: 'none',
      px: 4,
      py: 1,
      backgroundColor: COLORS.primary,
      color: COLORS.textDark,
      fontWeight: 600,
      '&:hover': {
        backgroundColor: COLORS.primaryDark,
      },
      '&.Mui-disabled': {
        backgroundColor: COLORS.primaryLight,
      }
    },
    statsCard: {
      borderRadius: '12px',
      height: '100%',
      backgroundColor: 'rgba(23, 33, 25, 0.7)',
      color: COLORS.text,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: `1px solid ${COLORS.border}`
    },
    statIcon: {
      color: COLORS.primary,
      fontSize: 22
    },
    emptyStateBox: {
      textAlign: 'center',
      py: 4,
      color: COLORS.text
    },
    emptyStateIcon: {
      fontSize: 60,
      color: 'rgba(127, 255, 212, 0.5)',
      mb: 2
    },
    actionButton: {
      borderRadius: '50px',
      textTransform: 'none',
      backgroundColor: COLORS.primary,
      color: COLORS.textDark,
      fontWeight: 500,
      px: 3,
      '&:hover': {
        backgroundColor: COLORS.primaryDark,
      }
    },
    checkoutButton: {
      backgroundColor: COLORS.primary,
      color: COLORS.textDark,
      borderRadius: '4px',
      textTransform: 'uppercase',
      fontWeight: 600,
      py: 1.5,
      px: 4,
      '&:hover': {
        backgroundColor: COLORS.primaryDark,
      }
    },
    securityCard: {
      borderRadius: '12px',
      backgroundColor: 'rgba(23, 33, 25, 0.7)',
      color: COLORS.text,
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: `1px solid ${COLORS.border}`,
      mt: { xs: 2, md: 0 }
    },
    orderCard: {
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      border: `1px solid ${COLORS.border}`,
      backgroundColor: 'rgba(23, 33, 25, 0.7)',
      color: COLORS.text,
      mb: 2,
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
      }
    },
    orderCardContent: {
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, 
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', sm: 'center' },
      gap: 2
    },
    orderIdLabel: {
      variant: 'subtitle1', 
      fontWeight: 600,
      color: COLORS.text
    },
    orderStatus: (status: string) => ({
      backgroundColor: getStatusColor(status),
      color: getStatusTextColor(status),
      fontWeight: 500,
      border: `1px solid ${getStatusBorderColor(status)}`,
    }),
    orderPrice: {
      backgroundColor: 'rgba(127, 255, 212, 0.15)', 
      color: COLORS.primary,
      fontWeight: 500
    },
    orderDetailsBtn: {
      borderColor: COLORS.primary, 
      color: COLORS.primary,
      borderRadius: '8px',
      textTransform: 'none',
      '&:hover': {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(127, 255, 212, 0.1)'
      }
    },
    orderHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      mb: 2
    },
    orderCount: {
      backgroundColor: 'rgba(127, 255, 212, 0.15)',
      color: COLORS.primary,
      fontWeight: 600,
      padding: '4px 12px',
      borderRadius: '50px',
      border: '1px solid rgba(127, 255, 212, 0.3)',
      fontSize: '0.9rem'
    },
    orderDetailRow: {
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      justifyContent: 'space-between',
      mt: 2,
      borderTop: `1px solid ${COLORS.border}`,
      pt: 2
    },
    orderDetailColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      flex: 1
    },
    orderDetailLabel: {
      fontSize: '0.75rem',
      color: COLORS.textSecondary,
      mb: 0.5
    },
    orderDetailValue: {
      fontSize: '0.9rem',
      color: COLORS.text
    },
    fieldContainer: {
      display: 'flex',
      flexDirection: 'column',
      mb: 2,
    },
    fieldLabel: {
      fontSize: '0.8rem',
      color: COLORS.primary,
      fontWeight: 500,
      mb: 0.5,
    },
    fieldValue: {
      fontSize: '1rem',
      color: 'white',
      backgroundColor: 'rgba(23, 33, 25, 0.7)',
      padding: '10px 16px',
      borderRadius: '12px',
      border: '1px solid rgba(127, 255, 212, 0.2)',
      minHeight: '48px',
      display: 'flex',
      alignItems: 'center',
    },
    emptyValue: {
      fontStyle: 'italic',
      color: 'rgba(255, 255, 255, 0.5)',
    },
  };

  return (
    <Container maxWidth="lg" sx={styles.pageContainer}>
      {/* Заголовок сторінки з декоративним дизайном */}
      <Box sx={styles.headerBox}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={styles.mainTitle}
        >
          Мій профіль
        </Typography>
        <Typography variant="body1" sx={styles.subTitle}>
          Керуйте своїми даними та переглядайте інформацію
        </Typography>
      </Box>

      {/* Повідомлення про помилки/успіх */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%', backgroundColor: 'rgba(211, 47, 47, 0.1)', color: '#f44336' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%', backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Головний вміст сторінки */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Панель користувача з аватаром та основною інформацією */}
        <Paper elevation={0} sx={styles.profileCard}>
          <Box sx={styles.profileBox}>
            <Avatar sx={styles.profileAvatar}>
              {user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || <PersonIcon fontSize="large" />}
            </Avatar>
            <Box sx={styles.profileInfo}>
              <Typography variant="h5" sx={styles.profileName}>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.username}
              </Typography>
              <Typography variant="body2" sx={styles.profileEmail}>
                {user?.email}
              </Typography>
              <Chip 
                label={user?.role === 'Admin' ? 'Адміністратор' : 'Користувач'} 
                size="small" 
                sx={styles.roleChip} 
              />
            </Box>
            <Box sx={styles.buttonBox}>
              <Button
                variant={isEditing ? "outlined" : "contained"}
                startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
                onClick={toggleEditMode}
                sx={styles.editButton}
              >
                {isEditing ? 'Скасувати' : 'Редагувати профіль'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Інформаційні вкладки */}
        <Paper elevation={0} sx={styles.tabsContainer}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={styles.tabs}
            TabIndicatorProps={{ style: { background: COLORS.background } }}
          >
            <Tab label="Особиста інформація" />
            <Tab label="Замовлення" />
            <Tab label="Безпека" />
          </Tabs>

          {/* Вкладка з особистою інформацією */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
              {isEditing ? (
                // Режим редагування - показуємо форму
                <>
                  <TextField
                    label="Ім'я користувача"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
                    sx={styles.textField}
                  />
                  
                  <TextField
                    label="Електронна пошта"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    disabled={true}
                    sx={styles.textField}
                  />
                  
                  <TextField
                    label="Ім'я"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
                    sx={styles.textField}
                  />
                  
                  <TextField
                    label="Прізвище"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
                    sx={styles.textField}
                  />
                  
                  <TextField
                    label="Телефон"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
                    sx={styles.textField}
                  />
                  
                  <TextField
                    label="Адреса"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
                    sx={styles.textField}
                  />
                  
                  <TextField
                    label="Місто"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
                    sx={styles.textField}
                  />
                  
                  <TextField
                    label="Країна"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
                    sx={styles.textField}
                  />
                  
                  <TextField
                    label="Поштовий індекс"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    disabled={!isEditing}
                    sx={styles.textField}
                  />
                </>
              ) : (
                // Режим перегляду - показуємо стилізовані поля
                <>
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Ім'я користувача</Typography>
                    <Box sx={styles.fieldValue}>{formData.username || <Typography sx={styles.emptyValue}>Не вказано</Typography>}</Box>
                  </Box>
                  
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Електронна пошта</Typography>
                    <Box sx={styles.fieldValue}>{formData.email || <Typography sx={styles.emptyValue}>Не вказано</Typography>}</Box>
                  </Box>
                  
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Ім'я</Typography>
                    <Box sx={styles.fieldValue}>{formData.firstName || <Typography sx={styles.emptyValue}>Не вказано</Typography>}</Box>
                  </Box>
                  
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Прізвище</Typography>
                    <Box sx={styles.fieldValue}>{formData.lastName || <Typography sx={styles.emptyValue}>Не вказано</Typography>}</Box>
                  </Box>
                  
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Телефон</Typography>
                    <Box sx={styles.fieldValue}>{formData.phone || <Typography sx={styles.emptyValue}>Не вказано</Typography>}</Box>
                  </Box>
                  
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Адреса</Typography>
                    <Box sx={styles.fieldValue}>{formData.address || <Typography sx={styles.emptyValue}>Не вказано</Typography>}</Box>
                  </Box>
                  
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Місто</Typography>
                    <Box sx={styles.fieldValue}>{formData.city || <Typography sx={styles.emptyValue}>Не вказано</Typography>}</Box>
                  </Box>
                  
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Країна</Typography>
                    <Box sx={styles.fieldValue}>{formData.country || <Typography sx={styles.emptyValue}>Не вказано</Typography>}</Box>
                  </Box>
                  
                  <Box sx={styles.fieldContainer}>
                    <Typography sx={styles.fieldLabel}>Поштовий індекс</Typography>
                    <Box sx={styles.fieldValue}>{formData.postalCode || <Typography sx={styles.emptyValue}>Не вказано</Typography>}</Box>
                  </Box>
                </>
              )}

              {isEditing && (
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / span 2' }, display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    sx={styles.saveButton}
                  >
                    Зберегти зміни
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Вкладка з замовленнями */}
          <TabPanel value={activeTab} index={1}>
            <Box>
              <Box sx={styles.orderHeader}>
                <Typography variant="h6" sx={styles.personDataTitle}>
                  Історія замовлень
                </Typography>
                <Box sx={styles.orderCount}>
                  Всього замовлень: {accountStats.totalOrders}
                </Box>
              </Box>
              
              {ordersLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: COLORS.primary }} />
                </Box>
              ) : accountStats.totalOrders > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {/* Відображення списку замовлень */}
                  {orders.map((order) => (
                    <Card key={order.orderID} sx={styles.orderCard}>
                      <CardContent>
                        <Box sx={styles.orderCardContent}>
                          <Box>
                            <Typography sx={styles.orderIdLabel}>
                              Замовлення #{order.orderID}
                            </Typography>
                            <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                              {formatDate(order.orderDate)} • {order.numberOfItems} {order.numberOfItems === 1 ? 'товар' : order.numberOfItems < 5 ? 'товари' : 'товарів'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Chip 
                              label={`${order.totalAmount.toFixed(0)} грн`} 
                              sx={styles.orderPrice} 
                            />
                            <Chip 
                              label={order.status} 
                              sx={styles.orderStatus(order.status)} 
                            />
                            <Button 
                              variant="outlined" 
                              size="small" 
                              sx={styles.orderDetailsBtn}
                              onClick={() => navigate(`/orders/${order.orderID}`)}
                            >
                              Деталі
                            </Button>
                          </Box>
                        </Box>
                        
                        {/* Додаткові деталі замовлення */}
                        <Box sx={styles.orderDetailRow}>
                          <Box sx={styles.orderDetailColumn}>
                            <Typography sx={styles.orderDetailLabel}>
                              Спосіб оплати
                            </Typography>
                            <Typography sx={styles.orderDetailValue}>
                              {order.paymentMethod || 'Не вказано'}
                            </Typography>
                          </Box>
                          <Box sx={styles.orderDetailColumn}>
                            <Typography sx={styles.orderDetailLabel}>
                              Статус оплати
                            </Typography>
                            <Typography sx={styles.orderDetailValue}>
                              {order.paymentStatus || 'Не вказано'}
                            </Typography>
                          </Box>
                          <Box sx={styles.orderDetailColumn}>
                            <Typography sx={styles.orderDetailLabel}>
                              Дата відправлення
                            </Typography>
                            <Typography sx={styles.orderDetailValue}>
                              {formatDate(order.shippedDate)}
                            </Typography>
                          </Box>
                          <Box sx={styles.orderDetailColumn}>
                            <Typography sx={styles.orderDetailLabel}>
                              Дата доставки
                            </Typography>
                            <Typography sx={styles.orderDetailValue}>
                              {formatDate(order.deliveryDate)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Box sx={styles.emptyStateBox}>
                  <LocalShippingIcon sx={styles.emptyStateIcon} />
                  <Typography variant="h6" gutterBottom>
                    У вас поки немає замовлень
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 3 }}>
                    Переглядайте товари та оформлюйте перше замовлення
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/products')}
                    sx={styles.actionButton}
                  >
                    Перейти до каталогу
                  </Button>
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Вкладка з безпекою */}
          <TabPanel value={activeTab} index={2}>
            <Box>
              <Typography variant="h6" sx={styles.personDataTitle}>
                Зміна паролю
              </Typography>
              
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
                  {passwordError}
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mt: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    label="Поточний пароль"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    sx={styles.textField}
                  />
                  <TextField
                    label="Новий пароль"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    sx={styles.textField}
                  />
                  <TextField
                    label="Підтвердження паролю"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    sx={styles.textField}
                  />
                  
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleChangePassword}
                      disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                      sx={styles.saveButton}
                    >
                      {loading ? <CircularProgress size={24} sx={{ color: COLORS.textDark }} /> : 'Змінити пароль'}
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Card elevation={0} sx={styles.securityCard}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Вимоги до пароля:
                      </Typography>
                      <List sx={{ listStyleType: 'disc', pl: 2 }}>
                        <ListItem sx={{ display: 'list-item', p: 0.5 }}>
                          <Typography variant="body2">
                            Не менше 6 символів
                          </Typography>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', p: 0.5 }}>
                          <Typography variant="body2">
                            Рекомендується використання літер різного регістру
                          </Typography>
                        </ListItem>
                        <ListItem sx={{ display: 'list-item', p: 0.5 }}>
                          <Typography variant="body2">
                            Бажано додати цифри та спеціальні символи
                          </Typography>
                        </ListItem>
                      </List>
                      <Typography variant="subtitle2" color="error" mt={2}>
                        Ніколи не повідомляйте свій пароль іншим користувачам
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfilePage; 