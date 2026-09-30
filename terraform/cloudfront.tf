resource "aws_cloudfront_origin_access_control" "frontend" {
  name="${local.name}-oac"
  origin_access_control_origin_type="s3"
  signing_behavior="always"
  signing_protocol="sigv4"
}
resource "aws_cloudfront_distribution" "frontend" {
  enabled=true
  default_root_object="index.html"
  origin {
    domain_name=aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id="s3-${aws_s3_bucket.frontend.id}"
    origin_access_control_id=aws_cloudfront_origin_access_control.frontend.id
  }
  default_cache_behavior {
    allowed_methods=["GET","HEAD","OPTIONS"]
    cached_methods=["GET","HEAD","OPTIONS"]
    target_origin_id="s3-${aws_s3_bucket.frontend.id}"
    viewer_protocol_policy="redirect-to-https"
    forwarded_values { query_string=false; cookies { forward="none" } }
  }
  custom_error_response { error_code=403 response_code=200 response_page_path="/index.html" }
  custom_error_response { error_code=404 response_code=200 response_page_path="/index.html" }
  restrictions { geo_restriction { restriction_type="none" } }
  viewer_certificate { cloudfront_default_certificate=true }
}
data "aws_iam_policy_document" "cloudfront_s3" {
  statement {
    actions=["s3:GetObject"]
    resources=["${aws_s3_bucket.frontend.arn}/*"]
    principals { type="Service" identifiers=["cloudfront.amazonaws.com"] }
    condition { test="StringEquals" variable="AWS:SourceArn" values=[aws_cloudfront_distribution.frontend.arn] }
  }
}
resource "aws_s3_bucket_policy" "frontend" { bucket=aws_s3_bucket.frontend.id; policy=data.aws_iam_policy_document.cloudfront_s3.json }
