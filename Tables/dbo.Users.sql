CREATE TABLE [dbo].[Users] (
  [UserId] [int] IDENTITY,
  [Username] [nvarchar](50) NOT NULL,
  [Email] [nvarchar](100) NOT NULL,
  [PasswordHash] [nvarchar](max) NOT NULL,
  [Role] [nvarchar](20) NOT NULL DEFAULT ('Customer'),
  [FirstName] [nvarchar](50) NULL,
  [LastName] [nvarchar](50) NULL,
  [Phone] [nvarchar](20) NULL,
  [Address] [nvarchar](200) NULL,
  [City] [nvarchar](50) NULL,
  [Country] [nvarchar](50) NULL,
  [PostalCode] [nvarchar](20) NULL,
  [RegistrationDate] [datetime] NOT NULL DEFAULT (getdate()),
  [IsActive] [bit] NOT NULL DEFAULT (1),
  [CustomerId] [int] NULL,
  [LastLoginDate ] [datetime] NULL,
  PRIMARY KEY CLUSTERED ([UserId]),
  UNIQUE ([Email]),
  CONSTRAINT [CK_Users_Role] CHECK ([Role]='Admin' OR [Role]='Customer' OR [Role]='Manager')
)
ON [PRIMARY]
TEXTIMAGE_ON [PRIMARY]
GO

CREATE INDEX [IX_Users_Email]
  ON [dbo].[Users] ([Email])
  ON [PRIMARY]
GO

ALTER TABLE [dbo].[Users]
  ADD CONSTRAINT [FK_Users_Customers] FOREIGN KEY ([CustomerId]) REFERENCES [dbo].[Customers] ([CustomerID])
GO