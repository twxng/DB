import { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
} from "@mui/material";
import { CheckCircle, ShoppingBag, Receipt, Home } from "@mui/icons-material";
import orderService from "../api/orderService";
import type { Order } from "../types";
import Navbar from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const OrderSuccessPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setError("Номер замовлення не вказано");
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching order receipt with ID:', id);
        const orderData = await orderService.getOrderReceipt(Number(id));
        console.log('Order receipt data received:', orderData);
        setOrder(orderData);
      } catch (error) {
        console.error("Помилка при отриманні чеку замовлення:", error);
        setError("Не вдалося завантажити інформацію про замовлення");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} грн`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 5, minHeight: "70vh" }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress sx={{ color: "#7fffd4" }} />
          </Box>
        </Container>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 5, minHeight: "70vh" }}>
          <Paper sx={{ p: 4, bgcolor: "rgba(255, 0, 0, 0.05)" }}>
            <Typography variant="h5" color="error" gutterBottom>
              {error || "Замовлення не знайдено"}
            </Typography>
            <Button
              variant="contained"
              component={RouterLink}
              to="/"
              sx={{
                mt: 2,
                bgcolor: "#172119",
                color: "#7fffd4",
                "&:hover": {
                  bgcolor: "#0f1a12",
                },
              }}
            >
              Повернутися на головну
            </Button>
          </Paper>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 5, minHeight: "70vh" }}>
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 4 },
            bgcolor: "rgba(23, 33, 25, 0.8)",
            color: "#fff",
            borderRadius: 2,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "5px",
              background: "linear-gradient(90deg, #7fffd4, #172119)",
            }}
          />

          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            mb={4}
          >
            <CheckCircle sx={{ fontSize: 60, color: "#7fffd4", mb: 2 }} />
            <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ color: "#7fffd4" }}>
              Замовлення успішно оформлено!
            </Typography>
            <Typography variant="subtitle1" align="center" sx={{ opacity: 0.9 }}>
              Дякуємо за ваше замовлення. Номер вашого замовлення: <strong>#{order.orderID}</strong>
            </Typography>
          </Box>

          <Divider sx={{ my: 3, bgcolor: "rgba(127, 255, 212, 0.2)" }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ color: "#7fffd4", mb: 1 }}>
                Інформація про замовлення
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <span>Номер замовлення:</span>
                  <strong>#{order.orderID}</strong>
                </Typography>
                <Typography variant="body2" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <span>Дата замовлення:</span>
                  <span>{formatDate(order.orderDate)}</span>
                </Typography>
                <Typography variant="body2" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <span>Статус:</span>
                  <span>{order.status}</span>
                </Typography>
                <Typography variant="body2" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <span>Спосіб оплати:</span>
                  <span>{order.paymentMethod}</span>
                </Typography>
                <Typography variant="body2" sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <span>Статус оплати:</span>
                  <span>{order.paymentStatus}</span>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ color: "#7fffd4", mb: 1 }}>
                Адреса доставки
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {order.customerName}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {order.shippingAddress}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {order.shippingCity}, {order.shippingCountry} {order.shippingPostalCode || ""}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, bgcolor: "rgba(127, 255, 212, 0.2)" }} />

          <Typography variant="subtitle1" sx={{ color: "#7fffd4", mb: 2 }}>
            Товари в замовленні
          </Typography>

          <TableContainer component={Paper} sx={{ mb: 3, bgcolor: "rgba(15, 26, 18, 0.8)" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#7fffd4" }}>Товар</TableCell>
                  <TableCell align="right" sx={{ color: "#7fffd4" }}>
                    Ціна
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#7fffd4" }}>
                    Кількість
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#7fffd4" }}>
                    Сума
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.orderDetails.map((detail) => (
                  <TableRow key={detail.orderDetailID}>
                    <TableCell component="th" scope="row" sx={{ color: "#fff" }}>
                      <Link
                        component={RouterLink}
                        to={`/products/${detail.productID}`}
                        sx={{ color: "#7fffd4", textDecoration: "none" }}
                      >
                        {detail.productName}
                      </Link>
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#fff" }}>
                      {formatCurrency(detail.unitPrice)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#fff" }}>
                      {detail.quantity}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#fff" }}>
                      {formatCurrency(detail.lineTotal)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right" sx={{ color: "#7fffd4" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      Загальна сума:
                    </Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#7fffd4" }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                      {formatCurrency(order.totalAmount)}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<Home />}
              component={RouterLink}
              to="/"
              sx={{
                mb: 2,
                color: "#7fffd4",
                borderColor: "#7fffd4",
                "&:hover": {
                  borderColor: "#7fffd4",
                  backgroundColor: "rgba(127, 255, 212, 0.1)",
                },
              }}
            >
              Повернутися на головну
            </Button>

            <Box>
              <Button
                variant="outlined"
                startIcon={<Receipt />}
                onClick={handlePrint}
                sx={{
                  mr: 2,
                  mb: 2,
                  color: "#7fffd4",
                  borderColor: "#7fffd4",
                  "&:hover": {
                    borderColor: "#7fffd4",
                    backgroundColor: "rgba(127, 255, 212, 0.1)",
                  },
                }}
              >
                Роздрукувати чек
              </Button>

              <Button
                variant="contained"
                startIcon={<ShoppingBag />}
                component={RouterLink}
                to="/my-orders"
                sx={{
                  mb: 2,
                  bgcolor: "#7fffd4",
                  color: "#172119",
                  "&:hover": {
                    bgcolor: "#66ccb3",
                  },
                }}
              >
                Мої замовлення
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default OrderSuccessPage; 