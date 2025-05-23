using GarderToolsServer.Data;
using GarderToolsServer.DTOs;
using GarderToolsServer.Models;
using Microsoft.EntityFrameworkCore;

namespace GarderToolsServer.Services
{
	public class OrderService : IOrderService
	{
		private readonly AppDbContext _context;
		private readonly ICustomerService _customerService;

		public OrderService(AppDbContext context, ICustomerService customerService)
		{
			_context = context;
			_customerService = customerService;
		}

		public async Task<PagedResponse<OrderDto>> GetOrdersAsync(OrderFilterDto filter, int? userId = null)
		{
			// Базовий запит
			IQueryable<Order> query = _context.Orders
					.Include(o => o.Customer)
					.Include(o => o.OrderDetails)
					.ThenInclude(od => od.Product)
					.AsNoTracking();

			// Якщо вказано userId, отримуємо замовлення тільки для цього користувача
			if (userId.HasValue)
			{
				var userCustomerId = await _context.Users
						.Where(u => u.UserId == userId.Value)
						.Select(u => u.CustomerId)
						.FirstOrDefaultAsync();

				if (userCustomerId.HasValue)
				{
					query = query.Where(o => o.CustomerID == userCustomerId.Value);
				}
				else
				{
					// Якщо у користувача немає пов'язаного клієнта, повертаємо порожній результат
					return new PagedResponse<OrderDto>
					{
						Items = new List<OrderDto>(),
						PageNumber = filter.PageNumber,
						PageSize = filter.PageSize,
						TotalCount = 0
					};
				}
			}
			else if (filter.CustomerID.HasValue)
			{
				query = query.Where(o => o.CustomerID == filter.CustomerID.Value);
			}

			// Додаткові фільтри
			if (!string.IsNullOrEmpty(filter.Status))
			{
				query = query.Where(o => o.Status == filter.Status);
			}

			if (!string.IsNullOrEmpty(filter.PaymentStatus))
			{
				query = query.Where(o => o.PaymentStatus == filter.PaymentStatus);
			}

			if (filter.StartDate.HasValue)
			{
				query = query.Where(o => o.OrderDate >= filter.StartDate.Value);
			}

			if (filter.EndDate.HasValue)
			{
				query = query.Where(o => o.OrderDate <= filter.EndDate.Value);
			}

			if (filter.MinAmount.HasValue)
			{
				query = query.Where(o => o.TotalAmount >= filter.MinAmount.Value);
			}

			if (filter.MaxAmount.HasValue)
			{
				query = query.Where(o => o.TotalAmount <= filter.MaxAmount.Value);
			}

			// Загальна кількість результатів
			int totalCount = await query.CountAsync();

			// Сортування
			query = ApplySorting(query, filter.SortBy, filter.SortDescending);

			// Пагінація
			query = query.Skip((filter.PageNumber - 1) * filter.PageSize)
									 .Take(filter.PageSize);

			// Виконання запиту
			var orders = await query.ToListAsync();

			// Перетворюємо моделі у DTO
			var orderDtos = orders.Select(o => new OrderDto
			{
				OrderID = o.OrderID,
				CustomerID = o.CustomerID,
				CustomerName = o.Customer != null ? $"{o.Customer.FirstName} {o.Customer.LastName}".Trim() : string.Empty,
				OrderDate = o.OrderDate,
				ShippedDate = o.ShippedDate,
				DeliveryDate = o.DeliveryDate,
				Status = o.Status,
				PaymentMethod = o.PaymentMethod,
				PaymentStatus = o.PaymentStatus,
				TotalAmount = o.TotalAmount,
				ShippingAddress = o.ShippingAddress,
				ShippingCity = o.ShippingCity,
				ShippingCountry = o.ShippingCountry,
				ShippingPostalCode = o.ShippingPostalCode,
				Notes = o.Notes,
				OrderDetails = o.OrderDetails.Select(od => new OrderDetailDto
				{
					OrderDetailID = od.OrderDetailID,
					OrderID = od.OrderID,
					ProductID = od.ProductID,
					ProductName = od.Product?.ProductName ?? string.Empty,
					ImageBase64 = od.Product?.ImageBase64,
					Quantity = od.Quantity,
					UnitPrice = od.UnitPrice,
					Discount = od.Discount,
					LineTotal = od.LineTotal
				}).ToList()
			}).ToList();

			return new PagedResponse<OrderDto>
			{
				Items = orderDtos,
				PageNumber = filter.PageNumber,
				PageSize = filter.PageSize,
				TotalCount = totalCount
			};
		}

		public async Task<OrderDto?> GetOrderByIdAsync(int id, int? userId = null)
		{
			// Базовий запит
			IQueryable<Order> query = _context.Orders
					.Include(o => o.Customer)
					.Include(o => o.OrderDetails)
					.ThenInclude(od => od.Product)
					.AsNoTracking()
					.Where(o => o.OrderID == id);

			// Якщо вказано userId, перевіряємо, чи замовлення належить цьому користувачу
			if (userId.HasValue)
			{
				var userCustomerId = await _context.Users
						.Where(u => u.UserId == userId.Value)
						.Select(u => u.CustomerId)
						.FirstOrDefaultAsync();

				if (userCustomerId.HasValue)
				{
					query = query.Where(o => o.CustomerID == userCustomerId.Value);
				}
				else
				{
					return null;
				}
			}

			var order = await query.FirstOrDefaultAsync();
			if (order == null)
				return null;

			if (order.Customer == null)
			{
				throw new InvalidOperationException($"Клієнт для замовлення з ID {id} не знайдено");
			}

			// Перетворюємо модель у DTO
			return new OrderDto
			{
				OrderID = order.OrderID,
				CustomerID = order.CustomerID,
				CustomerName = $"{order.Customer?.FirstName} {order.Customer?.LastName}".Trim(),
				OrderDate = order.OrderDate,
				ShippedDate = order.ShippedDate,
				DeliveryDate = order.DeliveryDate,
				Status = order.Status,
				PaymentMethod = order.PaymentMethod,
				PaymentStatus = order.PaymentStatus,
				TotalAmount = order.TotalAmount,
				ShippingAddress = order.ShippingAddress,
				ShippingCity = order.ShippingCity,
				ShippingCountry = order.ShippingCountry,
				ShippingPostalCode = order.ShippingPostalCode,
				Notes = order.Notes,
				OrderDetails = order.OrderDetails.Select(od => new OrderDetailDto
				{
					OrderDetailID = od.OrderDetailID,
					OrderID = od.OrderID,
					ProductID = od.ProductID,
					ProductName = od.Product?.ProductName ?? string.Empty,
					ImageBase64 = od.Product?.ImageBase64,
					Quantity = od.Quantity,
					UnitPrice = od.UnitPrice,
					Discount = od.Discount,
					LineTotal = od.LineTotal
				}).ToList()
			};
		}

		public async Task<int> CreateOrderAsync(OrderCreateDto orderDto, int userId)
		{
			// Отримуємо або створюємо Customer для цього користувача
			int customerId = await _customerService.EnsureCustomerExistsForUser(userId);

			// Розпочинаємо транзакцію
			using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
			try
			{
				// Перевіряємо, чи існують товари і чи є вони в наявності
				// Додаємо блокування, щоб інші транзакції не могли змінити кількість товару на складі
				foreach (var detail in orderDto.OrderDetails)
				{
					var product = await _context.Products
							.Include(p => p.Inventory)
							.FirstOrDefaultAsync(p => p.ProductID == detail.ProductID);

					if (product == null)
					{
						throw new InvalidOperationException($"Товар з ID {detail.ProductID} не існує");
					}

					if (product.IsDiscontinued)
					{
						throw new InvalidOperationException($"Товар {product.ProductName} більше не доступний для продажу");
					}

					// Оновлюємо інформацію про інвентар з блокуванням
					var inventory = await _context.Inventories
							.FromSqlRaw("SELECT * FROM Inventory WITH (UPDLOCK, ROWLOCK) WHERE ProductID = {0}", product.ProductID)
							.FirstOrDefaultAsync();

					if (inventory == null || inventory.QuantityInStock < detail.Quantity)
					{
						throw new InvalidOperationException(
								$"Недостатньо товару {product.ProductName} на складі. Доступно: " +
								$"{inventory?.QuantityInStock ?? 0}, запитано: {detail.Quantity}");
					}
				}

				// Створюємо нове замовлення
				var order = new Order
				{
					CustomerID = customerId,
					OrderDate = DateTime.UtcNow,
					Status = "Processing", // В обробці замість Pending
					PaymentMethod = orderDto.PaymentMethod,
					PaymentStatus = "Pending",
					ShippingAddress = orderDto.ShippingAddress,
					ShippingCity = orderDto.ShippingCity,
					ShippingCountry = orderDto.ShippingCountry,
					ShippingPostalCode = orderDto.ShippingPostalCode,
					Notes = orderDto.Notes
				};

				// Додаємо замовлення
				_context.Orders.Add(order);
				await _context.SaveChangesAsync();

				// Додаємо деталі замовлення і оновлюємо склад
				decimal totalAmount = 0;

				foreach (var detailDto in orderDto.OrderDetails)
				{
					var product = await _context.Products
							.FirstOrDefaultAsync(p => p.ProductID == detailDto.ProductID);

					if (product == null)
					{
						throw new InvalidOperationException($"Продукт з ID {detailDto.ProductID} не знайдено");
					}

					// Створюємо деталь замовлення
					var orderDetail = new OrderDetail
					{
						OrderID = order.OrderID,
						ProductID = detailDto.ProductID,
						Quantity = detailDto.Quantity,
						UnitPrice = product.UnitPrice,
						Discount = 0 // За замовчуванням без знижки
					};

					_context.OrderDetails.Add(orderDetail);

					// Оновлюємо запаси на складі з явним блокуванням
					var inventory = await _context.Inventories
							.FromSqlRaw("SELECT * FROM Inventory WITH (UPDLOCK, ROWLOCK) WHERE ProductID = {0}", detailDto.ProductID)
							.FirstOrDefaultAsync();

					if (inventory != null)
					{
						Console.WriteLine($"Обробка товару ID: {detailDto.ProductID}, Запитана кількість: {detailDto.Quantity}, Доступно на складі: {inventory.QuantityInStock}");

						if (inventory.QuantityInStock < detailDto.Quantity)
						{
							throw new InvalidOperationException(
									$"Недостатньо товару {product.ProductName} на складі. Доступно: " +
									$"{inventory.QuantityInStock}, запитано: {detailDto.Quantity}");
						}

						int newQuantity = inventory.QuantityInStock - detailDto.Quantity;

						// Додаткова перевірка, що нова кількість не від'ємна
						if (newQuantity < 0)
						{
							Console.WriteLine($"ПОМИЛКА: Спроба встановити від'ємну кількість товару ID: {detailDto.ProductID}, Нова кількість: {newQuantity}");
							throw new InvalidOperationException(
									$"ПОМИЛКА запасів: Неможливо встановити від'ємну кількість товару {product.ProductName} на складі. " +
									$"Поточна кількість: {inventory.QuantityInStock}, запитана кількість: {detailDto.Quantity}");
						}

						Console.WriteLine($"Оновлення кількості товару ID: {detailDto.ProductID}, Нова кількість: {newQuantity}");
						inventory.QuantityInStock = newQuantity;
						_context.Inventories.Update(inventory);
					}
					else
					{
						Console.WriteLine($"УВАГА: Не знайдено запис в таблиці Inventory для товару ID: {detailDto.ProductID}");
					}

					// Додаємо до загальної суми
					totalAmount += orderDetail.LineTotal;
				}

				// Оновлюємо загальну суму замовлення
				order.TotalAmount = totalAmount;
				_context.Orders.Update(order);

				await _context.SaveChangesAsync();
				await transaction.CommitAsync();

				return order.OrderID;
			}
			catch
			{
				await transaction.RollbackAsync();
				throw;
			}
		}

		public async Task<bool> UpdateOrderStatusAsync(int id, OrderUpdateDto orderDto)
		{
			var order = await _context.Orders.FindAsync(id);
			if (order == null)
				return false;

			// Оновлюємо статус замовлення
			if (orderDto.Status != null)
				order.Status = orderDto.Status;

			// Оновлюємо статус оплати
			if (orderDto.PaymentStatus != null)
				order.PaymentStatus = orderDto.PaymentStatus;

			// Оновлюємо дату відправлення
			if (orderDto.ShippedDate.HasValue)
				order.ShippedDate = orderDto.ShippedDate;

			// Оновлюємо дату доставки
			if (orderDto.DeliveryDate.HasValue)
				order.DeliveryDate = orderDto.DeliveryDate;

			// Оновлюємо примітки
			if (orderDto.Notes != null)
				order.Notes = orderDto.Notes;

			try
			{
				await _context.SaveChangesAsync();
				return true;
			}
			catch
			{
				return false;
			}
		}

		public async Task<bool> CancelOrderAsync(int id)
		{
			try
			{
				var order = await _context.Orders
						.Include(o => o.OrderDetails)
						.ThenInclude(od => od.Product)
						.FirstOrDefaultAsync(o => o.OrderID == id);

				if (order == null)
					return false;

				// Перевіряємо, чи можна скасувати замовлення
				if (order.Status != null &&
						(order.Status.Equals("Delivered", StringComparison.OrdinalIgnoreCase) ||
						order.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase)))
				{
					throw new InvalidOperationException("Неможливо скасувати доставлене або вже скасоване замовлення");
				}

				// Розпочинаємо транзакцію з вищим рівнем ізоляції
				using var transaction = await _context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);
				try
				{
					// Повертаємо товари на склад
					foreach (var detail in order.OrderDetails)
					{
						if (detail.Product != null)
						{
							Console.WriteLine($"Скасування замовлення: повернення товару {detail.ProductID} в кількості {detail.Quantity} на склад");

							// Використовуємо блокування для запобігання конкурентних змін
							var inventory = await _context.Inventories
									.FromSqlRaw("SELECT * FROM Inventory WITH (UPDLOCK, ROWLOCK) WHERE ProductID = {0}", detail.ProductID)
									.FirstOrDefaultAsync();

							if (inventory != null)
							{
								Console.WriteLine($"Поточна кількість товару {detail.ProductID} на складі: {inventory.QuantityInStock}");

								// Перевіряємо максимальне значення для типу int, щоб запобігти переповненню
								if (inventory.QuantityInStock > int.MaxValue - detail.Quantity)
								{
									Console.WriteLine($"ПОПЕРЕДЖЕННЯ: Перевищення максимального значення для товару {detail.ProductID}");
									inventory.QuantityInStock = int.MaxValue;
								}
								else
								{
									inventory.QuantityInStock += detail.Quantity;
								}

								Console.WriteLine($"Нова кількість товару {detail.ProductID} на складі: {inventory.QuantityInStock}");
								_context.Inventories.Update(inventory);
								
								// Зберігаємо зміни для кожного товару окремо, щоб уникнути конфліктів
								await _context.SaveChangesAsync();
							}
							else
							{
								Console.WriteLine($"УВАГА: Не знайдено запис Inventory для товару {detail.ProductID}");
							}
						}
					}

					// Змінюємо статус замовлення
					order.Status = "Cancelled";
					order.PaymentStatus = order.PaymentStatus == "Paid" ? "Refunded" : "Cancelled";

					// Зберігаємо зміни в замовленні
					_context.Orders.Update(order);
					await _context.SaveChangesAsync();
					
					// Підтверджуємо транзакцію
					await transaction.CommitAsync();

					return true;
				}
				catch (Exception ex)
				{
					await transaction.RollbackAsync();
					Console.WriteLine($"Помилка при скасуванні замовлення: {ex.Message}");
					if (ex.InnerException != null)
					{
						Console.WriteLine($"Внутрішня помилка: {ex.InnerException.Message}");
					}
					throw new InvalidOperationException($"Помилка при скасуванні замовлення: {ex.Message}", ex);
				}
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Помилка при скасуванні замовлення: {ex.Message}");
				throw;
			}
		}

		private IQueryable<Order> ApplySorting(IQueryable<Order> query, string? sortBy, bool? sortDescending)
		{
			bool isDescending = sortDescending ?? false;

			// За замовчуванням сортуємо за датою замовлення (від нових до старих)
			if (string.IsNullOrEmpty(sortBy))
			{
				return isDescending
						? query.OrderByDescending(o => o.OrderDate)
						: query.OrderBy(o => o.OrderDate);
			}

			// Застосовуємо різні варіанти сортування
			switch (sortBy.ToLower())
			{
				case "date":
					return isDescending
							? query.OrderByDescending(o => o.OrderDate)
							: query.OrderBy(o => o.OrderDate);
				case "status":
					return isDescending
							? query.OrderByDescending(o => o.Status)
							: query.OrderBy(o => o.Status);
				case "amount":
					return isDescending
							? query.OrderByDescending(o => o.TotalAmount)
							: query.OrderBy(o => o.TotalAmount);
				case "customer":
					return isDescending
							? query.OrderByDescending(o => o.Customer != null ? o.Customer.LastName : string.Empty)
								.ThenByDescending(o => o.Customer != null ? o.Customer.FirstName : string.Empty)
							: query.OrderBy(o => o.Customer != null ? o.Customer.LastName : string.Empty)
								.ThenBy(o => o.Customer != null ? o.Customer.FirstName : string.Empty);
				default:
					return isDescending
							? query.OrderByDescending(o => o.OrderDate)
							: query.OrderBy(o => o.OrderDate);
			}
		}
	}

	public interface IOrderService
	{
		Task<PagedResponse<OrderDto>> GetOrdersAsync(OrderFilterDto filter, int? userId = null);
		Task<OrderDto?> GetOrderByIdAsync(int id, int? userId = null);
		Task<int> CreateOrderAsync(OrderCreateDto orderDto, int userId);
		Task<bool> UpdateOrderStatusAsync(int id, OrderUpdateDto orderDto);
		Task<bool> CancelOrderAsync(int id);
	}
}