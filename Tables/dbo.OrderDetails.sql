SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[OrderDetails] (
  [OrderDetailID] [int] IDENTITY,
  [OrderID] [int] NOT NULL,
  [ProductID] [int] NOT NULL,
  [Quantity] [int] NOT NULL,
  [UnitPrice] [decimal](10, 2) NOT NULL,
  [Discount] [decimal](5, 2) NOT NULL DEFAULT (0),
  [LineTotal] AS (([Quantity]*[UnitPrice])*((1)-[Discount]/(100))) PERSISTED,
  PRIMARY KEY CLUSTERED ([OrderDetailID]),
  CONSTRAINT [CK_OrderDetails_Discount] CHECK ([Discount]>=(0) AND [Discount]<=(100)),
  CONSTRAINT [CK_OrderDetails_Quantity] CHECK ([Quantity]>(0)),
  CONSTRAINT [CK_OrderDetails_UnitPrice] CHECK ([UnitPrice]>=(0))
)
ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
CREATE TRIGGER [dbo].[trg_UpdateInventory]
ON [OrderDetails]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
  
    UPDATE inv
    SET inv.QuantityInStock = inv.QuantityInStock - i.Quantity
    FROM Inventory inv
    JOIN inserted i ON inv.ProductID = i.ProductID;
    
    UPDATE inv
    SET inv.InventoryStatus = CASE 
                                WHEN inv.QuantityInStock <= inv.ReorderLevel THEN 'Reorder Needed'
                                ELSE 'In Stock'
                              END
    FROM Inventory inv
    JOIN inserted i ON inv.ProductID = i.ProductID;
END;
GO

SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
CREATE TRIGGER [dbo].[trg_UpdateOrderTotal]
ON [OrderDetails]
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE o
    SET o.TotalAmount = (
        SELECT SUM(od.LineTotal)
        FROM OrderDetails od
        WHERE od.OrderID = o.OrderID
    )
    FROM Orders o
    JOIN (
        SELECT OrderID FROM inserted
        UNION
        SELECT OrderID FROM deleted
    ) AS ChangedOrders ON o.OrderID = ChangedOrders.OrderID;
END;
GO

ALTER TABLE [dbo].[OrderDetails]
  ADD FOREIGN KEY ([OrderID]) REFERENCES [dbo].[Orders] ([OrderID])
GO

ALTER TABLE [dbo].[OrderDetails]
  ADD FOREIGN KEY ([ProductID]) REFERENCES [dbo].[Products] ([ProductID])
GO