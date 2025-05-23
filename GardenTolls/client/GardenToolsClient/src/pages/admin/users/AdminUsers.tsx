import { useState, useEffect } from 'react';
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
  TextField,
  Avatar,
  Chip,
  TablePagination,
  InputAdornment,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Tooltip,
  alpha,
  Stack,
  Divider,
} from '@mui/material';
import {
  Search,
  Add,
  Refresh,
  Delete,
  Lock,
  LockOpen,
  Mail,
  Phone,
  CalendarToday,
  FilterList,
  ClearAll,
} from '@mui/icons-material';
import userService from '../../../api/userService';
import '../products/style.css';
import type { User } from '../../../types';

interface UserFilters {
  search: string;
  role: string;
  isActive: string;
}

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [openUserForm, setOpenUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    isActive: '',
  });
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Помилка при завантаженні користувачів:', error);
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);
  
  
  const handleFilterChange = (name: keyof UserFilters, value: string) => {
    setFilters({ ...filters, [name]: value });
    setPage(0);
  };
  
  
  const handleResetFilters = () => {
    setFilters({
      search: '',
      role: '',
      isActive: '',
    });
    setPage(0);
  };

  
  const hasActiveFilters = () => {
    return filters.search !== '' || filters.role !== '' || filters.isActive !== '';
  };
  
  
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  
  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setOpenDialog(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        setLoading(true);
        await userService.deleteUser(userToDelete);
        await loadUsers();
        setOpenDialog(false);
        setUserToDelete(null);
      } catch (error) {
        console.error('Помилка при видаленні користувача:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleAddUser = () => {
    setSelectedUser(null);
    setEditMode(false);
    setOpenUserForm(true);
  };
  
  const handleToggleActive = async (userId: number) => {
    try {
      setLoading(true);
      await userService.toggleUserActive(userId);
      await loadUsers();
    } catch (error) {
      console.error('Помилка при зміні статусу користувача:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  const handleBlockUser = async (userId: number) => {
    try {
      setLoading(true);
      await userService.blockUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Помилка при блокуванні користувача:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const handleUnblockUser = async (userId: number) => {
    try {
      setLoading(true);
      await userService.unblockUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Помилка при розблокуванні користувача:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  const filteredUsers = users.filter(user => {
    const searchLower = filters.search.toLowerCase();
    
    
    if (filters.search && 
        !user.username.toLowerCase().includes(searchLower) && 
        !user.email.toLowerCase().includes(searchLower) && 
        !user.fullName.toLowerCase().includes(searchLower)) {
      return false;
    }
    
    
    if (filters.role && user.role.toLowerCase() !== filters.role.toLowerCase()) {
      return false;
    }
    
    
    if (filters.isActive === 'active' && !user.isActive) {
      return false;
    }
    if (filters.isActive === 'inactive' && user.isActive) {
      return false;
    }
    
    return true;
  });
  
  
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  
  const getRoleText = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Адміністратор';
      case 'manager':
        return 'Менеджер';
      case 'customer':
        return 'Клієнт';
      default:
        return role;
    }
  };
  
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <Box className="admin-panel-container">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddUser}
          className="admin-panel-button"
        >
          Додати користувача
        </Button>
      </Box>
      
      {/* Фільтри користувачів */}
      <Card className="admin-panel-card" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Пошук за ім'ям, логіном або email"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
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
                  onClick={loadUsers}
                  disabled={loading}
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
                  Фільтри користувачів
                </Typography>
                
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <FormControl fullWidth className="admin-panel-input">
                    <InputLabel>Роль</InputLabel>
                    <Select
                      value={filters.role}
                      onChange={(e) => handleFilterChange('role', e.target.value)}
                      label="Роль"
                    >
                      <MenuItem value="">Всі</MenuItem>
                      <MenuItem value="admin">Адміністратор</MenuItem>
                      <MenuItem value="manager">Менеджер</MenuItem>
                      <MenuItem value="customer">Клієнт</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth className="admin-panel-input">
                    <InputLabel>Статус</InputLabel>
                    <Select
                      value={filters.isActive}
                      onChange={(e) => handleFilterChange('isActive', e.target.value)}
                      label="Статус"
                    >
                      <MenuItem value="">Всі</MenuItem>
                      <MenuItem value="active">Активні</MenuItem>
                      <MenuItem value="inactive">Неактивні</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flex: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={handleResetFilters}
                      startIcon={<ClearAll />}
                      className="admin-panel-button-outlined"
                      sx={{ mr: 2 }}
                    >
                      Скинути
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setFiltersExpanded(false)}
                      className="admin-panel-button"
                    >
                      Застосувати
                    </Button>
                  </Box>
                </Stack>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
      
      {/* Таблиця користувачів */}
      <Card className="admin-panel-card">
        {loading && <LinearProgress className="admin-panel-progress" />}
        
        
        <TableContainer sx={{ 
          borderRadius: '8px',
          '& .MuiTable-root': {
            borderCollapse: 'separate',
            borderSpacing: '0 8px'
          }
        }}>
          <Table className="admin-panel-table">
            <TableHead>
              <TableRow sx={{ 
                backgroundColor: alpha('#7fffd4', 0.08),
                '& th': {
                  borderBottom: 'none',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }
              }}>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }}>Користувач</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }}>Контакти</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }}>Роль</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }}>Реєстрація</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }} align="center">Замовлення</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }} align="center">Статус</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#fff' }} align="right">Дії</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="h6" color="text.secondary">
                      Користувачі не знайдено
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Спробуйте змінити параметри фільтрації або додайте нового користувача
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map((user) => (
                  <TableRow
                    key={user.userId}
                    hover
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: alpha('#7fffd4', 0.05),
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: user.role === 'admin' 
                              ? '#f44336'
                              : '#7fffd4',
                            color: user.role === 'admin' ? '#fff' : '#172119',
                            mr: 2
                          }}
                        >
                          {getInitials(user.fullName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#fff' }}>
                            {user.fullName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Mail fontSize="small" sx={{ mr: 1, color: 'rgba(127, 255, 212, 0.7)' }} />
                          <Typography variant="body2" sx={{ color: '#fff' }}>{user.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Phone fontSize="small" sx={{ mr: 1, color: 'rgba(127, 255, 212, 0.7)' }} />
                          <Typography variant="body2" sx={{ color: '#fff' }}>{user.phone}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getRoleText(user.role)} 
                        size="small"
                        className={
                          user.role === 'admin' 
                            ? "admin-panel-chip-error" 
                            : user.role === 'manager' 
                              ? "admin-panel-chip-info" 
                              : "admin-panel-chip-success"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday fontSize="small" sx={{ mr: 1, color: 'rgba(127, 255, 212, 0.7)' }} />
                        <Typography variant="body2" sx={{ color: '#fff' }}>{user.registrationDate}</Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      {user.role === 'customer' ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                          <Chip 
                            label={`${user.orderCount} замовл.`} 
                            size="small"
                            className="admin-panel-chip-info"
                          />
                          {user.hasActiveOrders ? (
                            <Chip 
                              label="Є активні" 
                              size="small"
                              sx={{ 
                                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                                color: '#ff9800',
                                fontSize: '0.7rem',
                                height: '20px'
                              }}
                            />
                          ) : user.orderCount > 0 ? (
                            <Chip 
                              label="Завершені" 
                              size="small"
                              sx={{ 
                                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                color: '#4caf50',
                                fontSize: '0.7rem',
                                height: '20px'
                              }}
                            />
                          ) : null}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        size="small"
                        checked={user.isActive}
                        onChange={() => handleToggleActive(user.userId)}
                        className={user.isActive ? "admin-panel-switch-active" : ""}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#7fffd4',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: 'rgba(127, 255, 212, 0.5)',
                          },
                        }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Tooltip title="Видалити">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(user.userId)}
                          disabled={user.role === 'admin'}
                          sx={{
                            color: user.role === 'admin' ? 'rgba(255, 255, 255, 0.3)' : '#f44336',
                            mr: 1
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? 'Заблокувати' : 'Розблокувати'}>
                        <IconButton
                          size="small"
                          color={user.isActive ? 'warning' : 'success'}
                          onClick={() => user.isActive ? handleBlockUser(user.userId) : handleUnblockUser(user.userId)}
                          disabled={user.role === 'admin'}
                          sx={{
                            color: user.role === 'admin' 
                              ? 'rgba(255, 255, 255, 0.3)' 
                              : user.isActive 
                                ? '#ff9800' 
                                : '#4caf50'
                          }}
                        >
                          {user.isActive ? <Lock /> : <LockOpen />}
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
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Користувачів на сторінці:"
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
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
            Ви впевнені, що хочете видалити цього користувача? Ця дія не може бути скасована.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} className="admin-panel-button-outlined">
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
      
      {/* Форма додавання/редагування користувача */}
      <Dialog
        open={openUserForm}
        onClose={() => setOpenUserForm(false)}
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
          {editMode ? 'Редагувати користувача' : 'Додати нового користувача'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} paragraph>
            Функціональність додавання та редагування користувачів буде реалізована в наступних версіях.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserForm(false)} className="admin-panel-button-outlined">
            Закрити
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminUsers;