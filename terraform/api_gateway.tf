resource "aws_api_gateway_rest_api" "api" {
  name = local.name
  endpoint_configuration { types = ["REGIONAL"] }
}

resource "aws_api_gateway_authorizer" "cognito" {
  name = "${local.name}-cognito"
  rest_api_id = aws_api_gateway_rest_api.api.id
  type = "COGNITO_USER_POOLS"
  provider_arns = [aws_cognito_user_pool.main.arn]
  identity_source = "method.request.header.Authorization"
}

# Explicit resource hierarchy keeps nested routes such as
# /members/{id}/attendance valid in API Gateway.
resource "aws_api_gateway_resource" "members" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id = aws_api_gateway_rest_api.api.root_resource_id
  path_part = "members"
}

resource "aws_api_gateway_resource" "member_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id = aws_api_gateway_resource.members.id
  path_part = "{id}"
}

resource "aws_api_gateway_resource" "member_attendance" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id = aws_api_gateway_resource.member_id.id
  path_part = "attendance"
}

resource "aws_api_gateway_resource" "attendance" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id = aws_api_gateway_rest_api.api.root_resource_id
  path_part = "attendance"
}

resource "aws_api_gateway_resource" "attendance_id" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id = aws_api_gateway_resource.attendance.id
  path_part = "{id}"
}

resource "aws_api_gateway_resource" "dashboard" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id = aws_api_gateway_rest_api.api.root_resource_id
  path_part = "dashboard"
}

resource "aws_api_gateway_resource" "dashboard_statistics" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id = aws_api_gateway_resource.dashboard.id
  path_part = "statistics"
}

resource "aws_api_gateway_resource" "reports" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id = aws_api_gateway_rest_api.api.root_resource_id
  path_part = "reports"
}

resource "aws_api_gateway_resource" "reports_attendance" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  parent_id = aws_api_gateway_resource.reports.id
  path_part = "attendance"
}

locals {
  route_resources = {
    getMembers                 = aws_api_gateway_resource.members.id
    getMember                  = aws_api_gateway_resource.member_id.id
    createMember               = aws_api_gateway_resource.members.id
    updateMember               = aws_api_gateway_resource.member_id.id
    deactivateMember           = aws_api_gateway_resource.member_id.id
    getAttendance              = aws_api_gateway_resource.attendance.id
    recordAttendance           = aws_api_gateway_resource.attendance.id
    updateAttendance           = aws_api_gateway_resource.attendance_id.id
    getMemberAttendanceHistory = aws_api_gateway_resource.member_attendance.id
    getDashboardStatistics     = aws_api_gateway_resource.dashboard_statistics.id
    getAttendanceReport        = aws_api_gateway_resource.reports_attendance.id
  }

  route_methods = {
    getMembers                 = "GET"
    getMember                  = "GET"
    createMember               = "POST"
    updateMember               = "PUT"
    deactivateMember           = "PATCH"
    getAttendance              = "GET"
    recordAttendance           = "POST"
    updateAttendance           = "PUT"
    getMemberAttendanceHistory = "GET"
    getDashboardStatistics     = "GET"
    getAttendanceReport        = "GET"
  }
}

resource "aws_api_gateway_method" "method" {
  for_each = local.route_resources
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = each.value
  http_method = local.route_methods[each.key]
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
  request_parameters = {
    "method.request.path.id" = contains([
      "getMember","updateMember","deactivateMember","updateAttendance",
      "getMemberAttendanceHistory"
    ], each.key) ? true : false
  }
}

resource "aws_api_gateway_integration" "integration" {
  for_each = local.route_resources
  rest_api_id = aws_api_gateway_rest_api.api.id
  resource_id = aws_api_gateway_method.method[each.key].resource_id
  http_method = aws_api_gateway_method.method[each.key].http_method
  integration_http_method = "POST"
  type = "AWS_PROXY"
  uri = aws_lambda_function.api[each.key].invoke_arn
}

resource "aws_lambda_permission" "api" {
  for_each = local.route_resources
  statement_id = "${each.key}-invoke"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api[each.key].function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_rest_api.api.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "api" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  triggers = {
    redeployment = sha1(jsonencode([
      for k, v in aws_api_gateway_method.method : v.id
    ]))
  }
  depends_on = [aws_api_gateway_integration.integration]
  lifecycle { create_before_destroy = true }
}

resource "aws_api_gateway_stage" "stage" {
  rest_api_id = aws_api_gateway_rest_api.api.id
  deployment_id = aws_api_gateway_deployment.api.id
  stage_name = var.environment
}
