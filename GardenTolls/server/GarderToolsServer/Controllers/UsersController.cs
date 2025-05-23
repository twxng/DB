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
    [Authorize(Roles = "Admin,Manager")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<UserListResponseDto>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserListDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = $"{u.FirstName} {u.LastName}".Trim(),
                    Phone = u.Phone ?? string.Empty,
                    Role = u.Role.ToString(),
                    IsActive = u.IsActive,
                    RegistrationDate = u.RegistrationDate,
                    LastLoginDate = null,
                    OrderCount = _context.Customers
                        .Where(c => c.User != null && c.User.UserId == u.UserId)
                        .SelectMany(c => c.Orders)
                        .Count()
                })
                .ToListAsync();

            return Ok(new UserListResponseDto
            {
                Users = users,
                TotalCount = users.Count
            });
        }

        [HttpPatch("{id}/toggle-active")]
        public async Task<IActionResult> ToggleUserActive(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Не дозволяємо деактивувати адміністратора
            if (user.Role == UserRole.Admin)
            {
                return BadRequest("Неможливо змінити статус адміністратора");
            }

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { isActive = user.IsActive });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Customer)
                .FirstOrDefaultAsync(u => u.UserId == id);
                
            if (user == null)
            {
                return NotFound();
            }

            // Не дозволяємо видаляти адміністратора
            if (user.Role == UserRole.Admin)
            {
                return BadRequest("Неможливо видалити адміністратора");
            }

            // Перевіряємо, чи є пов'язані з користувачем дані (замовлення)
            if (user.Customer != null && await _context.Orders.AnyAsync(o => o.CustomerID == user.Customer.CustomerID))
            {
                // Якщо є замовлення, не видаляємо користувача, а лише деактивуємо
                user.IsActive = false;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Користувач має замовлення. Користувача деактивовано замість видалення." });
            }

            // Видаляємо пов'язаного клієнта, якщо він є
            if (user.Customer != null)
            {
                _context.Customers.Remove(user.Customer);
            }

            // Видаляємо користувача
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Користувача успішно видалено" });
        }

        [HttpPatch("{id}/block")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> BlockUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Не дозволяємо блокувати адміністратора
            if (user.Role == UserRole.Admin)
            {
                return BadRequest("Неможливо заблокувати адміністратора");
            }

            // Блокуємо користувача
            user.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Користувача успішно заблоковано", isActive = user.IsActive });
        }

        [HttpPatch("{id}/unblock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnblockUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Розблоковуємо користувача
            user.IsActive = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Користувача успішно розблоковано", isActive = user.IsActive });
        }
    }
} 