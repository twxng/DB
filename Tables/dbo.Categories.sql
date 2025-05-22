CREATE TABLE [dbo].[Categories] (
  [CategoryID] [int] IDENTITY,
  [CategoryName] [nvarchar](100) NOT NULL,
  [Description] [nvarchar](500) NULL,
  [ParentCategoryID] [int] NULL,
  [CreatedAt] [datetime] NOT NULL DEFAULT (getdate()),
  [IsActive] [bit] NOT NULL DEFAULT (1),
  PRIMARY KEY CLUSTERED ([CategoryID])
)
ON [PRIMARY]
GO

ALTER TABLE [dbo].[Categories]
  ADD FOREIGN KEY ([ParentCategoryID]) REFERENCES [dbo].[Categories] ([CategoryID])
GO