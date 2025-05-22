CREATE TABLE [dbo].[Inventory] (
  [InventoryID] [int] IDENTITY,
  [ProductID] [int] NOT NULL,
  [WarehouseLocation] [nvarchar](100) NOT NULL,
  [QuantityInStock] [int] NOT NULL,
  [ReorderLevel] [int] NOT NULL,
  [LastRestocked] [datetime] NULL,
  [NextDeliveryDate] [datetime] NULL,
  [InventoryStatus] [nvarchar](20) NULL,
  PRIMARY KEY CLUSTERED ([InventoryID]),
  CONSTRAINT [CK_Inventory_QuantityInStock] CHECK ([QuantityInStock]>=(0)),
  CONSTRAINT [CK_Inventory_ReorderLevel] CHECK ([ReorderLevel]>=(0))
)
ON [PRIMARY]
GO

CREATE INDEX [IX_Inventory_QuantityInStock]
  ON [dbo].[Inventory] ([QuantityInStock])
  ON [PRIMARY]
GO

ALTER TABLE [dbo].[Inventory]
  ADD FOREIGN KEY ([ProductID]) REFERENCES [dbo].[Products] ([ProductID])
GO