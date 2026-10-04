resource "aws_s3_bucket" "frontend" {
  bucket = var.frontend_bucket_name != "" ? var.frontend_bucket_name : "${local.name}-${data.aws_caller_identity.current.account_id}"

  force_destroy = var.environment != "production"
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}