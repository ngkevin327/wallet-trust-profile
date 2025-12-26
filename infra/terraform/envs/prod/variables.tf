variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "onchain-reputation"
}

variable "vpc_cidr" {
  type    = string
  default = "10.30.0.0/16"
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.small"
}

variable "redis_node_type" {
  type    = string
  default = "cache.t4g.small"
}

variable "api_certificate_arn" {
  type        = string
  description = "ACM certificate ARN for API HTTPS listener"
}

variable "web_certificate_arn" {
  type        = string
  description = "ACM certificate ARN for CloudFront (us-east-1)"
}

variable "domain_name" {
  type    = string
  default = "onchain-reputation.example"
}
