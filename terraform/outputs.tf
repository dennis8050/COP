output "api_gateway_url" { value="https://${aws_api_gateway_rest_api.api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.stage.stage_name}" }
output "frontend_s3_bucket" { value=aws_s3_bucket.frontend.bucket }
output "cloudfront_domain" { value=aws_cloudfront_distribution.frontend.domain_name }
output "rds_endpoint" { value=aws_db_instance.postgres.address }
output "db_secret_arn" { value=aws_secretsmanager_secret.db.arn }
output "cognito_user_pool_id" { value=aws_cognito_user_pool.main.id }
output "cognito_client_id" { value=aws_cognito_user_pool_client.web.id }
output "github_deploy_role_arn" { value=var.github_repository=="" ? null : aws_iam_role.github_deploy[0].arn }
