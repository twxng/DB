CREATE TABLE [dbo].[Orders] (
  [OrderID] [int] IDENTITY,
  [CustomerID] [int] NOT NULL,
  [OrderDate] [datetime] NOT NULL DEFAULT (getdate()),
  [ShippedDate] [datetime] NULL,
  [DeliveryDate] [datetime] NULL,
  [Status] [nvarchar](20) NOT NULL DEFAULT ('Pending'),
  [PaymentMethod] [nvarchar](50) NOT NULL,
  [PaymentStatus] [nvarchar](20) NOT NULL DEFAULT ('Pending'),
  [TotalAmount] [decimal](12, 2) NOT NULL DEFAULT (0),
  [ShippingAddress] [nvarchar](200) NOT NULL,
  [ShippingCity] [nvarchar](50) NOT NULL,
  [ShippingCountry] [nvarchar](50) NOT NULL,
  [ShippingPostalCode] [nvarchar](20) NULL,
  [Notes] [nvarchar](500) NULL,
  PRIMARY KEY CLUSTERED ([OrderID]),
  CONSTRAINT [CK_Orders_PaymentStatus] CHECK ([PaymentStatus]='Failed' OR [PaymentStatus]='Refunded' OR [PaymentStatus]='Paid' OR [PaymentStatus]='Authorized' OR [PaymentStatus]='Pending'),
  CONSTRAINT [CK_Orders_Status] CHECK ([Status]='Cancelled' OR [Status]='Delivered' OR [Status]='Shipped' OR [Status]='Processing' OR [Status]='Pending'),
  CONSTRAINT [CK_Orders_TotalAmount] CHECK ([TotalAmount]>=(0))
)
ON [PRIMARY]
GO

CREATE INDEX [IX_Orders_CustomerID]
  ON [dbo].[Orders] ([CustomerID])
  ON [PRIMARY]
GO

CREATE INDEX [IX_Orders_Status_OrderDate]
  ON [dbo].[Orders] ([Status], [OrderDate])
  ON [PRIMARY]
GO

SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
CREATE TRIGGER [dbo].[trg_UpdateLoyaltyPoints]
ON [Orders]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
        IF UPDATE(Status)
    BEGIN
        UPDATE c
        SET c.LoyaltyPoints = c.LoyaltyPoints + CAST(i.TotalAmount / 100 AS INT) -- 1 бал за кожні 100 грн
        FROM Customers c
        JOIN inserted i ON c.CustomerID = i.CustomerID
        JOIN deleted d ON d.OrderID = i.OrderID
        WHERE i.Status = 'Delivered' AND d.Status <> 'Delivered';
    END;
END;
GO

ALTER TABLE [dbo].[Orders]
  ADD FOREIGN KEY ([CustomerID]) REFERENCES [dbo].[Customers] ([CustomerID])
GO