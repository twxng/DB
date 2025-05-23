import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
} from "@mui/material";
import { ExpandMore, ShoppingBag, Receipt } from "@mui/icons-material";
import { Link } from "react-router-dom";
import orderService from "../api/orderService";
import type { OrderFilterDto } from "../api/orderService";
import type { Order, OrderDetail, PagedResult } from "../types";
import Navbar from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "./styles/OrderReceipt.css";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagedResult, setPagedResult] = useState<PagedResult<Order> | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<OrderFilterDto>({
    pageNumber: 1,
    pageSize: 10,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const theme = useTheme();
  const _isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await orderService.getMyOrders(filter);
      setOrders(result.items || []);
      setPagedResult(result);
      setError(null);
    } catch (error) {
      console.error("Помилка при завантаженні замовлень:", error);
      setError(
        "Не вдалося завантажити ваші замовлення. Будь ласка, спробуйте пізніше."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    setFilter({
      ...filter,
      pageNumber: value,
    });
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFilter({
        ...filter,
        [name]: value,
        pageNumber: 1, // Скидаємо сторінку при зміні фільтра
      });
    }
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "в обробці":
      case "processing":
        return "info";
      case "відправлено":
      case "shipped":
        return "secondary";
      case "доставлено":
      case "delivered":
        return "success";
      case "скасовано":
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleShowReceipt = async (order: Order) => {
    try {
      // Отримуємо детальну інформацію через публічний endpoint
      const receiptData = await orderService.getOrderReceipt(order.orderID);
      setSelectedOrder(receiptData);
      setReceiptOpen(true);
    } catch (error) {
      console.error("Помилка при отриманні чеку замовлення:", error);
      // Якщо не вдалося отримати детальні дані, використовуємо наявні дані замовлення
      setSelectedOrder(order);
      setReceiptOpen(true);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} грн`;
  };

  if (loading && orders.length === 0) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 5, minHeight: "70vh" }}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh"
          >
            <CircularProgress sx={{ color: "#7fffd4" }} />
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 5, minHeight: "70vh" }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            color: "#7fffd4",
            borderBottom: "2px solid #7fffd4",
            paddingBottom: 1,
            marginBottom: 3,
            display: "flex",
            alignItems: "center",
            position: "relative",
            "&:after": {
              content: '""',
              position: "absolute",
              bottom: -2,
              left: 0,
              width: "35%",
              height: "2px",
              background: "linear-gradient(90deg, #7fffd4, transparent)",
            },
          }}
        >
          <ShoppingBag sx={{ mr: 2 }} />
          Мої замовлення
        </Typography>
        {error && (
          <Paper sx={{ p: 3, mt: 3, bgcolor: "rgba(255, 0, 0, 0.1)" }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}
        <Paper
          sx={{ p: { xs: 1, md: 3 }, mt: 3, bgcolor: "rgba(23, 33, 25, 0.6)" }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#fff" }}>
            Фільтри
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl
                fullWidth
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              >
                <InputLabel
                  id="status-label"
                  sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Статус замовлення
                </InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  value={filter.status || ""}
                  onChange={handleFilterChange}
                  label="Статус замовлення"
                  name="status"
                  sx={{
                    color: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(127, 255, 212, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7fffd4",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7fffd4",
                    },
                    "& .MuiSelect-icon": {
                      color: "rgba(127, 255, 212, 0.7)",
                    },
                  }}
                >
                  <MenuItem value="">Всі статуси</MenuItem>
                  <MenuItem value="processing">В обробці</MenuItem>
                  <MenuItem value="shipped">Відправлено</MenuItem>
                  <MenuItem value="delivered">Доставлено</MenuItem>
                  <MenuItem value="cancelled">Скасовано</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl
                fullWidth
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              >
                <InputLabel
                  id="payment-status-label"
                  sx={{ color: "rgba(255, 255, 255, 0.8)" }}
                >
                  Статус оплати
                </InputLabel>
                <Select
                  labelId="payment-status-label"
                  id="paymentStatus"
                  value={filter.paymentStatus || ""}
                  onChange={handleFilterChange}
                  label="Статус оплати"
                  name="paymentStatus"
                  sx={{
                    color: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(127, 255, 212, 0.3)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7fffd4",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#7fffd4",
                    },
                    "& .MuiSelect-icon": {
                      color: "rgba(127, 255, 212, 0.7)",
                    },
                  }}
                >
                  <MenuItem value="">Всі</MenuItem>
                  <MenuItem value="pending">Очікується</MenuItem>
                  <MenuItem value="paid">Оплачено</MenuItem>
                  <MenuItem value="refunded">Повернуто</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                id="startDate"
                name="startDate"
                label="Дата від"
                type="date"
                value={filter.startDate || ""}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                  style: { color: "rgba(255, 255, 255, 0.8)" },
                }}
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    "& fieldset": {
                      borderColor: "rgba(127, 255, 212, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#7fffd4",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7fffd4",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "rgba(127, 255, 212, 0.7)",
                  },
                  "& .MuiInputBase-input": {
                    color: "#fff",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                id="endDate"
                name="endDate"
                label="Дата до"
                type="date"
                value={filter.endDate || ""}
                onChange={handleFilterChange}
                InputLabelProps={{
                  shrink: true,
                  style: { color: "rgba(255, 255, 255, 0.8)" },
                }}
                size="small"
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    color: "#fff",
                    "& fieldset": {
                      borderColor: "rgba(127, 255, 212, 0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#7fffd4",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7fffd4",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.8)",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "rgba(127, 255, 212, 0.7)",
                  },
                  "& .MuiInputBase-input": {
                    color: "#fff",
                  },
                }}
              />
            </Grid>
          </Grid>
        </Paper>
        {orders.length === 0 && !loading ? (
          <Paper sx={{ p: 3, mt: 3, bgcolor: "rgba(23, 33, 25, 0.6)" }}>
            <Typography sx={{ color: "#fff", textAlign: "center", py: 5 }}>
              У вас поки що немає замовлень.
              <Link
                to="/"
                style={{
                  color: "#7fffd4",
                  textDecoration: "none",
                  marginLeft: 8,
                }}
              >
                Перейти до магазину
              </Link>
            </Typography>
          </Paper>
        ) : (
          <>
            {orders.map((order) => (
              <Accordion
                key={order.orderID}
                sx={{
                  mt: 2,
                  bgcolor: "rgba(23, 33, 25, 0.8)",
                  color: "#fff",
                  border: "1px solid rgba(127, 255, 212, 0.2)",
                  "&:before": {
                    display: "none",
                  },
                  "& .MuiAccordionSummary-expandIconWrapper": {
                    color: "#7fffd4",
                  },
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                    borderColor: "rgba(127, 255, 212, 0.4)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: "#7fffd4" }} />}
                  sx={{ borderBottom: "1px solid rgba(127, 255, 212, 0.2)" }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", color: "#7fffd4" }}
                      >
                        Замовлення #{order.orderID}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.9, color: "rgba(255, 255, 255, 0.9)" }}
                      >
                        {formatDate(order.orderDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{
                          mb: 1,
                          fontWeight: "500",
                          padding: "4px",
                          "& .MuiChip-label": {
                            px: 1,
                          },
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                      >
                        {formatCurrency(order.totalAmount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: "bold", color: "#7fffd4" }}
                      >
                        Оплата:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                      >
                        {order.paymentMethod} ({order.paymentStatus})
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={3}
                      sx={{ textAlign: { xs: "left", md: "right" } }}
                    >
                      <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                        Натисніть, щоб побачити деталі
                      </Typography>
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  p: 2, 
                  borderBottom: "1px solid rgba(127, 255, 212, 0.2)"
                }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Receipt />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowReceipt(order);
                    }}
                    sx={{
                      mr: 1,
                      mb: { xs: 1, md: 0 },
                      color: "#7fffd4",
                      borderColor: "#7fffd4",
                      "&:hover": {
                        borderColor: "#7fffd4",
                        backgroundColor: "rgba(127, 255, 212, 0.1)",
                        transform: "translateY(-2px)",
                        transition: "transform 0.2s ease-in-out",
                      },
                    }}
                  >
                    Чек
                  </Button>
                  {/* Показуємо кнопку "Скасувати" тільки для замовлень, які можна скасувати */}
                  {order.status.toLowerCase() !== "delivered" &&
                   order.status.toLowerCase() !== "доставлено" &&
                   order.status.toLowerCase() !== "cancelled" &&
                   order.status.toLowerCase() !== "скасовано" ? (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Ви впевнені, що хочете скасувати це замовлення?"
                          )
                        ) {
                          orderService
                            .cancelOrder(order.orderID)
                            .then(() => {
                              fetchOrders();
                              alert("Замовлення успішно скасовано");
                            })
                            .catch((error) => {
                              alert(`Помилка: ${error.message}`);
                            });
                        }
                      }}
                      sx={{
                        mb: { xs: 1, md: 0 },
                        "&:hover": {
                          backgroundColor: "rgba(255, 0, 0, 0.1)",
                          transform: "translateY(-2px)",
                          transition: "transform 0.2s ease-in-out",
                        },
                      }}
                    >
                      Скасувати
                    </Button>
                  ) : null}
                </Box>
                <AccordionDetails>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: "#7fffd4",
                      mt: 2,
                      mb: 3,
                      fontWeight: "bold",
                      borderBottom: "1px solid rgba(127, 255, 212, 0.3)",
                      pb: 1,
                      display: "flex",
                      alignItems: "center",
                      "& svg": {
                        mr: 1,
                      },
                    }}
                  >
                    <Receipt /> Деталі замовлення
                  </Typography>

                  <TableContainer
                    component={Paper}
                    sx={{ bgcolor: "rgba(15, 26, 18, 0.8)" }}
                  >
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{ color: "#7fffd4", fontWeight: "bold" }}
                          >
                            Товар
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: "#7fffd4", fontWeight: "bold" }}
                          >
                            Ціна
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: "#7fffd4", fontWeight: "bold" }}
                          >
                            Кількість
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: "#7fffd4", fontWeight: "bold" }}
                          >
                            Сума
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.orderDetails.map((detail: OrderDetail) => (
                          <TableRow key={detail.orderDetailID}>
                            <TableCell
                              component="th"
                              scope="row"
                              sx={{ color: "rgba(255, 255, 255, 0.95)" }}
                            >
                              <Box display="flex" alignItems="center">
                                {detail.imageBase64 && (
                                  <img
                                    src={`data:image/jpeg;base64,${detail.imageBase64}`}
                                    alt={detail.productName}
                                    style={{
                                      width: 40,
                                      height: 40,
                                      marginRight: 10,
                                      objectFit: "cover",
                                    }}
                                  />
                                )}
                                <Link
                                  to={`/products/${detail.productID}`}
                                  style={{
                                    color: "#7fffd4",
                                    textDecoration: "none",
                                  }}
                                >
                                  {detail.productName}
                                </Link>
                              </Box>
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: "rgba(255, 255, 255, 0.95)" }}
                            >
                              {formatCurrency(detail.unitPrice)}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: "rgba(255, 255, 255, 0.95)" }}
                            >
                              {detail.quantity}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{ color: "rgba(255, 255, 255, 0.95)" }}
                            >
                              {formatCurrency(detail.lineTotal)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            align="right"
                            sx={{ color: "#7fffd4", fontWeight: "bold" }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: "bold" }}
                            >
                              Загальна сума:
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: "#7fffd4", fontWeight: "bold" }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: "bold" }}
                            >
                              {formatCurrency(order.totalAmount)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#7fffd4", mb: 1, fontWeight: "bold" }}
                    >
                      Адреса доставки:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "rgba(255, 255, 255, 0.95)" }}
                    >
                      {order.shippingAddress}, {order.shippingCity},{" "}
                      {order.shippingCountry}
                      {order.shippingPostalCode
                        ? `, ${order.shippingPostalCode}`
                        : ""}
                    </Typography>
                  </Box>

                  {order.notes && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#7fffd4", mb: 1, fontWeight: "bold" }}
                      >
                        Примітки:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255, 255, 255, 0.95)" }}
                      >
                        {order.notes}
                      </Typography>
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}

            {pagedResult && pagedResult.totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={pagedResult.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: "#fff",
                    },
                    "& .MuiPaginationItem-page.Mui-selected": {
                      backgroundColor: "#7fffd4",
                      color: "#172119",
                      fontWeight: "bold",
                    },
                    "& .MuiPaginationItem-page:hover": {
                      backgroundColor: "rgba(127, 255, 212, 0.2)",
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
        {/* Діалог з чеком замовлення */}{" "}
        <Dialog
          open={receiptOpen}
          onClose={() => setReceiptOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ className: "receipt-dialog" }}
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 500 }}
        >
          {" "}
          <DialogTitle className="receipt-header">
            {" "}
            <Box display="flex" alignItems="center">
              {" "}
              <Receipt className="receipt-header-icon" /> Чек замовлення #
              {selectedOrder?.orderID}{" "}
            </Box>{" "}
          </DialogTitle>{" "}
          <DialogContent className="receipt-content">
            {" "}
            {selectedOrder && (
              <>
                {" "}
                <Typography
                  variant="h6"
                  align="center"
                  gutterBottom
                  className="receipt-title"
                >
                  {" "}
                  Чек замовлення{" "}
                </Typography>{" "}
                <Typography
                  variant="body2"
                  align="center"
                  gutterBottom
                  className="receipt-shop-name"
                >
                  {" "}
                  Garden Tools Shop{" "}
                </Typography>{" "}
                <Typography
                  variant="body2"
                  align="center"
                  gutterBottom
                  className="receipt-tax-id"
                >
                  {" "}
                  ІПН: 123456789{" "}
                </Typography>{" "}
                <hr className="receipt-divider" />{" "}
                <div className="receipt-info-grid">
                  {" "}
                  <div>
                    {" "}
                    <Typography variant="body2" className="receipt-label">
                      {" "}
                      № замовлення:{" "}
                      <span className="receipt-value">
                        {selectedOrder.orderID}
                      </span>{" "}
                    </Typography>{" "}
                  </div>{" "}
                  <div className="receipt-info-right">
                    {" "}
                    <Typography variant="body2" className="receipt-label">
                      {" "}
                      Дата:{" "}
                      <span className="receipt-value">
                        {formatDate(selectedOrder.orderDate)}
                      </span>{" "}
                    </Typography>{" "}
                  </div>{" "}
                </div>{" "}
                <hr className="receipt-divider" />{" "}
                <div className="receipt-customer-info">
                  {" "}
                  <Typography
                    variant="body2"
                    gutterBottom
                    className="receipt-label"
                  >
                    {" "}
                    Клієнт:{" "}
                    <span className="receipt-value">
                      {selectedOrder.customerName}
                    </span>{" "}
                  </Typography>{" "}
                  <Typography
                    variant="body2"
                    gutterBottom
                    className="receipt-label"
                  >
                    {" "}
                    Адреса доставки:{" "}
                    <span className="receipt-value">
                      {selectedOrder.shippingAddress},{" "}
                      {selectedOrder.shippingCity},{" "}
                      {selectedOrder.shippingCountry}
                    </span>{" "}
                  </Typography>{" "}
                </div>{" "}
                <hr className="receipt-divider" />{" "}
                <div className="receipt-table-container">
                  {" "}
                  <table className="receipt-table">
                    {" "}
                    <thead className="receipt-table-head">
                      {" "}
                      <tr>
                        {" "}
                        <th className="receipt-table-header-cell">
                          Товар
                        </th>{" "}
                        <th className="receipt-table-header-cell receipt-table-header-cell-center">
                          К-сть
                        </th>{" "}
                        <th className="receipt-table-header-cell receipt-table-header-cell-right">
                          Ціна
                        </th>{" "}
                        <th className="receipt-table-header-cell receipt-table-header-cell-right">
                          Сума
                        </th>{" "}
                      </tr>{" "}
                    </thead>{" "}
                    <tbody>
                      {" "}
                      {selectedOrder.orderDetails.map((detail) => (
                        <tr
                          key={detail.orderDetailID}
                          className="receipt-table-row"
                        >
                          {" "}
                          <td className="receipt-table-cell">
                            {detail.productName}
                          </td>{" "}
                          <td className="receipt-table-cell receipt-table-cell-center">
                            {detail.quantity}
                          </td>{" "}
                          <td className="receipt-table-cell receipt-table-cell-right">
                            {formatCurrency(detail.unitPrice)}
                          </td>{" "}
                          <td className="receipt-table-cell receipt-table-cell-right">
                            {formatCurrency(detail.lineTotal)}
                          </td>{" "}
                        </tr>
                      ))}{" "}
                      <tr className="receipt-total-row">
                        {" "}
                        <td colSpan={3} className="receipt-total-label">
                          {" "}
                          Загальна сума:{" "}
                        </td>{" "}
                        <td className="receipt-total-value">
                          {" "}
                          {formatCurrency(selectedOrder.totalAmount)}{" "}
                        </td>{" "}
                      </tr>{" "}
                    </tbody>{" "}
                  </table>{" "}
                </div>{" "}
                <hr className="receipt-divider" />{" "}
                <div className="receipt-payment-info">
                  {" "}
                  <Typography
                    variant="body2"
                    gutterBottom
                    className="receipt-label"
                  >
                    {" "}
                    Спосіб оплати:{" "}
                    <span className="receipt-value">
                      {selectedOrder.paymentMethod}
                    </span>{" "}
                  </Typography>{" "}
                  <Typography
                    variant="body2"
                    gutterBottom
                    className="receipt-label"
                  >
                    {" "}
                    Статус оплати:{" "}
                    <span className="receipt-value">
                      {selectedOrder.paymentStatus}
                    </span>{" "}
                  </Typography>{" "}
                </div>{" "}
                <hr className="receipt-divider" />{" "}
                <Typography
                  variant="body2"
                  align="center"
                  className="receipt-thank-you"
                >
                  {" "}
                  Дякуємо за покупку!{" "}
                </Typography>{" "}
              </>
            )}{" "}
          </DialogContent>{" "}
          <DialogActions className="receipt-footer">
            {" "}
            <button
              className="receipt-close-button"
              onClick={() => setReceiptOpen(false)}
            >
              {" "}
              Закрити{" "}
            </button>{" "}
            <button
              className="receipt-print-button"
              onClick={() => {
                window.print();
              }}
            >
              {" "}
              Роздрукувати{" "}
            </button>{" "}
          </DialogActions>{" "}
        </Dialog>
      </Container>
      <Footer />
    </>
  );
};

export default MyOrdersPage;
