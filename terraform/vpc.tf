data "aws_availability_zones" "available" { state = "available" }

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.21.0"

  name = local.name
  cidr = "10.40.0.0/16"

  azs             = slice(data.aws_availability_zones.available.names, 0, 2)
  private_subnets = ["10.40.11.0/24", "10.40.12.0/24"]
  public_subnets  = ["10.40.101.0/24", "10.40.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = !var.enable_nat_gateway_per_az

  create_database_subnet_group = true
  database_subnets             = ["10.40.21.0/24", "10.40.22.0/24"]
  enable_dns_hostnames         = true
  enable_dns_support           = true
}
