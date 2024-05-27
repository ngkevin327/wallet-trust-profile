variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "staging"
}

variable "project_name" {
  description = "Short project name used in resource naming"
  type        = string
  default     = "onchain-reputation"
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

output "environment" {
  value = var.environment
}

output "name_prefix" {
  value = local.name_prefix
}
