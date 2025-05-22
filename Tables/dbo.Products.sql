CREATE TABLE [dbo].[Products] (
  [ProductID] [int] IDENTITY,
  [ProductName] [nvarchar](200) NOT NULL,
  [CategoryID] [int] NOT NULL,
  [SupplierID] [int] NOT NULL,
  [Description] [nvarchar](1000) NULL,
  [UnitPrice] [decimal](10, 2) NOT NULL,
  [Weight] [decimal](8, 2) NULL,
  [Dimensions] [nvarchar](50) NULL,
  [SKU] [nvarchar](50) NOT NULL,
  [ImageBase64] [varchar](max) NULL,
  [CreatedAt] [datetime] NOT NULL DEFAULT (getdate()),
  [UpdatedAt] [datetime] NULL,
  [IsDiscontinued] [bit] NOT NULL DEFAULT (0),
  PRIMARY KEY CLUSTERED ([ProductID]),
  UNIQUE ([SKU]),
  CONSTRAINT [CK_Products_UnitPrice] CHECK ([UnitPrice]>=(0))
)
ON [PRIMARY]
TEXTIMAGE_ON [PRIMARY]
GO

CREATE INDEX [IX_Products_CategoryID]
  ON [dbo].[Products] ([CategoryID])
  ON [PRIMARY]
GO

CREATE INDEX [IX_Products_CategoryID_UnitPrice]
  ON [dbo].[Products] ([CategoryID], [UnitPrice])
  ON [PRIMARY]
GO

ALTER TABLE [dbo].[Products]
  ADD FOREIGN KEY ([CategoryID]) REFERENCES [dbo].[Categories] ([CategoryID])
GO

ALTER TABLE [dbo].[Products]
  ADD FOREIGN KEY ([SupplierID]) REFERENCES [dbo].[Suppliers] ([SupplierID])
GO