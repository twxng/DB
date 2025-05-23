using GarderToolsServer.DTOs;
using GarderToolsServer.Models;
using GarderToolsServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GarderToolsServer.Data;
using System.Linq;

namespace GarderToolsServer.Controllers
{
    [ApiController]
    [Route("api/suppliers")]
    public class SuppliersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SuppliersController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Отримання списку постачальників з можливістю пагінації
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<SupplierListResponseDto>> GetSuppliers(
            string? searchTerm = null,
            int pageNumber = 1,
            int pageSize = 10)
        {
            try
            {
                var query = _context.Suppliers.AsQueryable();

                // Фільтрація за пошуковим терміном
                if (!string.IsNullOrEmpty(searchTerm))
                {
                    query = query.Where(s => 
                        s.CompanyName.Contains(searchTerm) ||
                        (s.ContactPerson != null && s.ContactPerson.Contains(searchTerm)) ||
                        s.Email.Contains(searchTerm) ||
                        s.City.Contains(searchTerm) ||
                        s.Country.Contains(searchTerm));
                }

                // Підрахунок загальної кількості записів
                var totalCount = await query.CountAsync();

                // Застосування пагінації
                var suppliers = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(s => new SupplierDto
                    {
                        SupplierID = s.SupplierID,
                        CompanyName = s.CompanyName,
                        ContactPerson = s.ContactPerson,
                        Email = s.Email,
                        Phone = s.Phone,
                        Address = s.Address,
                        City = s.City,
                        Country = s.Country,
                        PostalCode = s.PostalCode,
                        Website = s.Website,
                        CreatedAt = s.CreatedAt,
                        IsActive = s.IsActive
                    })
                    .ToListAsync();

                var response = new SupplierListResponseDto
                {
                    Suppliers = suppliers,
                    TotalCount = totalCount
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні постачальників: {ex.Message}" });
            }
        }

        /// <summary>
        /// Отримання постачальника за ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<SupplierDto>> GetSupplier(int id)
        {
            try
            {
                var supplier = await _context.Suppliers.FindAsync(id);

                if (supplier == null)
                {
                    return NotFound(new { Message = $"Постачальника з ID {id} не знайдено" });
                }

                var supplierDto = new SupplierDto
                {
                    SupplierID = supplier.SupplierID,
                    CompanyName = supplier.CompanyName,
                    ContactPerson = supplier.ContactPerson,
                    Email = supplier.Email,
                    Phone = supplier.Phone,
                    Address = supplier.Address,
                    City = supplier.City,
                    Country = supplier.Country,
                    PostalCode = supplier.PostalCode,
                    Website = supplier.Website,
                    CreatedAt = supplier.CreatedAt,
                    IsActive = supplier.IsActive
                };

                return Ok(supplierDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні постачальника: {ex.Message}" });
            }
        }

        /// <summary>
        /// Створення нового постачальника
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<int>> CreateSupplier([FromBody] SupplierCreateDto supplierDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var supplier = new Supplier
                {
                    CompanyName = supplierDto.CompanyName,
                    ContactPerson = supplierDto.ContactPerson,
                    Email = supplierDto.Email,
                    Phone = supplierDto.Phone,
                    Address = supplierDto.Address,
                    City = supplierDto.City,
                    Country = supplierDto.Country,
                    PostalCode = supplierDto.PostalCode,
                    Website = supplierDto.Website,
                    IsActive = supplierDto.IsActive,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Suppliers.Add(supplier);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetSupplier), new { id = supplier.SupplierID }, new { Id = supplier.SupplierID });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при створенні постачальника: {ex.Message}" });
            }
        }

        /// <summary>
        /// Оновлення існуючого постачальника
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSupplier(int id, [FromBody] SupplierUpdateDto supplierDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var supplier = await _context.Suppliers.FindAsync(id);

                if (supplier == null)
                {
                    return NotFound(new { Message = $"Постачальника з ID {id} не знайдено" });
                }

                // Оновлюємо тільки надані поля
                if (supplierDto.CompanyName != null)
                    supplier.CompanyName = supplierDto.CompanyName;
                
                // Порожній ContactPerson є допустимим значенням
                supplier.ContactPerson = supplierDto.ContactPerson;
                
                if (supplierDto.Email != null)
                    supplier.Email = supplierDto.Email;
                
                if (supplierDto.Phone != null)
                    supplier.Phone = supplierDto.Phone;
                
                if (supplierDto.Address != null)
                    supplier.Address = supplierDto.Address;
                
                if (supplierDto.City != null)
                    supplier.City = supplierDto.City;
                
                if (supplierDto.Country != null)
                    supplier.Country = supplierDto.Country;
                
                supplier.PostalCode = supplierDto.PostalCode;
                supplier.Website = supplierDto.Website;
                
                if (supplierDto.IsActive.HasValue)
                    supplier.IsActive = supplierDto.IsActive.Value;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при оновленні постачальника: {ex.Message}" });
            }
        }

        /// <summary>
        /// Видалення постачальника за ID
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSupplier(int id)
        {
            try
            {
                var supplier = await _context.Suppliers
                    .Include(s => s.Products)
                    .FirstOrDefaultAsync(s => s.SupplierID == id);

                if (supplier == null)
                {
                    return NotFound();
                }

                if (supplier.Products != null && supplier.Products.Any())
                {
                    return BadRequest("Неможливо видалити постачальника, який має пов'язані товари");
                }

                _context.Suppliers.Remove(supplier);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при видаленні постачальника: {ex.Message}" });
            }
        }

        /// <summary>
        /// Отримання списку постачальників без пагінації для вибору у формі
        /// </summary>
        [HttpGet("list")]
        public async Task<ActionResult<List<SupplierDto>>> GetSuppliersList()
        {
            try
            {
                var suppliers = await _context.Suppliers
                    .Where(s => s.IsActive)
                    .Select(s => new SupplierDto
                    {
                        SupplierID = s.SupplierID,
                        CompanyName = s.CompanyName,
                        ContactPerson = s.ContactPerson,
                        Email = s.Email,
                        Phone = s.Phone,
                        Address = s.Address,
                        City = s.City,
                        Country = s.Country,
                        PostalCode = s.PostalCode,
                        Website = s.Website,
                        CreatedAt = s.CreatedAt,
                        IsActive = s.IsActive
                    })
                    .ToListAsync();

                return Ok(suppliers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні списку постачальників: {ex.Message}" });
            }
        }
    }
} 