variable "domain_name" {
  description = "Primary apex domain"
  type        = string
  default     = ""
}

variable "api_alb_dns_name" {
  description = "API ALB DNS name for api subdomain record"
  type        = string
  default     = ""
}

variable "api_alb_zone_id" {
  description = "API ALB hosted zone ID"
  type        = string
  default     = ""
}

resource "aws_route53_zone" "main" {
  count = var.domain_name != "" ? 1 : 0
  name  = var.domain_name

  tags = {
    Name = "${local.name_prefix}-zone"
  }
}

resource "aws_route53_record" "api" {
  count   = var.domain_name != "" && var.api_alb_dns_name != "" ? 1 : 0
  zone_id = aws_route53_zone.main[0].zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.api_alb_dns_name
    zone_id                = var.api_alb_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "www_redirect" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = aws_route53_zone.main[0].zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.web[0].domain_name
    zone_id                = aws_cloudfront_distribution.web[0].hosted_zone_id
    evaluate_target_health = false
  }
}
