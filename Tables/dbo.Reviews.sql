CREATE TABLE [dbo].[Reviews] (
  [ReviewID] [int] IDENTITY,
  [ProductID] [int] NOT NULL,
  [CustomerID] [int] NULL,
  [Rating] [tinyint] NULL,
  [Comment] [nvarchar](1000) NULL,
  [ReviewDate] [datetime] NOT NULL DEFAULT (getdate()),
  [IsVerifiedPurchase] [bit] NOT NULL DEFAULT (0),
  [IsApproved] [bit] NOT NULL DEFAULT (0),
  [UserID] [int] NOT NULL,
  [ParentReviewID] [int] NULL,
  PRIMARY KEY CLUSTERED ([ReviewID]),
  CONSTRAINT [CK_Reviews_Rating] CHECK ([Rating]>=(0) AND [Rating]<=(5))
)
ON [PRIMARY]
GO

ALTER TABLE [dbo].[Reviews]
  ADD FOREIGN KEY ([CustomerID]) REFERENCES [dbo].[Customers] ([CustomerID])
GO

ALTER TABLE [dbo].[Reviews]
  ADD FOREIGN KEY ([ProductID]) REFERENCES [dbo].[Products] ([ProductID])
GO

ALTER TABLE [dbo].[Reviews]
  ADD CONSTRAINT [FK_Reviews_ParentReview] FOREIGN KEY ([ParentReviewID]) REFERENCES [dbo].[Reviews] ([ReviewID])
GO

ALTER TABLE [dbo].[Reviews]
  ADD CONSTRAINT [FK_Reviews_Users] FOREIGN KEY ([UserID]) REFERENCES [dbo].[Users] ([UserId])
GO