import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  InputBase,
  alpha,
  styled,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountCircle,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  KeyboardArrowDown,
} from "@mui/icons-material";

import authService from "../../api/authService";
import cartService from "../../api/cartService";
import logo from "../../assets/logo.png";
import "./styles/Header.css";
import CategoryMenu from "./CategoryMenu";
import { useCategoryMenuContext } from "../../contexts/CategoryMenuContext";

// Стилізований компонент для пошуку
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

const pages = [
  { title: "Каталог", path: "/categories" },
  { title: "Акції", path: "/promotions" },
  { title: "Контакти", path: "/contacts" },
];

const Header = () => {
  const navigate = useNavigate();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Використовуємо контекст для стану меню категорій
  const { isCategoryMenuOpen, toggleCategoryMenu, closeCategoryMenu } =
    useCategoryMenuContext();

  const cart = cartService.getCart();
  const currentUser = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();

  // Обробники для меню навігації
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  // Обробники для меню користувача
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Пошук
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Вихід
  const handleLogout = () => {
    authService.logout();
    handleCloseUserMenu();
  };

  // Обробник для меню категорій
  const handleToggleCategoriesMenu = () => {
    toggleCategoryMenu();
  };

  return (
    <AppBar
      position="sticky"
      color="primary"
      elevation={0}
      sx={{
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        backdropFilter: "blur(0px)",
        backgroundColor: "rgba(82, 173, 96, 0)", // Напівпрозорий зелений
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 1 }}>
          {/* Логотип для десктопу */}
          <Box sx={{ display: { xs: "none", md: "flex" }, mr: 2 }}>
            <RouterLink to="/">
              {/* <img src={logo} alt="Garden Tools" style={{ height: 45 }} /> */}
            </RouterLink>
          </Box>

          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 3,
              display: { xs: "none", md: "flex" },
              fontWeight: 600,
              color: "inherit",
              textDecoration: "none",
              letterSpacing: ".5px",
            }}
          >
            Garden Tools
          </Typography>

          {/* Меню для мобільних */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{
                borderRadius: "12px",
                "&:hover": {
									 backgroundColor: "rgba(255, 255, 255, 0.15)",
									 color: "rgb(171, 168, 161)",
									},
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
                "& .MuiPaper-root": {
                  borderRadius: "12px",
									color: "white",
                  backdropFilter: "blur(15px) !important",
                  WebkitBackdropFilter: "blur(15px) !important",
                  backgroundColor: "rgba(255, 255, 255, 0.11)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 8px 24px rgba(36, 36, 36, 0.26)",
                  mt: 1.5,
                },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.title} onClick={handleCloseNavMenu}>
                  <Typography
                    textAlign="center"
                    component={RouterLink}
                    to={page.path}
                    sx={{
                      textDecoration: "none",
                      color: "inherit",
                      fontWeight: 900,
                      py: 0.5,
                    }}
                  >
                    {page.title}
                  </Typography>
                </MenuItem>
              ))}

              {isAdmin && (
                <MenuItem
                  onClick={() => {
                    navigate("/admin");
                    handleCloseNavMenu();
                  }}
                >
                  <Typography textAlign="center" fontWeight={500}>
                    Адмін панель
                  </Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>

          {/* Логотип для мобільних */}
          <Box sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}>
            <RouterLink to="/">
              {/* <img src={logo} alt="Garden Tools" style={{ height: 38 }} /> */}
            </RouterLink>
          </Box>

          <Typography
            variant="h5"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontWeight: 600,
              color: "inherit",
              textDecoration: "none",
              letterSpacing: ".5px",
							"&:hover::after": {
                    color: "red",
                  },
            }}
          >
            Garden Tools
          </Typography>

          {/* Меню для десктопу */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {/* Кнопка Каталог з випадаючим меню */}
            <Box sx={{ position: "relative" }}>
              <Button
                onClick={handleToggleCategoriesMenu}
                endIcon={<KeyboardArrowDown />}
                sx={{
                  mx: 0.5,
                  my: 2,
                  color: "white",
                  position: "relative",
                  "&::after": {
                    content: '""',
                  },
                  "&:hover::after": {
                    width: "60%",
                  },
                }}
              >
                Каталог
              </Button>

              {/* Компонент меню категорій */}
              <CategoryMenu
                isOpen={isCategoryMenuOpen}
                onClose={closeCategoryMenu}
              />
            </Box>

            {/* Інші пункти меню */}
            {pages.slice(1).map((page) => (
              <Button
                key={page.title}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{
                  mx: 0.5,
                  my: 2,
                  color: "white",
                  display: "block",
                  fontWeight: 500,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 6,
                    left: "50%",
                    width: 0,
                    height: 2,
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                    transform: "translateX(-50%)",
                  },
                  "&:hover::after": {
                    width: "60%",
                  },
                }}
              >
                {page.title}
              </Button>
            ))}

            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                sx={{
                  mx: 0.5,
                  my: 2,
                  color: "white",
                  display: "block",
                  fontWeight: 500,
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 6,
                    left: "50%",
                    width: 0,
                    height: 2,
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                    transform: "translateX(-50%)",
                  },
                  "&:hover::after": {
                    width: "60%",
                  },
                }}
              >
                Адмін панель
              </Button>
            )}
          </Box>

          {/* Пошук */}
          <Search
            sx={{
              borderRadius: "10px",
              transition: "all 0.3s ease",
              "&:hover": { boxShadow: "0 3px 8px rgba(0,0,0,0.1)" },
            }}
          >
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <form onSubmit={handleSearch}>
              <StyledInputBase
                placeholder="Пошук..."
                inputProps={{ "aria-label": "search" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
          </Search>

          {/* Кошик */}
          <Box sx={{ display: "flex" }}>
            <IconButton
              component={RouterLink}
              to="/cart"
              size="large"
              aria-label="show cart items"
              color="inherit"
              sx={{
                borderRadius: "12px",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Badge
                badgeContent={cart.totalItems}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    fontWeight: "bold",
                    minWidth: "18px",
                    height: "18px",
                  },
                }}
              >
                <ShoppingCartIcon />
              </Badge>
            </IconButton>

            {/* Профіль користувача */}
            {currentUser ? (
              <Box sx={{ flexGrow: 0, ml: 1 }}>
                <Tooltip title="Відкрити налаштування">
                  <IconButton
                    onClick={handleOpenUserMenu}
                    sx={{
                      p: 0.5,
                      ml: 1,
                      border: "2px solid rgba(255, 255, 255, 0.6)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        border: "2px solid rgba(255, 255, 255, 1)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Avatar
                      alt={
                        currentUser?.firstName ||
                        currentUser?.username ||
                        "Користувач"
                      }
                      sx={{ width: 32, height: 32 }}
                    >
                      {currentUser?.firstName?.[0] ||
                        currentUser?.username?.[0] ||
                        "К"}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{
                    mt: "45px",
                    "& .MuiPaper-root": {
                      borderRadius: "12px",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                      overflow: "hidden",
                    },
                  }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem
                    onClick={() => {
                      navigate("/profile");
                      handleCloseUserMenu();
                    }}
                  >
                    <AccountCircle sx={{ mr: 1, color: "primary.main" }} /> Мій
                    профіль
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate("/my-orders");
                      handleCloseUserMenu();
                    }}
                  >
                    <NotificationsIcon sx={{ mr: 1, color: "primary.main" }} />{" "}
                    Мої замовлення
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1, color: "error.main" }} /> Вийти
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
                startIcon={<PersonIcon />}
                variant="outlined"
                sx={{
                  ml: 1.5,
                  borderColor: "rgba(255,255,255,0.6)",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderRadius: "10px",
                  fontWeight: 500,
                  px: 2,
                  "&:hover": {
                    borderColor: "white",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Увійти
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
