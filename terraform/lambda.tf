resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role=aws_iam_role.lambda.name
  policy_arn="arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

data "archive_file" "lambda" {
  for_each = toset(local.lambda_names)
  type="zip"
  source_file="${path.module}/../backend/build/${each.key}.mjs"
  output_path="${path.module}/.build/${each.key}.zip"
}

resource "aws_lambda_function" "api" {
  for_each = toset(local.lambda_names)
  function_name="${local.name}-${each.key}"
  role=aws_iam_role.lambda.arn
  handler="${each.key}.handler"
  runtime="nodejs22.x"
  filename=data.archive_file.lambda[each.key].output_path
  source_code_hash=data.archive_file.lambda[each.key].output_base64sha256
  timeout = each.key == "migrate" ? 60 : 15
  memory_size = 512
  architectures=["arm64"]
  environment {
    variables={
      NODE_ENV=var.environment
      AWS_REGION=var.aws_region
      DB_SECRET_ARN=aws_secretsmanager_secret.db.arn
      DB_HOST=aws_db_instance.postgres.address
      DB_PORT="5432"
      DB_NAME=var.db_name
      CORS_ORIGIN=var.cors_origin
    }
  }
  vpc_config {
    subnet_ids=module.vpc.private_subnets
    security_group_ids=[aws_security_group.lambda.id]
  }
  depends_on=[aws_cloudwatch_log_group.lambda]
}
