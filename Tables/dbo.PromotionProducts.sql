CREATE TABLE [dbo].[PromotionProducts] (
  [PromotionProductID] [int] IDENTITY,
  [PromotionID] [int] NOT NULL,
  [ProductID] [int] NOT NULL,
  [DiscountPercentage] [decimal](5, 2) NOT NULL,
  [PromotionalPrice] [decimal](10, 2) NULL,
  [IsActive] [bit] NOT NULL DEFAULT (1),
  PRIMARY KEY CLUSTERED ([PromotionProductID]),
  CONSTRAINT [UC_PromotionProducts] UNIQUE ([PromotionID], [ProductID]),
  CONSTRAINT [CK_PromotionProducts_Discount] CHECK ([DiscountPercentage]>=(0) AND [DiscountPercentage]<=(100))
)
ON [PRIMARY]
GO

CREATE INDEX [IX_PromotionProducts_ProductID]
  ON [dbo].[PromotionProducts] ([ProductID])
  ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
-- Створення тригера для автоматичного розрахунку ціни зі знижкою
CREATE TRIGGER [dbo].[tr_CalculatePromotionalPrice]
ON [PromotionProducts]
AFTER INSERT, UPDATE
AS
BEGIN
    UPDATE pp
    SET pp.PromotionalPrice = p.UnitPrice * (1 - pp.DiscountPercentage / 100)
    FROM PromotionProducts pp
    INNER JOIN Products p ON pp.ProductID = p.ProductID
    INNER JOIN inserted i ON pp.PromotionProductID = i.PromotionProductID;
END;
GO

ALTER TABLE [dbo].[PromotionProducts]
  ADD FOREIGN KEY ([ProductID]) REFERENCES [dbo].[Products] ([ProductID])
GO

ALTER TABLE [dbo].[PromotionProducts]
  ADD FOREIGN KEY ([PromotionID]) REFERENCES [dbo].[Promotions] ([PromotionID])
GO