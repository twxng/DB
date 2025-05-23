import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TablePagination,
  InputAdornment,
  IconButton,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  FilterList,
  CalendarToday,
  LocalShipping,
  Payment,
  Receipt,
  ClearAll,
} from '@mui/icons-material';
import orderService from '../../../api/orderService';
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

// Типи для замовлень
interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  orderId: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  orderDate: string;
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  shippingAddress: string;
  totalAmount: number;
  items: OrderItem[];
}

// Тестові дані
const mockOrders: Order[] = [
  {
    orderId: 1001,
    orderNumber: 'GT-ORD-1001',
    customerId: 1,
    customerName: 'Олександр Петренко',
    orderDate: '2025-06-15',
    orderStatus: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: 'вул. Шевченка 10, Київ, 01001',
    totalAmount: 1540,
    items: [
      { productId: 1, productName: 'Садова лопата преміум', quantity: 1, unitPrice: 850, totalPrice: 850 },
      { productId: 5, productName: 'Система крапельного поливу базова', quantity: 1, unitPrice: 690, totalPrice: 690 },
    ]
  },
  {
    orderId: 1002,
    orderNumber: 'GT-ORD-1002',
    customerId: 2,
    customerName: 'Ірина Коваленко',
    orderDate: '2025-06-14',
    orderStatus: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: 'вул. Франка 25, Львів, 79000',
    totalAmount: 3200,
    items: [
      { productId: 4, productName: 'Газонокосарка бензинова', quantity: 1, unitPrice: 3200, totalPrice: 3200 },
    ]
  },
  {
    orderId: 1003,
    orderNumber: 'GT-ORD-1003',
    customerId: 3,
    customerName: 'Василь Тимошенко',
    orderDate: '2025-06-14',
    orderStatus: 'processing',
    paymentStatus: 'paid',
    shippingAddress: 'вул. Грушевського 8, Одеса, 65000',
    totalAmount: 750,
    items: [
      { productId: 2, productName: 'Набір інструментів для саду', quantity: 1, unitPrice: 750, totalPrice: 750 },
    ]
  },
  {
    orderId: 1004,
    orderNumber: 'GT-ORD-1004',
    customerId: 4,
    customerName: 'Марія Сидоренко',
    orderDate: '2025-06-13',
    orderStatus: 'pending',
    paymentStatus: 'unpaid',
    shippingAddress: 'вул. Сагайдачного 12, Дніпро, 49000',
    totalAmount: 4900,
    items: [
      { productId: 4, productName: 'Газонокосарка бензинова', quantity: 1, unitPrice: 3200, totalPrice: 3200 },
      { productId: 3, productName: 'Тример електричний', quantity: 1, unitPrice: 1700, totalPrice: 1700 },
    ]
  },
  {
    orderId: 1005,
    orderNumber: 'GT-ORD-1005',
    customerId: 5,
    customerName: 'Денис Шевченко',
    orderDate: '2025-06-12',
    orderStatus: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: 'вул. Гагаріна 45, Харків, 61000',
    totalAmount: 2100,
    items: [
      { productId: 3, productName: 'Тример електричний', quantity: 1, unitPrice: 1700, totalPrice: 1700 },
      { productId: 6, productName: 'Органічний грунт універсальний', quantity: 2, unitPrice: 200, totalPrice: 400 },
    ]
  },
];

// Фільтри для замовлень
interface OrderFilters {
  search: string;
  orderStatus: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
}

function AdminOrders() {
  const theme = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    orderStatus: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: '',
  });
  
  // Завантаження даних
  useEffect(() => {
    loadOrders();
  }, []);
  
  const loadOrders = async () => {
    setLoading(true);
    
    // У реальному проекті тут буде запит до API
    // Для прикладу, просто використовуємо тестові дані
    setTimeout(() => {
      const filteredOrders = applyFilters(mockOrders);
      setOrders(filteredOrders);
      setLoading(false);
    }, 500);
  };
  
  // Застосування фільтрів
  const applyFilters = (ordersToFilter: Order[]) => {
    return ordersToFilter.filter(order => {
      // Фільтр за пошуком
      const searchMatch = 
        filters.search === '' || 
        order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(filters.search.toLowerCase());
      
      // Фільтр за статусом замовлення
      const orderStatusMatch = 
        filters.orderStatus === '' || 
        order.orderStatus === filters.orderStatus;
      
      // Фільтр за статусом оплати
      const paymentStatusMatch = 
        filters.paymentStatus === '' || 
        order.paymentStatus === filters.paymentStatus;
      
      // Фільтр за датою "від"
      const dateFromMatch = 
        filters.dateFrom === '' || 
        new Date(order.orderDate) >= new Date(filters.dateFrom);
      
      // Фільтр за датою "до"
      const dateToMatch = 
        filters.dateTo === '' || 
        new Date(order.orderDate) <= new Date(filters.dateTo);
      
      return searchMatch && orderStatusMatch && paymentStatusMatch && dateFromMatch && dateToMatch;
    });
  };
  
  // Обробка зміни фільтрів
  const handleFilterChange = (name: keyof OrderFilters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Скидання фільтрів
  const handleResetFilters = () => {
    setFilters({
      search: '',
      orderStatus: '',
      paymentStatus: '',
      dateFrom: '',
      dateTo: '',
    });
  };
  
  // Застосування фільтрів та оновлення даних
  const applyFiltersAndLoad = () => {
    setPage(0); // Скидаємо сторінку при застосуванні фільтрів
    loadOrders();
  };
  
  // Обробка пагінації
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Обробка перегляду деталей замовлення
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };
  
  // Функція для визначення стилю статусу замовлення
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'admin-panel-chip-success';
      case 'shipped':
        return 'admin-panel-chip-info';
      case 'processing':
        return 'admin-panel-chip';
      case 'pending':
        return 'admin-panel-chip-warning';
      case 'cancelled':
        return 'admin-panel-chip-error';
      default:
        return 'admin-panel-chip';
    }
  };
  
  // Функція для отримання тексту статусу замовлення
  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Доставлено';
      case 'shipped':
        return 'Відправлено';
      case 'processing':
        return 'Обробляється';
      case 'pending':
        return 'Очікує';
      case 'cancelled':
        return 'Скасовано';
      default:
        return status;
    }
  };
  
  // Функція для визначення стилю статусу оплати
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'admin-panel-chip-success';
      case 'unpaid':
        return 'admin-panel-chip-warning';
      case 'refunded':
        return 'admin-panel-chip-info';
      default:
        return 'admin-panel-chip';
    }
  };
  
  // Функція для отримання тексту статусу оплати
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Оплачено';
      case 'unpaid':
        return 'Не оплачено';
      case 'refunded':
        return 'Повернуто';
      default:
        return status;
    }
  };
  
  // Перевірка, чи є активні фільтри
  const hasActiveFilters = () => {
    return filters.search !== '' || 
           filters.orderStatus !== '' || 
           filters.paymentStatus !== '' ||
           filters.dateFrom !== '' ||
           filters.dateTo !== '';
  };

  return (
    <Box className="admin-panel-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" className="admin-panel-title">
          Управління замовленнями
        </Typography>
      </Box>
      
      {/* Панель пошуку та фільтрів */}
      <Card className="admin-panel-card" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Пошук за номером замовлення або іменем клієнта"
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
                  >
                    <ClearAll />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Оновити дані">
                <IconButton 
                  onClick={loadOrders}
                  className="admin-panel-icon-button"
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
            
            {filtersExpanded && (
              <>
                <Divider className="admin-panel-divider" />
                <Typography variant="subtitle1" className="admin-panel-title" sx={{ mb: 1 }}>
                  Фільтри замовлень
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth className="admin-panel-input">
                      <InputLabel>Статус замовлення</InputLabel>
                      <Select
                        value={filters.orderStatus}
                        onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
                        label="Статус замовлення"
                      >
                        <MenuItem value="">Всі статуси</MenuItem>
                        <MenuItem value="pending">Очікує</MenuItem>
                        <MenuItem value="processing">Обробляється</MenuItem>
                        <MenuItem value="shipped">Відправлено</MenuItem>
                        <MenuItem value="delivered">Доставлено</MenuItem>
                        <MenuItem value="cancelled">Скасовано</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth className="admin-panel-input">
                      <InputLabel>Статус оплати</InputLabel>
                      <Select
                        value={filters.paymentStatus}
                        onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                        label="Статус оплати"
                      >
                        <MenuItem value="">Всі статуси</MenuItem>
                        <MenuItem value="paid">Оплачено</MenuItem>
                        <MenuItem value="unpaid">Не оплачено</MenuItem>
                        <MenuItem value="refunded">Повернуто</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Дата від"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="admin-panel-input"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Дата до"
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="admin-panel-input"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={handleResetFilters}
                      startIcon={<ClearAll />}
                      className="admin-panel-button-outlined"
                      sx={{ mr: 2 }}
                    >
                      Скинути фільтри
                    </Button>
                    <Button
                      variant="contained"
                      onClick={applyFiltersAndLoad}
                      className="admin-panel-button"
                    >
                      Застосувати фільтри
                    </Button>
                  </Grid>
                </Grid>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Таблиця замовлень */}
      <Card className="admin-panel-card">
        {loading && <LinearProgress className="admin-panel-progress" />}
        
        <TableContainer>
          <Table className="admin-panel-table">
            <TableHead>
              <TableRow>
                <TableCell>Номер</TableCell>
                <TableCell>Клієнт</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Статус замовлення</TableCell>
                <TableCell>Статус оплати</TableCell>
                <TableCell align="right">Сума</TableCell>
                <TableCell align="right">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" className="admin-panel-subtitle">
                      Замовлення не знайдено
                    </Typography>
                    <Typography variant="body2" className="admin-panel-subtitle" sx={{ mt: 1 }}>
                      Спробуйте змінити параметри фільтрації
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                    <TableRow
                      key={order.orderId}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: alpha('#7fffd4', 0.05) }
                      }}
                      onClick={() => handleViewDetails(order)}
                    >
                      <TableCell>{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.orderDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={getOrderStatusText(order.orderStatus)}
                          className={getOrderStatusColor(order.orderStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getPaymentStatusText(order.paymentStatus)}
                          className={getPaymentStatusColor(order.paymentStatus)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="medium">
                          {order.totalAmount.toLocaleString('uk-UA')} ₴
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Переглянути деталі">
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(order);
                            }}
                            className="admin-panel-icon-button"
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
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
          count={orders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Замовлень на сторінці:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} з ${count}`}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '& .MuiToolbar-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiSvgIcon-root': {
              color: 'rgba(127, 255, 212, 0.7)',
            }
          }}
        />
      </Card>
      
      {/* Діалог з деталями замовлення */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
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
        {selectedOrder && (
          <>
            <DialogTitle sx={{ color: '#7fffd4' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Замовлення {selectedOrder.orderNumber}
                </Typography>
                <Chip
                  label={getOrderStatusText(selectedOrder.orderStatus)}
                  className={getOrderStatusColor(selectedOrder.orderStatus)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers className="admin-panel-dialog-content">
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" className="admin-panel-title" gutterBottom>
                    Інформація про клієнта
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">{selectedOrder.customerName}</Typography>
                    <Typography variant="body2" className="admin-panel-subtitle">
                      ID: {selectedOrder.customerId}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" className="admin-panel-title" gutterBottom>
                    Адреса доставки
                  </Typography>
                  <Typography variant="body2" className="admin-panel-subtitle">
                    {selectedOrder.shippingAddress}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" className="admin-panel-title" gutterBottom>
                    Деталі замовлення
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" className="admin-panel-subtitle">Дата замовлення:</Typography>
                    <Typography variant="body2">{selectedOrder.orderDate}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" className="admin-panel-subtitle">Статус оплати:</Typography>
                    <Chip
                      label={getPaymentStatusText(selectedOrder.paymentStatus)}
                      className={getPaymentStatusColor(selectedOrder.paymentStatus)}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" className="admin-panel-subtitle">Загальна сума:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {selectedOrder.totalAmount.toLocaleString('uk-UA')} ₴
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" className="admin-panel-title" gutterBottom>
                    Товари у замовленні
                  </Typography>
                  <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(23, 33, 25, 0.8)' }}>
                    <Table size="small" className="admin-panel-table">
                      <TableHead>
                        <TableRow>
                          <TableCell>Назва товару</TableCell>
                          <TableCell align="right">Ціна за шт.</TableCell>
                          <TableCell align="right">Кількість</TableCell>
                          <TableCell align="right">Сума</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.productId}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell align="right">{item.unitPrice.toLocaleString('uk-UA')} ₴</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{item.totalPrice.toLocaleString('uk-UA')} ₴</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Загальна сума:</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {selectedOrder.totalAmount.toLocaleString('uk-UA')} ₴
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setDetailsOpen(false)}
                className="admin-panel-button-outlined"
              >
                Закрити
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

export default AdminOrders; 