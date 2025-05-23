using System;

namespace GarderToolsServer.DTOs
{
	public class UserListDto
	{
		public int UserId { get; set; }
		public string Username { get; set; } = string.Empty;
		public string Email { get; set; } = string.Empty;
		public string FullName { get; set; } = string.Empty;
		public string Phone { get; set; } = string.Empty;
		public string Role { get; set; } = string.Empty;
		public bool IsActive { get; set; }
		public DateTime RegistrationDate { get; set; }
		public DateTime? LastLoginDate { get; set; }
		public int OrderCount { get; set; }
	}

	public class UserListResponseDto
	{
		public List<UserListDto> Users { get; set; } = new();
		public int TotalCount { get; set; }
	}
}