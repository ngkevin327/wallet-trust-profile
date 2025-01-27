resource "aws_secretsmanager_secret" "database_url" {
  name        = "${local.name_prefix}/database-url"
  description = "PostgreSQL connection string for API and worker"

  tags = {
    Name = "${local.name_prefix}-database-url"
  }
}

resource "aws_secretsmanager_secret" "redis_url" {
  name        = "${local.name_prefix}/redis-url"
  description = "Redis connection string for queues and cache"

  tags = {
    Name = "${local.name_prefix}-redis-url"
  }
}

resource "aws_secretsmanager_secret" "jwt_private_key" {
  name        = "${local.name_prefix}/jwt-private-key"
  description = "RS256 private key for API JWT signing"

  tags = {
    Name = "${local.name_prefix}-jwt-private-key"
  }
}

resource "aws_secretsmanager_secret" "alchemy_api_key" {
  name        = "${local.name_prefix}/alchemy-api-key"
  description = "Alchemy RPC API key for chain indexing"

  tags = {
    Name = "${local.name_prefix}-alchemy-api-key"
  }
}

output "secret_database_url_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}

output "secret_redis_url_arn" {
  value = aws_secretsmanager_secret.redis_url.arn
}

output "secret_jwt_key_arn" {
  value = aws_secretsmanager_secret.jwt_private_key.arn
}

output "secret_alchemy_arn" {
  value = aws_secretsmanager_secret.alchemy_api_key.arn
}

# Populate secret values manually after apply:
#   aws secretsmanager put-secret-value --secret-id <alchemy_arn> --secret-string "<api-key>"
# See documentation/runbooks/secrets-setup.md
