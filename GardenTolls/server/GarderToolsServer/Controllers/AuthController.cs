using GarderToolsServer.DTOs;
using GarderToolsServer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using GarderToolsServer.Data;

namespace GarderToolsServer.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly AppDbContext _context;

        public AuthController(IAuthService authService, AppDbContext context)
        {
            _authService = authService;
            _context = context;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterUserDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _authService.RegisterAsync(registerDto);
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при реєстрації: {ex.Message}" });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _authService.LoginAsync(loginDto);
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                return Unauthorized(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при авторизації: {ex.Message}" });
            }
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Unauthorized(new { Message = "Невдалося визначити користувача" });
                }

                var result = await _authService.ChangePasswordAsync(userId, changePasswordDto);
                if (result)
                {
                    return Ok(new { Message = "Пароль успішно змінено" });
                }
                return BadRequest(new { Message = "Неправильний поточний пароль" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при зміні пароля: {ex.Message}" });
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                
                if (userIdClaim == null)
                {
                    return Unauthorized(new { Message = "Недійсний токен" });
                }

                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    return BadRequest(new { Message = "Некоректний ідентифікатор користувача" });
                }

                var user = await _context.Users.FindAsync(userId);
                
                if (user == null)
                {
                    return NotFound(new { Message = "Користувача не знайдено" });
                }

                var userInfo = new UserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    FirstName = user.FirstName,
                    LastName = user.LastName
                };

                return Ok(userInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні даних користувача: {ex.Message}" });
            }
        }

        [Authorize]
        [HttpGet("profile")]
        public async Task<IActionResult> GetUserProfile()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

                if (userIdClaim == null)
                {
                    return Unauthorized(new { Message = "Недійсний токен" });
                }

                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    return BadRequest(new { Message = "Некоректний ідентифікатор користувача" });
                }

                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    return NotFound(new { Message = "Користувача не знайдено" });
                }

                var profileDto = new UserProfileDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Phone = user.Phone,
                    Address = user.Address,
                    City = user.City,
                    Country = user.Country,
                    PostalCode = user.PostalCode,
                    RegistrationDate = user.RegistrationDate,
                    LastLoginDate = user.LastLoginDate
                };

                return Ok(profileDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при отриманні профілю користувача: {ex.Message}" });
            }
        }

        [Authorize]
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateUserProfileDto profileDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

                if (userIdClaim == null)
                {
                    return Unauthorized(new { Message = "Недійсний токен" });
                }

                if (!int.TryParse(userIdClaim.Value, out int userId))
                {
                    return BadRequest(new { Message = "Некоректний ідентифікатор користувача" });
                }

                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    return NotFound(new { Message = "Користувача не знайдено" });
                }

                // Оновлюємо тільки надані значення
                if (!string.IsNullOrEmpty(profileDto.Username))
                {
                    // Перевіряємо, чи унікальне ім'я користувача
                    if (await _context.Users.AnyAsync(u => u.Username == profileDto.Username && u.UserId != userId))
                    {
                        return BadRequest(new { Message = "Таке ім'я користувача вже існує" });
                    }
                    user.Username = profileDto.Username;
                }

                if (profileDto.FirstName != null)
                    user.FirstName = profileDto.FirstName;

                if (profileDto.LastName != null)
                    user.LastName = profileDto.LastName;

                if (profileDto.Phone != null)
                    user.Phone = profileDto.Phone;

                if (profileDto.Address != null)
                    user.Address = profileDto.Address;

                if (profileDto.City != null)
                    user.City = profileDto.City;

                if (profileDto.Country != null)
                    user.Country = profileDto.Country;

                if (profileDto.PostalCode != null)
                    user.PostalCode = profileDto.PostalCode;

                await _context.SaveChangesAsync();

                // Оновлюємо також клієнта, якщо він пов'язаний з користувачем
                if (user.CustomerId.HasValue)
                {
                    var customer = await _context.Customers.FindAsync(user.CustomerId.Value);
                    if (customer != null)
                    {
                        if (profileDto.FirstName != null)
                            customer.FirstName = profileDto.FirstName;

                        if (profileDto.LastName != null)
                            customer.LastName = profileDto.LastName;

                        if (profileDto.Phone != null)
                            customer.Phone = profileDto.Phone;

                        if (profileDto.Address != null)
                            customer.Address = profileDto.Address;

                        if (profileDto.City != null)
                            customer.City = profileDto.City;

                        if (profileDto.Country != null)
                            customer.Country = profileDto.Country;

                        if (profileDto.PostalCode != null)
                            customer.PostalCode = profileDto.PostalCode;

                        await _context.SaveChangesAsync();
                    }
                }

                return Ok(new { Message = "Профіль успішно оновлено" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Помилка при оновленні профілю користувача: {ex.Message}" });
            }
        }
    }
} 