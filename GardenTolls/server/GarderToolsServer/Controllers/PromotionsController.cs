using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using GarderToolsServer.Data;

namespace GarderToolsServer.Controllers
{
    [ApiController]
    [Route("api/promotions")]
    public class PromotionsController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly string _connectionString;
        private readonly AppDbContext _context;

        public PromotionsController(IConfiguration configuration, AppDbContext context)
        {
            _configuration = configuration;
            _connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
            _context = context;
        }

        /// <summary>
        /// Отримання списку всіх активних акцій
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetActivePromotions()
        {
            try
            {
                var promotions = await GetActivePromotionsFromDb();
                return Ok(promotions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні акцій: {ex.Message}" });
            }
        }

        /// <summary>
        /// Отримання акційних товарів за ID акції
        /// </summary>
        [HttpGet("{promotionId}/products")]
        public async Task<IActionResult> GetPromotionProducts(int promotionId)
        {
            try
            {
                var products = await GetPromotionProductsFromDb(promotionId);
                if (products.Count == 0)
                {
                    return NotFound(new { Message = $"Акцію з ID {promotionId} не знайдено або в ній немає товарів" });
                }
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні акційних товарів: {ex.Message}" });
            }
        }

        /// <summary>
        /// Отримання акційних товарів від конкретного постачальника
        /// </summary>
        [HttpGet("supplier/{supplierId}")]
        public async Task<IActionResult> GetPromotionProductsBySupplier(int supplierId, [FromQuery] int count = 3)
        {
            try
            {
                var products = await GetPromotionProductsBySupplierFromDb(supplierId, count);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні акційних товарів постачальника: {ex.Message}" });
            }
        }

        /// <summary>
        /// Створення нової акції (тільки для адміністраторів)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePromotion([FromBody] PromotionCreateDto promotionDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                int promotionId = await CreatePromotionInDb(promotionDto);
                return CreatedAtAction(nameof(GetPromotionProducts), new { promotionId }, new { Id = promotionId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при створенні акції: {ex.Message}" });
            }
        }

        /// <summary>
        /// Додавання товару до акції (тільки для адміністраторів)
        /// </summary>
        [HttpPost("{promotionId}/products")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddProductToPromotion(int promotionId, [FromBody] PromotionProductDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await AddProductToPromotionInDb(promotionId, productDto);
                return Ok(new { Message = "Товар успішно додано до акції" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при додаванні товару до акції: {ex.Message}" });
            }
        }

        #region Private Methods

        private async Task<List<dynamic>> GetActivePromotionsFromDb()
        {
            var promotions = new List<dynamic>();

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string query = @"
                    SELECT 
                        p.PromotionID,
                        p.SupplierID,
                        s.CompanyName AS SupplierName,
                        p.StartDate,
                        p.EndDate,
                        p.Description,
                        p.PromotionName,
                        COUNT(pp.ProductID) AS ProductCount
                    FROM Promotions p
                    INNER JOIN Suppliers s ON p.SupplierID = s.SupplierID
                    LEFT JOIN PromotionProducts pp ON p.PromotionID = pp.PromotionID
                    WHERE 
                        p.IsActive = 1 
                        AND GETDATE() BETWEEN p.StartDate AND p.EndDate
                    GROUP BY 
                        p.PromotionID, p.SupplierID, s.CompanyName, 
                        p.StartDate, p.EndDate, p.Description, p.PromotionName";

                using (var command = new SqlCommand(query, connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            promotions.Add(new
                            {
                                PromotionID = reader.GetInt32(0),
                                SupplierID = reader.GetInt32(1),
                                SupplierName = reader.GetString(2),
                                StartDate = reader.GetDateTime(3),
                                EndDate = reader.GetDateTime(4),
                                Description = reader.IsDBNull(5) ? null : reader.GetString(5),
                                PromotionName = reader.GetString(6),
                                ProductCount = reader.GetInt32(7)
                            });
                        }
                    }
                }
            }

            return promotions;
        }

        private async Task<List<dynamic>> GetPromotionProductsFromDb(int promotionId)
        {
            var products = new List<dynamic>();

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string query = @"
                    SELECT 
                        p.ProductID,
                        p.ProductName,
                        p.UnitPrice AS OriginalPrice,
                        pp.DiscountPercentage,
                        pp.PromotionalPrice AS DiscountedPrice,
                        p.ImageBase64 AS ImageURL
                    FROM PromotionProducts pp
                    INNER JOIN Products p ON pp.ProductID = p.ProductID
                    WHERE 
                        pp.PromotionID = @PromotionId
                        AND pp.IsActive = 1";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@PromotionId", promotionId);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            products.Add(new
                            {
                                ProductID = reader.GetInt32(0),
                                ProductName = reader.GetString(1),
                                OriginalPrice = reader.GetDecimal(2),
                                DiscountPercentage = reader.GetDecimal(3),
                                DiscountedPrice = reader.GetDecimal(4),
                                ImageURL = reader.IsDBNull(5) ? null : reader.GetString(5)
                            });
                        }
                    }
                }
            }

            return products;
        }

        private async Task<List<dynamic>> GetPromotionProductsBySupplierFromDb(int supplierId, int count)
        {
            var products = new List<dynamic>();

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                using (var command = new SqlCommand("sp_GetPromotionProductsBySupplier", connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    command.Parameters.AddWithValue("@SupplierID", supplierId);
                    command.Parameters.AddWithValue("@Count", count);

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            products.Add(new
                            {
                                ProductID = reader.GetInt32(0),
                                ProductName = reader.GetString(1),
                                OriginalPrice = reader.GetDecimal(2),
                                DiscountPercentage = reader.GetDecimal(3),
                                DiscountedPrice = reader.GetDecimal(4),
                                ImageURL = reader.IsDBNull(5) ? null : reader.GetString(5),
                                PromotionID = reader.GetInt32(6),
                                PromotionName = reader.GetString(7)
                            });
                        }
                    }
                }
            }

            return products;
        }

        private async Task<int> CreatePromotionInDb(PromotionCreateDto promotionDto)
        {
            int promotionId = 0;

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string query = @"
                    INSERT INTO Promotions (SupplierID, StartDate, EndDate, IsActive, Description, PromotionName)
                    VALUES (@SupplierID, @StartDate, @EndDate, @IsActive, @Description, @PromotionName);
                    SELECT SCOPE_IDENTITY();";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@SupplierID", promotionDto.SupplierID);
                    command.Parameters.AddWithValue("@StartDate", promotionDto.StartDate);
                    command.Parameters.AddWithValue("@EndDate", promotionDto.EndDate);
                    command.Parameters.AddWithValue("@IsActive", promotionDto.IsActive);
                    command.Parameters.AddWithValue("@Description", promotionDto.Description ?? (object)DBNull.Value);
                    command.Parameters.AddWithValue("@PromotionName", promotionDto.PromotionName);

                    var result = await command.ExecuteScalarAsync();
                    promotionId = Convert.ToInt32(result);
                }
            }

            return promotionId;
        }

        private async Task AddProductToPromotionInDb(int promotionId, PromotionProductDto productDto)
        {
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();

                string query = @"
                    INSERT INTO PromotionProducts (PromotionID, ProductID, DiscountPercentage, IsActive)
                    VALUES (@PromotionID, @ProductID, @DiscountPercentage, @IsActive)";

                using (var command = new SqlCommand(query, connection))
                {
                    command.Parameters.AddWithValue("@PromotionID", promotionId);
                    command.Parameters.AddWithValue("@ProductID", productDto.ProductID);
                    command.Parameters.AddWithValue("@DiscountPercentage", productDto.DiscountPercentage);
                    command.Parameters.AddWithValue("@IsActive", productDto.IsActive);

                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        #endregion
    }

    // DTO для створення акції
    public class PromotionCreateDto
    {
        public int SupplierID { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public string? Description { get; set; }
        public string PromotionName { get; set; } = "";
    }

    // DTO для додавання товару до акції
    public class PromotionProductDto
    {
        public int ProductID { get; set; }
        public decimal DiscountPercentage { get; set; }
        public bool IsActive { get; set; } = true;
    }
} 