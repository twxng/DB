CREATE TABLE [dbo].[Customers] (
  [CustomerID] [int] IDENTITY,
  [FirstName] [nvarchar](50) NOT NULL,
  [LastName] [nvarchar](50) NOT NULL,
  [Email] [nvarchar](100) NOT NULL,
  [Phone] [nvarchar](20) NOT NULL,
  [Address] [nvarchar](200) NULL,
  [City] [nvarchar](50) NULL,
  [Country] [nvarchar](50) NULL,
  [PostalCode] [nvarchar](20) NULL,
  [RegistrationDate] [datetime] NOT NULL DEFAULT (getdate()),
  [BirthDate] [date] NULL,
  [LoyaltyPoints] [int] NOT NULL DEFAULT (0),
  [IsSubscribed] [bit] NOT NULL DEFAULT (0),
  PRIMARY KEY CLUSTERED ([CustomerID]),
  UNIQUE ([Email]),
  CONSTRAINT [CK_Customers_BirthDate] CHECK ([BirthDate]<getdate()),
  CONSTRAINT [CK_Customers_Email] CHECK ([Email] like '%_@__%.__%')
)
ON [PRIMARY]
GO