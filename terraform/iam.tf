data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = [
      "sts:AssumeRole"
    ]

    principals {
      type = "Service"

      identifiers = [
        "lambda.amazonaws.com"
      ]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${local.name}-lambda-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

data "aws_iam_policy_document" "lambda_secret" {
  statement {
    actions = [
      "secretsmanager:GetSecretValue"
    ]

    resources = [
      aws_secretsmanager_secret.db.arn
    ]
  }
}

resource "aws_iam_role_policy" "lambda_secret" {
  name   = "${local.name}-secret-read"
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.lambda_secret.json
}

data "aws_iam_policy_document" "github_assume" {
  count = var.github_repository == "" ? 0 : 1

  statement {
    actions = [
      "sts:AssumeRoleWithWebIdentity"
    ]

    principals {
      type = "Federated"

      identifiers = [
        aws_iam_openid_connect_provider.github[0].arn
      ]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"

      values = [
        "repo:${var.github_repository}:ref:refs/heads/main"
      ]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"

      values = [
        "sts.amazonaws.com"
      ]
    }
  }
}

data "tls_certificate" "github" {
  url = "https://token.actions.githubusercontent.com"
}

resource "aws_iam_openid_connect_provider" "github" {
  count = var.github_repository == "" ? 0 : 1

  url = "https://token.actions.githubusercontent.com"

  client_id_list = [
    "sts.amazonaws.com"
  ]

  thumbprint_list = [
    data.tls_certificate.github.certificates[0].sha1_fingerprint
  ]
}

resource "aws_iam_role" "github_deploy" {
  count = var.github_repository == "" ? 0 : 1

  name = "${local.name}-github-deploy"

  assume_role_policy = data.aws_iam_policy_document.github_assume[0].json
}

data "aws_iam_policy_document" "github_permissions" {
  count = var.github_repository == "" ? 0 : 1

  statement {
    actions = [
      "s3:*",
      "cloudfront:CreateInvalidation",
      "cloudfront:GetDistribution",
      "cloudfront:GetDistributionConfig",
      "lambda:*",
      "apigateway:*",
      "cognito-idp:*",
      "secretsmanager:DescribeSecret",
      "rds:Describe*",
      "ec2:Describe*",
      "iam:PassRole",
      "logs:*"
    ]

    resources = [
      "*"
    ]
  }
}

resource "aws_iam_role_policy" "github_permissions" {
  count = var.github_repository == "" ? 0 : 1

  role = aws_iam_role.github_deploy[0].id

  policy = data.aws_iam_policy_document.github_permissions[0].json
}