using GarderToolsServer.Data;
using GarderToolsServer.DTOs;
using GarderToolsServer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GarderToolsServer.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/reviews/product/5
        [HttpGet("product/{productId}")]
        public async Task<ActionResult<IEnumerable<ReviewDto>>> GetReviewsByProductId(int productId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.ProductID == productId && r.IsApproved)
                .OrderByDescending(r => r.ReviewDate)
                .Include(r => r.User)
                .Include(r => r.Replies)
                .ThenInclude(x => x.User)
                .ToListAsync();
            List<ReviewDto> MapReplies(Review r) => r.Replies?.Where(x => x.IsApproved).OrderByDescending(x => x.ReviewDate).Select(x => new ReviewDto {
                ReviewID = x.ReviewID,
                ProductID = x.ProductID,
                UserID = x.UserID,
                Rating = x.Rating,
                Comment = x.Comment,
                ReviewDate = x.ReviewDate,
                IsVerifiedPurchase = x.IsVerifiedPurchase,
                IsApproved = x.IsApproved,
                ParentReviewID = x.ParentReviewID,
                Replies = MapReplies(x),
                UserName = x.User != null ? (!string.IsNullOrEmpty(x.User.FirstName) || !string.IsNullOrEmpty(x.User.LastName) ? ($"{x.User.FirstName} {x.User.LastName}").Trim() : x.User.Username) : "Користувач"
            }).ToList() ?? new List<ReviewDto>();
            var result = reviews.Select(r => new ReviewDto {
                ReviewID = r.ReviewID,
                ProductID = r.ProductID,
                UserID = r.UserID,
                Rating = r.Rating ?? 0,
                Comment = r.Comment,
                ReviewDate = r.ReviewDate,
                IsVerifiedPurchase = r.IsVerifiedPurchase,
                IsApproved = r.IsApproved,
                ParentReviewID = r.ParentReviewID,
                Replies = MapReplies(r),
                UserName = r.User != null ? (!string.IsNullOrEmpty(r.User.FirstName) || !string.IsNullOrEmpty(r.User.LastName) ? ($"{r.User.FirstName} {r.User.LastName}").Trim() : r.User.Username) : "Користувач"
            }).ToList();
            return Ok(result);
        }

        // POST: api/reviews
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> AddReview([FromBody] ReviewCreateDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized();
            if (userId != dto.UserID)
                return Forbid();

            // Перевіряємо існування батьківського відгуку, якщо він вказаний і не дорівнює 0
            if (dto.ParentReviewID.HasValue && dto.ParentReviewID.Value != 0)
            {
                var parentReview = await _context.Reviews.FindAsync(dto.ParentReviewID.Value);
                if (parentReview == null)
                    return BadRequest("Батьківський відгук не знайдено");
            }

            var review = new Review
            {
                ProductID = dto.ProductID,
                UserID = dto.UserID,
                Rating = dto.Rating,
                Comment = dto.Comment,
                ReviewDate = DateTime.UtcNow,
                IsVerifiedPurchase = true,
                IsApproved = true,
                ParentReviewID = dto.ParentReviewID == 0 ? null : dto.ParentReviewID
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Отримуємо дані користувача
            var user = await _context.Users.FindAsync(review.UserID);
            var userName = user != null ? 
                (!string.IsNullOrEmpty(user.FirstName) || !string.IsNullOrEmpty(user.LastName) ? 
                    ($"{user.FirstName} {user.LastName}").Trim() : 
                    user.Username) : 
                "Користувач";

            var result = new ReviewDto
            {
                ReviewID = review.ReviewID,
                ProductID = review.ProductID,
                UserID = review.UserID,
                Rating = review.Rating ?? 0,
                Comment = review.Comment,
                ReviewDate = review.ReviewDate,
                IsVerifiedPurchase = review.IsVerifiedPurchase,
                IsApproved = review.IsApproved,
                ParentReviewID = review.ParentReviewID,
                Replies = new List<ReviewDto>(),
                UserName = userName
            };
            return CreatedAtAction(nameof(GetReviewsByProductId), new { productId = review.ProductID }, result);
        }

        // POST: api/reviews/reply
        [HttpPost("reply")]
        [Authorize]
        public async Task<ActionResult<ReviewDto>> AddReply([FromBody] ReviewCreateDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return Unauthorized();
            if (userId != dto.UserID)
                return Forbid();

            // ParentReviewID має бути обов'язковим для відповіді
            if (!dto.ParentReviewID.HasValue || dto.ParentReviewID.Value == 0)
                return BadRequest("ParentReviewID обов'язковий для відповіді");

            var parentReview = await _context.Reviews.FindAsync(dto.ParentReviewID.Value);
            if (parentReview == null)
                return BadRequest("Батьківський відгук не знайдено");

            var review = new Review
            {
                ProductID = dto.ProductID,
                UserID = dto.UserID,
                Rating = dto.Rating,
                Comment = dto.Comment,
                ReviewDate = DateTime.UtcNow,
                IsVerifiedPurchase = true,
                IsApproved = true,
                ParentReviewID = dto.ParentReviewID
            };
            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(review.UserID);
            var userName = user != null ?
                (!string.IsNullOrEmpty(user.FirstName) || !string.IsNullOrEmpty(user.LastName) ?
                    ($"{user.FirstName} {user.LastName}").Trim() :
                    user.Username) :
                "Користувач";

            var result = new ReviewDto
            {
                ReviewID = review.ReviewID,
                ProductID = review.ProductID,
                UserID = review.UserID,
                Rating = review.Rating ?? 0,
                Comment = review.Comment,
                ReviewDate = review.ReviewDate,
                IsVerifiedPurchase = review.IsVerifiedPurchase,
                IsApproved = review.IsApproved,
                ParentReviewID = review.ParentReviewID,
                Replies = new List<ReviewDto>(),
                UserName = userName
            };
            return CreatedAtAction(nameof(GetReviewsByProductId), new { productId = review.ProductID }, result);
        }
    }
} 