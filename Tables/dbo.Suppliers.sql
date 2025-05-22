CREATE TABLE [dbo].[Suppliers] (
  [SupplierID] [int] IDENTITY,
  [CompanyName] [nvarchar](100) NOT NULL,
  [ContactPerson] [nvarchar](100) NULL,
  [Email] [nvarchar](100) NOT NULL,
  [Phone] [nvarchar](20) NOT NULL,
  [Address] [nvarchar](200) NOT NULL,
  [City] [nvarchar](50) NOT NULL,
  [Country] [nvarchar](50) NOT NULL,
  [PostalCode] [nvarchar](20) NULL,
  [Website] [nvarchar](100) NULL,
  [CreatedAt] [datetime] NOT NULL DEFAULT (getdate()),
  [IsActive] [bit] NOT NULL DEFAULT (1),
  PRIMARY KEY CLUSTERED ([SupplierID]),
  CONSTRAINT [CK_Suppliers_Email] CHECK ([Email] like '%_@__%.__%'),
  CONSTRAINT [CK_Suppliers_Phone] CHECK (len([Phone])>=(10))
)
ON [PRIMARY]
GO