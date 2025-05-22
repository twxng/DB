SET QUOTED_IDENTIFIER, ANSI_NULLS ON
GO
CREATE FUNCTION [dbo].[CalculateAverageProductRating] (@ProductID INT)
RETURNS DECIMAL(3, 2)
AS
BEGIN
    DECLARE @AvgRating DECIMAL(3, 2);
    
    SELECT @AvgRating = AVG(CAST(Rating AS DECIMAL(3, 2)))
    FROM Reviews
    WHERE ProductID = @ProductID AND IsApproved = 1;
    
	IF @AvgRating IS NULL
        SET @AvgRating = 0;
        
    RETURN @AvgRating;
END;
GO