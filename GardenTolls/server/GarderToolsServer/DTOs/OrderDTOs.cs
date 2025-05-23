using System.ComponentModel.DataAnnotations;

namespace GarderToolsServer.DTOs
{
    public class OrderDto
    {
        public int OrderID { get; set; }
        public int CustomerID { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public DateTime? ShippedDate { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string ShippingAddress { get; set; } = string.Empty;
        public string ShippingCity { get; set; } = string.Empty;
        public string ShippingCountry { get; set; } = string.Empty;
        public string? ShippingPostalCode { get; set; }
        public string? Notes { get; set; }
        public List<OrderDetailDto> OrderDetails { get; set; } = new List<OrderDetailDto>();
    }

    public class OrderDetailDto
    {
        public int OrderDetailID { get; set; }
        public int OrderID { get; set; }
        public int ProductID { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ImageBase64 { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Discount { get; set; }
        public decimal LineTotal { get; set; }
    }

    public class OrderCreateDto
    {
        [Required]
        public string PaymentMethod { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string ShippingCity { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string ShippingCountry { get; set; } = string.Empty;

        [StringLength(20)]
        public string? ShippingPostalCode { get; set; }

        [StringLength(500)]
        public string? Notes { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Замовлення повинно містити хоча б один товар")]
        public List<OrderDetailCreateDto> OrderDetails { get; set; } = new List<OrderDetailCreateDto>();
    }

    public class OrderDetailCreateDto
    {
        [Required]
        public int ProductID { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Кількість повинна бути більше 0")]
        public int Quantity { get; set; }
    }

    public class OrderUpdateDto
    {
        public string? Status { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime? ShippedDate { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public string? Notes { get; set; }
    }

    public class OrderFilterDto
    {
        public int? CustomerID { get; set; }
        public string? Status { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public string? SortBy { get; set; }
        public bool? SortDescending { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class PagedResponse<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get { return (int)Math.Ceiling(TotalCount / (double)PageSize); } }
        public bool HasPreviousPage { get { return PageNumber > 1; } }
        public bool HasNextPage { get { return PageNumber < TotalPages; } }
    }
} 