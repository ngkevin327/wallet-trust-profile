terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
  }

  backend "s3" {
    bucket         = "onchain-reputation-tfstate-prod"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "onchain-reputation-tf-locks-prod"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "prod"
      ManagedBy   = "terraform"
    }
  }
}

locals {
  name_prefix = "${var.project_name}-prod"
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "prod" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "${local.name_prefix}-vpc" }
}

resource "aws_subnet" "prod_private" {
  count             = 2
  vpc_id            = aws_vpc.prod.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${local.name_prefix}-private-${count.index + 1}"
    Tier = "private"
  }
}

resource "aws_subnet" "prod_public" {
  count                   = 2
  vpc_id                  = aws_vpc.prod.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.name_prefix}-public-${count.index + 1}"
    Tier = "public"
  }
}

resource "aws_security_group" "prod_data" {
  name        = "${local.name_prefix}-data"
  description = "Production data plane — no public ingress"
  vpc_id      = aws_vpc.prod.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name_prefix}-data-sg" }
}

resource "aws_db_subnet_group" "prod" {
  name       = "${local.name_prefix}-db"
  subnet_ids = aws_subnet.prod_private[*].id
}

resource "aws_db_instance" "prod" {
  identifier                  = "${local.name_prefix}-postgres"
  engine                      = "postgres"
  engine_version              = "15"
  instance_class              = var.db_instance_class
  allocated_storage           = 50
  max_allocated_storage       = 200
  storage_encrypted           = true
  db_name                     = "reputation"
  username                    = "reputation_admin"
  manage_master_user_password = true
  db_subnet_group_name        = aws_db_subnet_group.prod.name
  vpc_security_group_ids      = [aws_security_group.prod_data.id]
  multi_az                    = true
  backup_retention_period     = 14
  deletion_protection         = true
  skip_final_snapshot         = false
  publicly_accessible         = false

  tags = { Name = "${local.name_prefix}-postgres" }
}

resource "aws_elasticache_subnet_group" "prod" {
  name       = "${local.name_prefix}-redis"
  subnet_ids = aws_subnet.prod_private[*].id
}

resource "aws_elasticache_replication_group" "prod" {
  replication_group_id       = "${local.name_prefix}-redis"
  description                = "Production Redis — cache + queues"
  engine                     = "redis"
  engine_version             = "7.1"
  node_type                  = var.redis_node_type
  num_cache_clusters         = 2
  subnet_group_name          = aws_elasticache_subnet_group.prod.name
  security_group_ids         = [aws_security_group.prod_data.id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  automatic_failover_enabled = true

  tags = { Name = "${local.name_prefix}-redis" }
}

output "environment" {
  value = "prod"
}

output "rds_endpoint" {
  value     = aws_db_instance.prod.endpoint
  sensitive = true
}

output "redis_endpoint" {
  value     = aws_elasticache_replication_group.prod.primary_endpoint_address
  sensitive = true
}

output "vpc_id" {
  value = aws_vpc.prod.id
}
