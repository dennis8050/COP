variable "aws_region" { type=string default ="us-east-1" }
variable "environment" { type=string default="development" validation { condition=contains(["development","staging","production"],var.environment) error_message="environment must be development, staging or production" } }
variable "project_name" { type=string default="church-attendance" }
variable "db_name" { type=string default="church_attendance" }
variable "db_username" { type=string default="churchapp" }
variable "db_instance_class" { type=string default="db.t4g.micro" }
variable "db_allocated_storage" { type=number default=20 }
variable "cors_origin" { type=string default="http://localhost:5173" }
variable "frontend_bucket_name" { type=string default="" }
variable "github_repository" { type=string default="" description="owner/repo for GitHub OIDC deployment, e.g. org/church-attendance" }
variable "enable_nat_gateway_per_az" { type=bool default=false }
