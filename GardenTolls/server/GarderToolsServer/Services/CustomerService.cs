using GarderToolsServer.Data;
using GarderToolsServer.Models;
using Microsoft.EntityFrameworkCore;

namespace GarderToolsServer.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly AppDbContext _context;

        public CustomerService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Customer?> GetCustomerByUserId(int userId)
        {
            var user = await _context.Users
                .Include(u => u.Customer)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            return user?.Customer;
        }

        public async Task<int> EnsureCustomerExistsForUser(int userId)
        {
            // Перевіряємо, чи вже існує Customer для цього користувача
            var user = await _context.Users
                .Include(u => u.Customer)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                throw new ArgumentException($"Користувача з ID {userId} не знайдено");
            }

            // Якщо клієнт вже прив'язаний до користувача, повертаємо його ID
            if (user.CustomerId.HasValue && user.Customer != null)
            {
                return user.CustomerId.Value;
            }

            // Якщо клієнта немає, створюємо новий на основі даних користувача
            var customer = new Customer
            {
                FirstName = user.FirstName ?? "Клієнт",
                LastName = user.LastName ?? user.Username,
                Email = user.Email,
                Phone = user.Phone ?? "Не вказано",
                Address = user.Address,
                City = user.City,
                Country = user.Country,
                PostalCode = user.PostalCode,
                RegistrationDate = DateTime.UtcNow,
                IsSubscribed = false
            };

            // Додаємо нового клієнта в базу даних
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            // Оновлюємо користувача з посиланням на клієнта
            user.CustomerId = customer.CustomerID;
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return customer.CustomerID;
        }
    }

    public interface ICustomerService
    {
        Task<Customer?> GetCustomerByUserId(int userId);
        Task<int> EnsureCustomerExistsForUser(int userId);
    }
} 