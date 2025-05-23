using GarderToolsServer.DTOs;
using GarderToolsServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace GarderToolsServer.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        /// <summary>
        /// Отримання списку товарів з можливістю фільтрації та пагінації
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PagedResponse<ProductDto>>> GetProducts([FromQuery] ProductFilterDto filter)
        {
            try
            {
                var products = await _productService.GetProductsAsync(filter);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні товарів: {ex.Message}" });
            }
        }

        /// <summary>
        /// Отримання товару за ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            try
            {
                var product = await _productService.GetProductByIdAsync(id);
                if (product == null)
                {
                    return NotFound(new { Message = $"Товар з ID {id} не знайдено" });
                }
                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні товару: {ex.Message}" });
            }
        }

        /// <summary>
        /// Створення нового товару, включаючи завантаження зображення як Base64
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<int>> CreateProduct([FromBody] ProductCreateDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Перевіряємо, чи надано зображення у форматі Base64
                if (!string.IsNullOrEmpty(productDto.ImageBase64))
                {
                    // Якщо ImageBase64 починається з префіксу схеми даних, видаляємо його
                    if (productDto.ImageBase64.StartsWith("data:"))
                    {
                        // Більш універсальний регулярний вираз для обробки різних типів даних
                        var regex = new Regex(@"^data:.*?;base64,");
                        productDto.ImageBase64 = regex.Replace(productDto.ImageBase64, string.Empty);
                    }
                    
                    // Перевіряємо, чи дійсно це Base64
                    try
                    {
                        var bytes = Convert.FromBase64String(productDto.ImageBase64);
                    }
                    catch
                    {
                        return BadRequest(new { Message = "Некоректний формат зображення Base64" });
                    }
                }

                var productId = await _productService.CreateProductAsync(productDto);
                return CreatedAtAction(nameof(GetProduct), new { id = productId }, new { Id = productId });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при створенні товару: {ex.Message}" });
            }
        }

        /// <summary>
        /// Оновлення існуючого товару, включаючи завантаження зображення як Base64
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> UpdateProduct(int id, [FromBody] ProductUpdateDto productDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Перевіряємо, чи надано нове зображення у форматі Base64
                if (!string.IsNullOrEmpty(productDto.ImageBase64))
                {
                    // Якщо ImageBase64 починається з префіксу схеми даних, видаляємо його
                    if (productDto.ImageBase64.StartsWith("data:"))
                    {
                        // Більш універсальний регулярний вираз для обробки різних типів даних
                        var regex = new Regex(@"^data:.*?;base64,");
                        productDto.ImageBase64 = regex.Replace(productDto.ImageBase64, string.Empty);
                    }
                    
                    // Перевіряємо, чи дійсно це Base64
                    try
                    {
                        var bytes = Convert.FromBase64String(productDto.ImageBase64);
                    }
                    catch
                    {
                        return BadRequest(new { Message = "Некоректний формат зображення Base64" });
                    }
                }

                var result = await _productService.UpdateProductAsync(id, productDto);
                if (!result)
                {
                    return NotFound(new { Message = $"Товар з ID {id} не знайдено" });
                }
                
                // Отримуємо і повертаємо оновлений товар
                var updatedProduct = await _productService.GetProductByIdAsync(id);
                if (updatedProduct == null)
                {
                    return StatusCode(500, new { Message = "Товар оновлено, але не вдалося отримати оновлені дані" });
                }
                
                return Ok(updatedProduct);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при оновленні товару: {ex.Message}" });
            }
        }

        /// <summary>
        /// Видалення товару за ID
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var result = await _productService.DeleteProductAsync(id);
                if (!result)
                {
                    return NotFound(new { Message = $"Товар з ID {id} не знайдено" });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при видаленні товару: {ex.Message}" });
            }
        }

        /// <summary>
        /// Отримання аналітики запасів товарів
        /// </summary>
        [HttpGet("analyze-inventory")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AnalyzeInventory()
        {
            try
            {
                var result = await _productService.AnalyzeInventoryAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при аналізі запасів: {ex.Message}" });
            }
        }

        /// <summary>
        /// Отримання всіх товарів
        /// </summary>
        [HttpGet("all")]
        public async Task<ActionResult<List<ProductDto>>> GetAllProducts()
        {
            try
            {
                var filter = new ProductFilterDto
                {
                    PageNumber = 1,
                    PageSize = int.MaxValue
                };
                var products = await _productService.GetProductsAsync(filter);
                return Ok(products.Items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні товарів: {ex.Message}" });
            }
        }
    }
}