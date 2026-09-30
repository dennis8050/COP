locals {
  name = "${var.project_name}-${var.environment}"
  lambda_names = [
    "getMembers","getMember","createMember","updateMember","deactivateMember",
    "getAttendance","recordAttendance","updateAttendance","getMemberAttendanceHistory",
    "getDashboardStatistics","getAttendanceReport","migrate"
  ]
}

resource "aws_cloudwatch_log_group" "lambda" {
  for_each = toset(local.lambda_names)
  name = "/aws/lambda/${local.name}-${each.key}"
  retention_in_days = var.environment == "production" ? 90 : 30
}
