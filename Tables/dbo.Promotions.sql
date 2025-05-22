CREATE TABLE [dbo].[Promotions] (
  [PromotionID] [int] IDENTITY,
  [SupplierID] [int] NOT NULL,
  [StartDate] [datetime] NOT NULL,
  [EndDate] [datetime] NOT NULL,
  [IsActive] [bit] NOT NULL DEFAULT (1),
  [Description] [nvarchar](500) NULL,
  [PromotionName] [nvarchar](100) NOT NULL,
  [CreatedAt] [datetime] NOT NULL DEFAULT (getdate()),
  PRIMARY KEY CLUSTERED ([PromotionID]),
  CONSTRAINT [CK_Promotions_DateRange] CHECK ([EndDate]>=[StartDate])
)
ON [PRIMARY]
GO

CREATE INDEX [IX_Promotions_SupplierID_IsActive]
  ON [dbo].[Promotions] ([SupplierID], [IsActive])
  ON [PRIMARY]
GO

ALTER TABLE [dbo].[Promotions]
  ADD FOREIGN KEY ([SupplierID]) REFERENCES [dbo].[Suppliers] ([SupplierID])
GO