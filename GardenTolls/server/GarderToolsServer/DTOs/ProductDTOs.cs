using System.ComponentModel.DataAnnotations;

namespace GarderToolsServer.DTOs
{
    public class ProductDto
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int CategoryID { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int SupplierID { get; set; }
        public string SupplierName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal? Weight { get; set; }
        public string? Dimensions { get; set; }
        public string SKU { get; set; } = string.Empty;
        public string? ImageBase64 { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDiscontinued { get; set; }
        public int? QuantityInStock { get; set; }
        public double? AverageRating { get; set; }
    }

    public class ProductCreateDto
    {
        [Required]
        [StringLength(200)]
        public string ProductName { get; set; } = string.Empty;

        [Required]
        public int CategoryID { get; set; }

        [Required]
        public int SupplierID { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal UnitPrice { get; set; }

        public decimal? Weight { get; set; }

        [StringLength(50)]
        public string? Dimensions { get; set; }

        [Required]
        [StringLength(50)]
        public string SKU { get; set; } = string.Empty;

        // Поле для зберігання зображення в форматі Base64
        public string? ImageBase64 { get; set; }
    }

    public class ProductUpdateDto
    {
        [StringLength(200)]
        public string? ProductName { get; set; }

        public int? CategoryID { get; set; }

        public int? SupplierID { get; set; }

        [StringLength(1000)]
        public string? Description { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? UnitPrice { get; set; }

        public decimal? Weight { get; set; }

        [StringLength(50)]
        public string? Dimensions { get; set; }

        [StringLength(50)]
        public string? SKU { get; set; }

        // Поле для зберігання зображення в форматі Base64
        public string? ImageBase64 { get; set; }

        public bool? IsDiscontinued { get; set; }
    }

    public class ProductFilterDto
    {
        public string? SearchTerm { get; set; }
        public int? CategoryID { get; set; }
        public int? SupplierID { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public bool? InStock { get; set; }
        public string? SortBy { get; set; }
        public bool? SortDescending { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
} 