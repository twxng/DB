using Microsoft.EntityFrameworkCore;
using GarderToolsServer.Models;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.SqlServer.Metadata.Internal;

namespace GarderToolsServer.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<Inventory> Inventories { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Конфігурація User
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Конфігурація для конвертації enum Role в рядок
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            // Конфігурація категорій (самозв'язок)
            modelBuilder.Entity<Category>()
                .HasOne(c => c.ParentCategory)
                .WithMany(c => c.Subcategories)
                .HasForeignKey(c => c.ParentCategoryID)
                .OnDelete(DeleteBehavior.Restrict);

            // Конфігурація продуктів
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.SKU)
                .IsUnique();

            modelBuilder.Entity<Product>()
                .Property(p => p.UnitPrice)
                .HasColumnType("decimal(10, 2)");

            // Обмеження для Customer
            modelBuilder.Entity<Customer>()
                .HasIndex(c => c.Email)
                .IsUnique();

            // Зв'язок між User і Customer
            modelBuilder.Entity<User>()
                .HasOne(u => u.Customer)
                .WithOne(c => c.User)
                .HasForeignKey<User>(u => u.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Конфігурація OrderDetail
            modelBuilder.Entity<OrderDetail>()
                .Property(od => od.UnitPrice)
                .HasColumnType("decimal(10, 2)");

            modelBuilder.Entity<OrderDetail>()
                .Property(od => od.Discount)
                .HasColumnType("decimal(5, 2)");

            // Створення індексів для підвищення продуктивності
            modelBuilder.Entity<Product>()
                .HasIndex(p => p.CategoryID);

            modelBuilder.Entity<Product>()
                .HasIndex(p => new { p.CategoryID, p.UnitPrice });

            modelBuilder.Entity<Order>()
                .HasIndex(o => o.CustomerID);

            modelBuilder.Entity<Order>()
                .HasIndex(o => new { o.Status, o.OrderDate });

            modelBuilder.Entity<Inventory>()
                .HasIndex(i => i.QuantityInStock);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserID)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Review>()
                .HasOne(r => r.ParentReview)
                .WithMany(r => r.Replies)
                .HasForeignKey(r => r.ParentReviewID)
                .OnDelete(DeleteBehavior.Cascade);

            // --- Workaround для OUTPUT + тригери на OrderDetails (EF Core 8+) ---
            // Відключаємо використання OUTPUT clause для цієї таблиці
            modelBuilder.Entity<OrderDetail>().ToTable(tb => 
                tb.HasTrigger("OrderDetailsTrigger"));

            // Додаємо конфігурацію для Orders
            modelBuilder.Entity<Order>().ToTable(tb => 
                tb.HasTrigger("OrdersTrigger"));
            // -------------------------------------------------------------------
        }
    }
}