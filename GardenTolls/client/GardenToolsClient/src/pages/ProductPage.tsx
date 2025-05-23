import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  Rating,
  Paper,
  TextField,
  Stack,
  Avatar,
  Fade,
  Tabs,
  Tab,
} from "@mui/material";
import { Verified, Reply, ShoppingCart, Check } from "@mui/icons-material";
import productService from "../api/productService";
import reviewService from "../api/reviewService";
import cartService from "../api/cartService";
import type { Product, Review } from "../types";
import styles from "./styles/ProductPage.module.css";
import Navbar from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [replyToReview, setReplyToReview] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [tab, setTab] = useState(0);
  const [isInCart, setIsInCart] = useState(false);

  const getUserFromStorage = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  };

  const user = getUserFromStorage();
  const isAuthenticated = !!user;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) return;
        const productData = await productService.getProductById(Number(id));
        setProduct(productData);
        
        // Перевіряємо чи товар вже в кошику
        const cart = cartService.getCart();
        setIsInCart(cart.items.some((item: { productId: number }) => item.productId === productData.productId));
      } catch (error) {
        console.error("Помилка завантаження товару:", error);
        setError("Не вдалося завантажити дані товару. Спробуйте пізніше.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const fetchReviews = async () => {
    if (id) {
      try {
        const reviews = await reviewService.getReviewsByProductId(Number(id));
        setReviews(reviews);
      } catch (error) {
        console.error("Помилка при отриманні відгуків:", error);
      }
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const getImageUrl = (imageBase64: string | null | undefined) => {
    if (!imageBase64) return "https://via.placeholder.com/600";
    if (imageBase64.startsWith("data:image/")) return imageBase64;
    return `data:image/jpeg;base64,${imageBase64}`;
  };

  const handleReviewSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setReviewLoading(true);
    try {
      const reviewData = {
        productId: Number(id),
        userId: user.userId,
        rating: rating || undefined,
        comment: reviewText,
      };

      await reviewService.addReview(reviewData);
      setReviewText("");
      setRating(0);
      fetchReviews();
    } catch (error) {
      console.error("Помилка при додаванні відгуку:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !user || !id || replyToReview === null) {
      console.error("Відсутні необхідні дані для відповіді:", {
        replyText: replyText.trim(),
        userId: user?.userId,
        productId: id,
        replyToReview,
      });
      return;
    }

    try {
      console.log("Поточний replyToReview:", replyToReview);
      console.log("Тип replyToReview:", typeof replyToReview);

      const replyData = {
        productId: Number(id),
        userId: user.userId,
        comment: replyText.trim(),
        parentReviewId: Number(replyToReview),
        rating: 0,
      };

      console.log("Підготовка даних для відповіді:", replyData);
      await reviewService.addReply(replyData);
      setReplyText("");
      setReplyToReview(null);
      await fetchReviews();
    } catch (error) {
      console.error("Помилка при додаванні відповіді:", error);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    cartService.addToCart(product);
    setIsInCart(true);
  };

  const renderReview = (review: Review, level = 0) => (
    <Fade in={true} timeout={500} key={review.reviewID}>
      <Box
        className={`${styles.reviewContainer} ${
          review.userId === user?.userId ? styles.reviewContainerOwn : ""
        }`}
        sx={{ ml: level * 4, mb: 3 }}
      >
        <Paper
          elevation={3}
          className={`${styles.reviewPaper} 
            ${review.userId === user?.userId ? styles.reviewPaperOwn : ""} 
            ${level > 0 ? styles.reviewPaperReply : ""} 
            ${level > 0 && review.userId === user?.userId ? styles.reviewPaperReplyOwn : ""}`}
          sx={{ 
            backgroundColor: review.userId === user?.userId ? 'rgba(127, 255, 212, 0.1)' : 'rgba(23, 33, 25, 0.6)',
            borderLeft: review.userId === user?.userId ? '3px solid #7fffd4' : '3px solid rgba(127, 255, 212, 0.3)',
            padding: '16px',
            borderRadius: '8px'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" className={styles.reviewHeader} sx={{ mb: 2 }}>
            <Avatar
              className={`${styles.reviewAvatar} ${
                review.userId === user?.userId ? styles.reviewAvatarOwn : styles.reviewAvatarOther
              }`}
              sx={{ 
                bgcolor: review.userId === user?.userId ? '#7fffd4' : '#2a3c30',
                color: review.userId === user?.userId ? '#172119' : '#fff' 
              }}
            >
              {(review.userName
                ? review.userName.charAt(0)
                : "К"
              ).toUpperCase()}
            </Avatar>
            <Box className={styles.reviewUserInfo}>
              <Typography
                variant="subtitle2"
                className={`${styles.reviewUserName} ${
                  review.userId === user?.userId ? styles.reviewUserNameOwn : styles.reviewUserNameOther
                }`}
                sx={{ 
                  color: review.userId === user?.userId ? '#7fffd4' : '#fff',
                  fontWeight: 600
                }}
              >
                {review.userName || "Користувач"}
                {review.isVerifiedPurchase && (
                  <Verified className={styles.verifiedIcon} sx={{ ml: 1, fontSize: '0.9rem', color: '#7fffd4' }} />
                )}
              </Typography>
              <Typography variant="caption" className={styles.reviewDate} sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {new Date(review.reviewDate).toLocaleString("uk-UA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Box>
          </Stack>

          {review.rating !== null && review.rating > 0 && (
            <Rating
              value={review.rating}
              readOnly
              size="small"
              className={`${styles.reviewRating} ${styles.ratingStars}`}
              sx={{ mb: 1.5, color: '#ffd700' }}
            />
          )}

          <Typography
            variant="body1"
            className={styles.reviewText}
            sx={{ 
              mb: 2, 
              color: '#fff',
              lineHeight: 1.6,
              fontSize: '0.95rem'
            }}
          >
            {review.comment}
          </Typography>

          {isAuthenticated && !replyToReview && (
            <Button
              size="small"
              startIcon={<Reply className={styles.replyButtonIcon} sx={{ fontSize: '0.9rem' }} />}
              className={`${styles.replyButton} ${
                review.userId === user?.userId ? styles.replyButtonOwn : styles.replyButtonOther
              }`}
              sx={{ 
                color: '#7fffd4', 
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(127, 255, 212, 0.1)'
                }
              }}
              onClick={() => {
                const reviewID = review.reviewID;
                if (reviewID) {
                  setReplyToReview(reviewID);
                  setReplyText("");
                } else {
                  console.error("Не вдалося отримати ID коментаря");
                }
              }}
            >
              Відповісти
            </Button>
          )}

          {/* Форма відповіді */}
          {isAuthenticated && replyToReview === review.reviewID && (
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                handleReplySubmit();
              }}
              className={styles.replyForm}
              sx={{ mt: 2, p: 2, backgroundColor: 'rgba(15, 26, 18, 0.7)', borderRadius: '8px' }}
            >
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Напишіть вашу відповідь..."
                className={styles.replyTextField}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': {
                      borderColor: 'rgba(127, 255, 212, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#7fffd4',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#7fffd4',
                    },
                  }
                }}
              />
              <Stack direction="row" spacing={2} className={styles.replyButtonsContainer}>
                <Button
                  variant="contained"
                  size="small"
                  disabled={!replyText.trim()}
                  onClick={handleReplySubmit}
                  className={styles.replySubmitButton}
                  sx={{ 
                    backgroundColor: '#7fffd4', 
                    color: '#172119',
                    '&:hover': {
                      backgroundColor: '#66ccb3',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    }
                  }}
                >
                  Відправити
                </Button>
                <Button
                  size="small"
                  onClick={() => setReplyToReview(null)}
                  className={styles.replyCancelButton}
                  sx={{ color: '#7fffd4' }}
                >
                  Скасувати
                </Button>
              </Stack>
            </Box>
          )}

          {review.replies &&
            review.replies.map((reply) => renderReview(reply, level + 1))}
        </Paper>
      </Box>
    </Fade>
  );

  if (loading) {
    return (
      <Box className={styles.loaderContainer}>
        <CircularProgress sx={{ color: "#7fffd4" }} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box className={styles.errorContainer}>
        <Typography variant="h5" color="error">
          {error || "Товар не знайдено"}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar />
      <Box className={styles.productPage}>
        <Container maxWidth="lg">
          <Box className={styles.heroSection}>
            <Box className={styles.gallery}>
              <img
                src={getImageUrl(product.imageBase64)}
                alt={product.name}
                className={styles.productImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/600";
                }}
              />
            </Box>
            <Box className={styles.infoBlock}>
              <Typography variant="h3" className={styles.productName}>{product.name}</Typography>
              <Box className={styles.ratingContainer}>
                {typeof product.averageRating === "number" ? (
                  <>
                    <Rating 
                      value={product.averageRating} 
                      precision={0.5} 
                      readOnly 
                      className={styles.ratingStars} 
                    />
                    <Typography variant="body2" className={styles.ratingValue}>
                      ({product.averageRating.toFixed(1)})
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" className={styles.ratingValue}>
                    (Немає оцінок)
                  </Typography>
                )}
              </Box>
              <Typography variant="h4" className={styles.price}>{product.price.toFixed(2)} грн.</Typography>
              <Typography variant="body1" className={styles.description}>{product.description}</Typography>
              <Button 
                variant="contained" 
                className={styles.addToCartButton}
                onClick={handleAddToCart}
                startIcon={isInCart ? <Check /> : <ShoppingCart />}
                disabled={isInCart}
              >
                {isInCart ? "Товар в кошику" : "Додати в кошик"}
              </Button>
            </Box>
          </Box>
          <Box className={styles.tabsSection}>
            <Tabs 
              value={tab} 
              onChange={(_, v) => setTab(v)}
              className={styles.tabsRoot}
              classes={{
                indicator: styles.tabIndicator
              }}
            >
              <Tab label="Характеристики" className={`${styles.tab} ${tab === 0 ? styles.tabSelected : ''}`} />
              <Tab label="Гарантія" className={`${styles.tab} ${tab === 1 ? styles.tabSelected : ''}`} />
              <Tab label="Як використовувати" className={`${styles.tab} ${tab === 2 ? styles.tabSelected : ''}`} />
            </Tabs>
            {tab === 0 && (
              <Box className={styles.tabPanel}>
                <div className={styles.tabPanelItem}>
                  <span className={styles.tabPanelLabel}>Категорія:</span> {product.category}
                </div>
                <div className={styles.tabPanelItem}>
                  <span className={styles.tabPanelLabel}>Постачальник:</span> {product.supplierName}
                </div>
                <div className={styles.tabPanelItem}>
                  <span className={styles.tabPanelLabel}>SKU:</span> {product.sku}
                </div>
                {product.weight !== null && (
                  <div className={styles.tabPanelItem}>
                    <span className={styles.tabPanelLabel}>Вага:</span> {product.weight} кг
                  </div>
                )}
                {product.dimensions && (
                  <div className={styles.tabPanelItem}>
                    <span className={styles.tabPanelLabel}>Розміри:</span> {product.dimensions}
                  </div>
                )}
              </Box>
            )}
            {tab === 1 && (
              <Box className={styles.tabPanel}>
                <Typography>Гарантія надається згідно законодавства України.</Typography>
              </Box>
            )}
            {tab === 2 && (
              <Box className={styles.tabPanel}>
                <Typography>Використовуйте продукт згідно інструкції на упаковці.</Typography>
              </Box>
            )}
          </Box>
          <Box className={styles.reviewsSection} sx={{ mt: 6, mb: 4 }}>
            <Typography variant="h5" className={styles.reviewsTitle} sx={{ 
              mb: 4, 
              color: '#7fffd4',
              fontWeight: 600,
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: 0,
                width: '60px',
                height: '3px',
                background: 'linear-gradient(90deg, #7fffd4, transparent)'
              }
            }}>
              Відгуки
            </Typography>
            
            {reviews.filter(r => r.parentReviewID == null).length > 0 ? (
              reviews.filter(r => r.parentReviewID == null).map(review => renderReview(review))
            ) : (
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic', mb: 4 }}>
                Поки що немає відгуків. Будьте першим, хто залишить відгук!
              </Typography>
            )}
            
            {isAuthenticated && !replyToReview && (
              <Box 
                component="form" 
                onSubmit={handleReviewSubmit} 
                className={styles.reviewForm}
                sx={{ 
                  mt: 5, 
                  p: 3, 
                  backgroundColor: 'rgba(23, 33, 25, 0.6)', 
                  borderRadius: '10px',
                  border: '1px solid rgba(127, 255, 212, 0.2)'
                }}
              >
                <Typography 
                  variant="h6" 
                  className={styles.reviewFormTitle}
                  sx={{ 
                    mb: 3, 
                    color: '#7fffd4',
                    fontWeight: 500
                  }}
                >
                  Залишити відгук
                </Typography>
                
                <Box className={styles.reviewFormRating} sx={{ mb: 3 }}>
                  <Typography 
                    variant="subtitle2" 
                    className={styles.reviewFormRatingLabel}
                    sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}
                  >
                    Оцінка
                  </Typography>
                  <Rating 
                    value={rating} 
                    onChange={(_, v) => setRating(v || 0)} 
                    className={styles.reviewFormRatingStars}
                    sx={{ color: '#ffd700' }}
                  />
                </Box>
                
                <TextField
                  label="Ваш відгук"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  className={styles.reviewFormTextField}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor: 'rgba(127, 255, 212, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#7fffd4',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#7fffd4',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    }
                  }}
                />
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={reviewLoading || !reviewText.trim()} 
                  className={styles.reviewSubmitButton}
                  sx={{ 
                    minWidth: 200, 
                    backgroundColor: "#7fffd4", 
                    color: "#172119", 
                    '&:hover': { 
                      backgroundColor: "#66ccb3" 
                    }, 
                    '&.Mui-disabled': { 
                      backgroundColor: "rgba(255,255,255,0.12)", 
                      color: "rgba(255,255,255,0.3)" 
                    } 
                  }}
                >
                  {reviewLoading ? (
                    <CircularProgress size={24} sx={{ color: '#172119' }} />
                  ) : (
                    "Залишити відгук"
                  )}
                </Button>
              </Box>
            )}
          </Box>
          <Box className={styles.similarProductsSection}>
            <Typography variant="h6" className={styles.similarProductsTitle}>Вам може сподобатись</Typography>
            {/* Тут буде карусель/список схожих товарів */}
          </Box>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default ProductPage;
