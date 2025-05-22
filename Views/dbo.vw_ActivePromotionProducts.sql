SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO

-- Представлення для всіх активних акційних товарів
CREATE VIEW [dbo].[vw_ActivePromotionProducts] AS
SELECT 
    pp.PromotionProductID,
    p.ProductID,
    p.ProductName,
    p.CategoryID,
    p.SupplierID,
    s.CompanyName AS SupplierName,
    p.UnitPrice AS OriginalPrice,
    pp.DiscountPercentage,
    pp.PromotionalPrice AS DiscountedPrice,
    p.ImageBase64 AS ImageURL,
    promo.PromotionName,
    promo.Description AS PromotionDescription,
    promo.StartDate,
    promo.EndDate
FROM PromotionProducts pp
INNER JOIN Products p ON pp.ProductID = p.ProductID
INNER JOIN Promotions promo ON pp.PromotionID = promo.PromotionID
INNER JOIN Suppliers s ON p.SupplierID = s.SupplierID
WHERE 
    pp.IsActive = 1 
    AND promo.IsActive = 1
    AND GETDATE() BETWEEN promo.StartDate AND promo.EndDate;
GO