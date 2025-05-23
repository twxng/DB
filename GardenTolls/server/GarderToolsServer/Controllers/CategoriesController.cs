using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GarderToolsServer.Data;
using GarderToolsServer.DTOs;
using GarderToolsServer.Models;

namespace GarderToolsServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Categories
        [HttpGet]
        public async Task<ActionResult<CategoryListResponseDto>> GetCategories()
        {
            var categories = await _context.Categories
                .Select(c => new CategoryDto
                {
                    CategoryId = c.CategoryID,
                    Name = c.Name,
                    Description = c.Description,
                    ParentCategoryId = c.ParentCategoryID,
                    CreatedAt = c.CreatedAt,
                    IsActive = c.IsActive
                })
                .ToListAsync();

            return Ok(new CategoryListResponseDto
            {
                Categories = categories,
                TotalCount = categories.Count
            });
        }

        // GET: api/Categories/5
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
            {
                return NotFound();
            }

            return new CategoryDto
            {
                CategoryId = category.CategoryID,
                Name = category.Name,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryID,
                CreatedAt = category.CreatedAt,
                IsActive = category.IsActive
            };
        }

        // GET: api/Categories/5/subcategories
        [HttpGet("{id}/subcategories")]
        public async Task<ActionResult<CategoryListResponseDto>> GetSubcategories(int id)
        {
            var parentExists = await _context.Categories.AnyAsync(c => c.CategoryID == id);
            if (!parentExists)
            {
                return NotFound("Батьківська категорія не знайдена");
            }

            var subcategories = await _context.Categories
                .Where(c => c.ParentCategoryID == id)
                .Select(c => new CategoryDto
                {
                    CategoryId = c.CategoryID,
                    Name = c.Name,
                    Description = c.Description,
                    ParentCategoryId = c.ParentCategoryID,
                    CreatedAt = c.CreatedAt,
                    IsActive = c.IsActive
                })
                .ToListAsync();

            return Ok(new CategoryListResponseDto
            {
                Categories = subcategories,
                TotalCount = subcategories.Count
            });
        }

        // POST: api/Categories
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CategoryDto>> CreateCategory(CategoryCreateDto categoryDto)
        {
            // Перевіряємо, чи існує батьківська категорія, якщо вказана
            if (categoryDto.ParentCategoryId.HasValue)
            {
                var parentExists = await _context.Categories.AnyAsync(c => c.CategoryID == categoryDto.ParentCategoryId.Value);
                if (!parentExists)
                {
                    return BadRequest("Батьківська категорія не існує");
                }
            }

            var category = new Category
            {
                Name = categoryDto.Name,
                Description = categoryDto.Description,
                ParentCategoryID = categoryDto.ParentCategoryId,
                CreatedAt = DateTime.UtcNow,
                IsActive = categoryDto.IsActive
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCategory),
                new { id = category.CategoryID },
                new CategoryDto
                {
                    CategoryId = category.CategoryID,
                    Name = category.Name,
                    Description = category.Description,
                    ParentCategoryId = category.ParentCategoryID,
                    CreatedAt = category.CreatedAt,
                    IsActive = category.IsActive
                });
        }

        // PUT: api/Categories/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, CategoryUpdateDto categoryDto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            // Перевіряємо, чи існує батьківська категорія, якщо вказана
            if (categoryDto.ParentCategoryId.HasValue && categoryDto.ParentCategoryId.Value != category.ParentCategoryID)
            {
                // Перевіряємо, чи не встановлюємо батьківською саму категорію
                if (categoryDto.ParentCategoryId.Value == id)
                {
                    return BadRequest("Категорія не може бути батьківською для самої себе");
                }

                var parentExists = await _context.Categories.AnyAsync(c => c.CategoryID == categoryDto.ParentCategoryId.Value);
                if (!parentExists)
                {
                    return BadRequest("Батьківська категорія не існує");
                }
            }

            category.Name = categoryDto.Name;
            category.Description = categoryDto.Description;
            category.ParentCategoryID = categoryDto.ParentCategoryId;
            category.IsActive = categoryDto.IsActive;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoryExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Categories/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            // Перевіряємо, чи є товари, пов'язані з категорією
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryID == id);
            if (hasProducts)
            {
                return BadRequest("Неможливо видалити категорію, оскільки з нею пов'язані товари");
            }

            // Перевіряємо, чи є підкатегорії
            var hasSubcategories = await _context.Categories.AnyAsync(c => c.ParentCategoryID == id);
            if (hasSubcategories)
            {
                return BadRequest("Неможливо видалити категорію, оскільки вона має підкатегорії");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PATCH: api/Categories/5/toggle-active
        [HttpPatch("{id}/toggle-active")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleCategoryActive(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            category.IsActive = !category.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { isActive = category.IsActive });
        }

        private bool CategoryExists(int id)
        {
            return _context.Categories.Any(e => e.CategoryID == id);
        }
    }
} 