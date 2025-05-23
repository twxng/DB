using GarderToolsServer.DTOs;
using GarderToolsServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace GarderToolsServer.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly ICustomerService _customerService;

        public OrdersController(IOrderService orderService, ICustomerService customerService)
        {
            _orderService = orderService;
            _customerService = customerService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<PagedResponse<OrderDto>>> GetOrders([FromQuery] OrderFilterDto filter)
        {
            try
            {
                // Визначаємо, чи є користувач адміністратором
                bool isAdmin = User.IsInRole("Admin");
                int? userId = null;

                // Якщо користувач не адмін, отримуємо тільки його замовлення
                if (!isAdmin)
                {
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                    if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int id))
                    {
                        userId = id;
                    }
                }

                var orders = await _orderService.GetOrdersAsync(filter, userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні замовлень: {ex.Message}" });
            }
        }

        [HttpGet("my-orders")]
        [Authorize]
        public async Task<ActionResult<PagedResponse<OrderDto>>> GetMyOrders([FromQuery] OrderFilterDto filter)
        {
            try
            {
                // Отримуємо ID користувача з токена
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { Message = "Невдалося визначити користувача" });
                }

                // Отримуємо замовлення користувача
                var orders = await _orderService.GetOrdersAsync(filter, userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні замовлень: {ex.Message}" });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            try
            {
                // Визначаємо, чи є користувач адміністратором
                bool isAdmin = User.IsInRole("Admin");
                int? userId = null;

                // Якщо користувач не адмін, перевіряємо, чи замовлення належить цьому користувачу
                if (!isAdmin)
                {
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                    if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int parsedUserId))
                    {
                        userId = parsedUserId;
                    }
                }

                var order = await _orderService.GetOrderByIdAsync(id, userId);
                if (order == null && !isAdmin)
                {
                    return NotFound(new { message = $"Замовлення з ID {id} не знайдено або у вас немає прав доступу" });
                }
                else if (order == null)
                {
                    return NotFound(new { message = $"Замовлення з ID {id} не знайдено" });
                }
                
                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Помилка при отриманні замовлення: {ex.Message}" });
            }
        }

        [HttpGet("receipt/{id}")]
        public async Task<ActionResult<OrderDto>> GetOrderReceipt(int id)
        {
            try
            {
                // Отримуємо замовлення без перевірки прав користувача
                var order = await _orderService.GetOrderByIdAsync(id, null);
                if (order == null)
                {
                    return NotFound(new { message = $"Замовлення з ID {id} не знайдено" });
                }
                
                // Повертаємо обмежену інформацію про замовлення для чеку 
                return Ok(order);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Помилка при отриманні чеку замовлення: {ex.Message}" });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<int>> CreateOrder(OrderCreateDto orderDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Отримуємо ID користувача з токена
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { Message = "Невдалося визначити користувача" });
                }

                var orderId = await _orderService.CreateOrderAsync(orderDto, userId);
                return CreatedAtAction(nameof(GetOrder), new { id = orderId }, new { Id = orderId });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при створенні замовлення: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateOrderStatus(int id, OrderUpdateDto orderDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _orderService.UpdateOrderStatusAsync(id, orderDto);
                if (!result)
                {
                    return NotFound(new { Message = $"Замовлення з ID {id} не знайдено" });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при оновленні статусу замовлення: {ex.Message}" });
            }
        }

        [HttpPost("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelOrder(int id)
        {
            try
            {
                // Визначаємо, чи є користувач адміністратором
                bool isAdmin = User.IsInRole("Admin");
                
                // Якщо користувач не адмін, перевіряємо, чи замовлення належить цьому користувачу
                if (!isAdmin)
                {
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                    if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                    {
                        var order = await _orderService.GetOrderByIdAsync(id, userId);
                        if (order == null)
                        {
                            return NotFound(new { Message = $"Замовлення з ID {id} не знайдено, або ви не маєте до нього доступу" });
                        }
                    }
                }

                Console.WriteLine($"Спроба скасувати замовлення {id}");
                var result = await _orderService.CancelOrderAsync(id);
                if (!result)
                {
                    return NotFound(new { Message = $"Замовлення з ID {id} не знайдено" });
                }
                Console.WriteLine($"Замовлення {id} успішно скасовано");
                return Ok(new { Message = "Замовлення успішно скасовано" });
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"Помилка операції при скасуванні замовлення {id}: {ex.Message}");
                return BadRequest(new { Message = ex.Message });
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Помилка оновлення бази даних при скасуванні замовлення {id}: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Внутрішня помилка: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { Message = $"Помилка при оновленні бази даних: {ex.Message}" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Загальна помилка при скасуванні замовлення {id}: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Внутрішня помилка: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { Message = $"Помилка при скасуванні замовлення: {ex.Message}" });
            }
        }
    }
}