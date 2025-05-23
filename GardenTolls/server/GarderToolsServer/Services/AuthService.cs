using GarderToolsServer.Data;
using GarderToolsServer.DTOs;
using GarderToolsServer.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GarderToolsServer.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterUserDto registerDto)
        {
            // Перевірка, чи існує користувач з таким email
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Користувач з такою електронною поштою вже існує"
                };
            }

            // Логуємо отримані дані
            Console.WriteLine($"Реєстрація нового користувача: {registerDto.Username}, {registerDto.Email}");
            Console.WriteLine($"Особисті дані: Ім'я: '{registerDto.FirstName}', Прізвище: '{registerDto.LastName}', Телефон: '{registerDto.Phone}'");

            // Хешування пароля
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);

            // Створення нового користувача
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                FirstName = registerDto.FirstName ?? string.Empty,
                LastName = registerDto.LastName ?? string.Empty,
                Phone = registerDto.Phone,
                Role = UserRole.Customer,
                IsActive = true,
                RegistrationDate = DateTime.Now
            };

            // Додаємо користувача в базу даних
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // Логуємо успішне збереження користувача
            Console.WriteLine($"Користувач успішно створений з ID: {user.UserId}");

            // Створюємо токен для нового користувача
            var token = GenerateJwtToken(user);

            // Підготовка відповіді
            return new AuthResponseDto
            {
                IsSuccess = true,
                Message = "Реєстрація успішна",
                Token = token,
                Expiration = DateTime.UtcNow.AddDays(7),
                User = new UserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    FirstName = user.FirstName,
                    LastName = user.LastName
                }
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            // Знаходимо користувача за email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            // Перевіряємо, чи знайдено користувача і чи валідний пароль
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Невірна електронна пошта або пароль"
                };
            }

            // Перевіряємо, чи активний користувач
            if (!user.IsActive)
            {
                return new AuthResponseDto
                {
                    IsSuccess = false,
                    Message = "Обліковий запис заблоковано"
                };
            }

            // Генеруємо JWT токен
            var token = GenerateJwtToken(user);

            // Підготовка відповіді
            return new AuthResponseDto
            {
                IsSuccess = true,
                Message = "Вхід успішний",
                Token = token,
                Expiration = DateTime.UtcNow.AddDays(7),
                User = new UserDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    FirstName = user.FirstName,
                    LastName = user.LastName
                }
            };
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return false;
            }

            // Перевіряємо поточний пароль
            if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
            {
                return false;
            }

            // Оновлюємо пароль
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return true;
        }

        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterUserDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
    }
} 