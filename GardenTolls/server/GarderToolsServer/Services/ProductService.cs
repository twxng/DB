using GarderToolsServer.Data;
using GarderToolsServer.DTOs;
using GarderToolsServer.Models;
using Microsoft.EntityFrameworkCore;

namespace GarderToolsServer.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResponse<ProductDto>> GetProductsAsync(ProductFilterDto filter)
        {
            // Створюємо базовий запит з включенням необхідних зв'язків
            IQueryable<Product> query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventory)
                .AsNoTracking(); // Підвищує продуктивність для запитів тільки для читання

            // Застосовуємо фільтри
            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                string searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(p => 
                    p.ProductName.ToLower().Contains(searchTerm) || 
                    p.Description != null && p.Description.ToLower().Contains(searchTerm) || 
                    p.SKU.ToLower().Contains(searchTerm));
            }

            if (filter.CategoryID.HasValue)
            {
                query = query.Where(p => p.CategoryID == filter.CategoryID.Value);
            }

            if (filter.SupplierID.HasValue)
            {
                query = query.Where(p => p.SupplierID == filter.SupplierID.Value);
            }

            if (filter.MinPrice.HasValue)
            {
                query = query.Where(p => p.UnitPrice >= filter.MinPrice.Value);
            }

            if (filter.MaxPrice.HasValue)
            {
                query = query.Where(p => p.UnitPrice <= filter.MaxPrice.Value);
            }

            if (filter.InStock.HasValue && filter.InStock.Value)
            {
                query = query.Where(p => p.Inventory != null && p.Inventory.QuantityInStock > 0);
            }

            // Отримуємо загальну кількість товарів після фільтрації
            int totalCount = await query.CountAsync();

            // Застосовуємо сортування
            query = ApplySorting(query, filter.SortBy, filter.SortDescending);

            // Застосовуємо пагінацію
            query = query.Skip((filter.PageNumber - 1) * filter.PageSize)
                         .Take(filter.PageSize);

            // Виконуємо запит і трансформуємо результати
            var products = await query.Select(p => new ProductDto
            {
                ProductID = p.ProductID,
                ProductName = p.ProductName,
                CategoryID = p.CategoryID,
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                SupplierID = p.SupplierID,
                SupplierName = p.Supplier != null ? p.Supplier.CompanyName : string.Empty,
                Description = p.Description,
                UnitPrice = p.UnitPrice,
                Weight = p.Weight,
                Dimensions = p.Dimensions,
                SKU = p.SKU,
                ImageBase64 = p.ImageBase64,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                IsDiscontinued = p.IsDiscontinued,
                QuantityInStock = p.Inventory != null ? p.Inventory.QuantityInStock : 0,
                AverageRating = p.Reviews.Count > 0 ? p.Reviews.Average(r => r.Rating) : null
            }).ToListAsync();

            // Формуємо відповідь
            return new PagedResponse<ProductDto>
            {
                Items = products,
                PageNumber = filter.PageNumber,
                PageSize = filter.PageSize,
                TotalCount = totalCount
            };
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Supplier)
                .Include(p => p.Inventory)
                .Include(p => p.Reviews.Where(r => r.IsApproved))
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.ProductID == id);

            if (product == null)
                return null;

            return new ProductDto
            {
                ProductID = product.ProductID,
                ProductName = product.ProductName,
                CategoryID = product.CategoryID,
                CategoryName = product.Category?.Name ?? string.Empty,
                SupplierID = product.SupplierID,
                SupplierName = product.Supplier?.CompanyName ?? string.Empty,
                Description = product.Description,
                UnitPrice = product.UnitPrice,
                Weight = product.Weight,
                Dimensions = product.Dimensions,
                SKU = product.SKU,
                ImageBase64 = product.ImageBase64,
                CreatedAt = product.CreatedAt,
                UpdatedAt = product.UpdatedAt,
                IsDiscontinued = product.IsDiscontinued,
                QuantityInStock = product.Inventory?.QuantityInStock ?? 0,
                AverageRating = product.Reviews.Count > 0 ? product.Reviews.Average(r => r.Rating) : null
            };
        }

        public async Task<int> CreateProductAsync(ProductCreateDto productDto)
        {
            // Перевіряємо унікальність SKU
            bool skuExists = await _context.Products.AnyAsync(p => p.SKU == productDto.SKU);
            if (skuExists)
            {
                throw new InvalidOperationException($"Товар з SKU '{productDto.SKU}' вже існує");
            }

            // Перевіряємо існування категорії
            bool categoryExists = await _context.Categories.AnyAsync(c => c.CategoryID == productDto.CategoryID);
            if (!categoryExists)
            {
                throw new InvalidOperationException($"Категорія з ID {productDto.CategoryID} не існує");
            }

            // Перевіряємо існування постачальника
            bool supplierExists = await _context.Suppliers.AnyAsync(s => s.SupplierID == productDto.SupplierID);
            if (!supplierExists)
            {
                throw new InvalidOperationException($"Постачальник з ID {productDto.SupplierID} не існує");
            }

            // Створюємо новий продукт
            var product = new Product
            {
                ProductName = productDto.ProductName,
                CategoryID = productDto.CategoryID,
                SupplierID = productDto.SupplierID,
                Description = productDto.Description,
                UnitPrice = productDto.UnitPrice,
                Weight = productDto.Weight,
                Dimensions = productDto.Dimensions,
                SKU = productDto.SKU,
                ImageBase64 = productDto.ImageBase64,
                CreatedAt = DateTime.UtcNow
            };

            // Додаємо продукт в базу даних
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return product.ProductID;
        }

        public async Task<bool> UpdateProductAsync(int id, ProductUpdateDto productDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return false;

            // Перевіряємо унікальність SKU, якщо він був змінений
            if (productDto.SKU != null && productDto.SKU != product.SKU)
            {
                bool skuExists = await _context.Products.AnyAsync(p => p.SKU == productDto.SKU && p.ProductID != id);
                if (skuExists)
                {
                    throw new InvalidOperationException($"Товар з SKU '{productDto.SKU}' вже існує");
                }
            }

            // Перевіряємо існування категорії, якщо вона змінилася
            if (productDto.CategoryID.HasValue && productDto.CategoryID != product.CategoryID)
            {
                bool categoryExists = await _context.Categories.AnyAsync(c => c.CategoryID == productDto.CategoryID);
                if (!categoryExists)
                {
                    throw new InvalidOperationException($"Категорія з ID {productDto.CategoryID} не існує");
                }
            }

            // Перевіряємо існування постачальника, якщо він змінився
            if (productDto.SupplierID.HasValue && productDto.SupplierID != product.SupplierID)
            {
                bool supplierExists = await _context.Suppliers.AnyAsync(s => s.SupplierID == productDto.SupplierID);
                if (!supplierExists)
                {
                    throw new InvalidOperationException($"Постачальник з ID {productDto.SupplierID} не існує");
                }
            }

            // Оновлюємо властивості продукту
            if (productDto.ProductName != null)
                product.ProductName = productDto.ProductName;

            if (productDto.CategoryID.HasValue)
                product.CategoryID = productDto.CategoryID.Value;

            if (productDto.SupplierID.HasValue)
                product.SupplierID = productDto.SupplierID.Value;

            if (productDto.Description != null)
                product.Description = productDto.Description;

            if (productDto.UnitPrice.HasValue)
                product.UnitPrice = productDto.UnitPrice.Value;

            if (productDto.Weight.HasValue)
                product.Weight = productDto.Weight;

            if (productDto.Dimensions != null)
                product.Dimensions = productDto.Dimensions;

            if (productDto.SKU != null)
                product.SKU = productDto.SKU;

            if (productDto.ImageBase64 != null)
                product.ImageBase64 = productDto.ImageBase64;

            if (productDto.IsDiscontinued.HasValue)
                product.IsDiscontinued = productDto.IsDiscontinued.Value;

            // Встановлюємо час оновлення
            product.UpdatedAt = DateTime.UtcNow;

            // Зберігаємо зміни
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            // Використовуємо транзакцію, щоб гарантувати цілісність даних
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var product = await _context.Products
                    .Include(p => p.OrderDetails)
                    .Include(p => p.Reviews)
                    .Include(p => p.Inventory)
                    .FirstOrDefaultAsync(p => p.ProductID == id);

                if (product == null)
                    return false;

                // Перевіряємо, чи товар використовується в замовленнях
                if (product.OrderDetails.Any())
                {
                    // Якщо товар вже в замовленнях, позначаємо його як вилучений з продажу, а не видаляємо
                    product.IsDiscontinued = true;
                    product.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
                else
                {
                    // Видаляємо відгуки
                    if (product.Reviews.Any())
                    {
                        _context.Reviews.RemoveRange(product.Reviews);
                    }

                    // Видаляємо інформацію про запаси
                    if (product.Inventory != null)
                    {
                        _context.Inventories.Remove(product.Inventory);
                    }

                    // Видаляємо сам товар
                    _context.Products.Remove(product);
                    await _context.SaveChangesAsync();
                }

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw; // Перекидаємо виключення вище для обробки
            }
        }

        private IQueryable<Product> ApplySorting(IQueryable<Product> query, string? sortBy, bool? sortDescending)
        {
            bool isDescending = sortDescending ?? false;

            // За замовчуванням сортуємо за ім'ям продукту
            if (string.IsNullOrEmpty(sortBy))
            {
                return isDescending
                    ? query.OrderByDescending(p => p.ProductName)
                    : query.OrderBy(p => p.ProductName);
            }

            // Застосовуємо різні варіанти сортування
            switch (sortBy.ToLower())
            {
                case "name":
                    return isDescending
                        ? query.OrderByDescending(p => p.ProductName)
                        : query.OrderBy(p => p.ProductName);
                case "price":
                    return isDescending
                        ? query.OrderByDescending(p => p.UnitPrice)
                        : query.OrderBy(p => p.UnitPrice);
                case "category":
                    return isDescending
                        ? query.OrderByDescending(p => p.Category!.Name)
                        : query.OrderBy(p => p.Category!.Name);
                case "supplier":
                    return isDescending
                        ? query.OrderByDescending(p => p.Supplier!.CompanyName)
                        : query.OrderBy(p => p.Supplier!.CompanyName);
                case "created":
                    return isDescending
                        ? query.OrderByDescending(p => p.CreatedAt)
                        : query.OrderBy(p => p.CreatedAt);
                case "stock":
                    return isDescending
                        ? query.OrderByDescending(p => p.Inventory != null ? p.Inventory.QuantityInStock : 0)
                        : query.OrderBy(p => p.Inventory != null ? p.Inventory.QuantityInStock : 0);
                default:
                    return isDescending
                        ? query.OrderByDescending(p => p.ProductName)
                        : query.OrderBy(p => p.ProductName);
            }
        }

        // Метод для виклику збереженої процедури аналізу запасів
        public async Task<List<dynamic>> AnalyzeInventoryAsync()
        {
            var result = new List<dynamic>();
            
            // Виклик збереженої процедури з використанням NativeSQL
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "EXEC dbo.AnalyzeInventoryAndRecommendOrders";
                
                await _context.Database.OpenConnectionAsync();
                
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var item = new 
                        {
                            ProductID = reader.GetInt32(0),
                            ProductName = reader.GetString(1),
                            CategoryName = reader.GetString(2),
                            SupplierName = reader.GetString(3),
                            CurrentStock = reader.GetInt32(4),
                            ReorderLevel = reader.GetInt32(5),
                            RecommendedOrderQuantity = reader.GetInt32(6),
                            EstimatedCost = reader.GetDecimal(7),
                            LastOrderDate = reader.IsDBNull(8) ? (DateTime?)null : reader.GetDateTime(8),
                            AvgMonthlyConsumption = reader.GetInt32(9)
                        };
                        
                        result.Add(item);
                    }
                }
            }
            
            return result;
        }
    }

    public interface IProductService
    {
        Task<PagedResponse<ProductDto>> GetProductsAsync(ProductFilterDto filter);
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<int> CreateProductAsync(ProductCreateDto productDto);
        Task<bool> UpdateProductAsync(int id, ProductUpdateDto productDto);
        Task<bool> DeleteProductAsync(int id);
        Task<List<dynamic>> AnalyzeInventoryAsync();
    }
} 