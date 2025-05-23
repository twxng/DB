using System.ComponentModel.DataAnnotations;

namespace GarderToolsServer.DTOs
{
    public class CategoryDto
    {
        public int CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ParentCategoryId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class CategoryCreateDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        public int? ParentCategoryId { get; set; }
        
        public bool IsActive { get; set; } = true;
    }

    public class CategoryUpdateDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;
        
        [StringLength(500)]
        public string? Description { get; set; }
        
        public int? ParentCategoryId { get; set; }
        
        public bool IsActive { get; set; }
    }

    public class CategoryListResponseDto
    {
        public List<CategoryDto> Categories { get; set; } = new List<CategoryDto>();
        public int TotalCount { get; set; }
    }
} 