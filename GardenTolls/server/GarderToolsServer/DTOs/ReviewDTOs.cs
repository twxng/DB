using System;
using System.ComponentModel.DataAnnotations;

namespace GarderToolsServer.DTOs
{
    public class ReviewDto
    {
        public int ReviewID { get; set; }
        public int ProductID { get; set; }
        public int UserID { get; set; }
        [Range(0, 5)]
        public byte? Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime ReviewDate { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        public bool IsApproved { get; set; }
        public int? ParentReviewID { get; set; }
        public List<ReviewDto>? Replies { get; set; }
        public string? UserName { get; set; }
    }

    public class ReviewCreateDto
    {
        [Required]
        public int ProductID { get; set; }
        [Required]
        public int UserID { get; set; }
        [Range(0, 5)]
        public byte? Rating { get; set; }
        [StringLength(1000)]
        public string? Comment { get; set; }
        public int? ParentReviewID { get; set; }
    }
} 