using System.ComponentModel.DataAnnotations;

namespace GarderToolsServer.DTOs
{
	public class SupplierDto
	{
		public int SupplierID { get; set; }
		public string CompanyName { get; set; } = string.Empty;
		public string? ContactPerson { get; set; }
		public string Email { get; set; } = string.Empty;
		public string Phone { get; set; } = string.Empty;
		public string Address { get; set; } = string.Empty;
		public string City { get; set; } = string.Empty;
		public string Country { get; set; } = string.Empty;
		public string? PostalCode { get; set; }
		public string? Website { get; set; }
		public DateTime CreatedAt { get; set; }
		public bool IsActive { get; set; }
	}

	public class SupplierCreateDto
	{
		[Required]
		[StringLength(100)]
		public string CompanyName { get; set; } = string.Empty;

		[StringLength(100)]
		public string? ContactPerson { get; set; }

		[Required]
		[EmailAddress]
		[StringLength(100)]
		public string Email { get; set; } = string.Empty;

		[Required]
		[StringLength(20)]
		public string Phone { get; set; } = string.Empty;

		[Required]
		[StringLength(200)]
		public string Address { get; set; } = string.Empty;

		[Required]
		[StringLength(50)]
		public string City { get; set; } = string.Empty;

		[Required]
		[StringLength(50)]
		public string Country { get; set; } = string.Empty;

		[StringLength(20)]
		public string? PostalCode { get; set; }

		[StringLength(100)]
		public string? Website { get; set; }

		public bool IsActive { get; set; } = true;
	}

	public class SupplierUpdateDto
	{
		[StringLength(100)]
		public string? CompanyName { get; set; }

		[StringLength(100)]
		public string? ContactPerson { get; set; }

		[EmailAddress]
		[StringLength(100)]
		public string? Email { get; set; }

		[StringLength(20)]
		public string? Phone { get; set; }

		[StringLength(200)]
		public string? Address { get; set; }

		[StringLength(50)]
		public string? City { get; set; }

		[StringLength(50)]
		public string? Country { get; set; }

		[StringLength(20)]
		public string? PostalCode { get; set; }

		[StringLength(100)]
		public string? Website { get; set; }

		public bool? IsActive { get; set; }
	}

	public class SupplierListResponseDto
	{
		public List<SupplierDto> Suppliers { get; set; } = new List<SupplierDto>();
		public int TotalCount { get; set; }
	}
}