SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- Процедура для отримання акційних товарів від конкретного постачальника
CREATE PROCEDURE [dbo].[sp_GetPromotionProductsBySupplier]
    @SupplierID INT,
    @Count INT = 3
AS
BEGIN
    SELECT TOP (@Count)
        p.ProductID,
        p.ProductName,
        p.UnitPrice AS OriginalPrice,
        pp.DiscountPercentage,
        pp.PromotionalPrice AS DiscountedPrice,
        p.ImageBase64 AS ImageURL,
        promo.PromotionID,
        promo.PromotionName
    FROM PromotionProducts pp
    INNER JOIN Products p ON pp.ProductID = p.ProductID
    INNER JOIN Promotions promo ON pp.PromotionID = promo.PromotionID
    WHERE 
        promo.SupplierID = @SupplierID
        AND pp.IsActive = 1 
        AND promo.IsActive = 1
        AND GETDATE() BETWEEN promo.StartDate AND promo.EndDate
    ORDER BY pp.DiscountPercentage DESC;
END;
GO