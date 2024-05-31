resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnets"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${local.name_prefix}-db-subnet-group"
  }
}

resource "aws_db_parameter_group" "postgres15" {
  name   = "${local.name_prefix}-pg15"
  family = "postgres15"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  tags = {
    Name = "${local.name_prefix}-pg15-params"
  }
}

resource "aws_db_instance" "main" {
  identifier             = "${local.name_prefix}-postgres"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  max_allocated_storage  = 100
  storage_encrypted      = true
  db_name                = "reputation"
  username               = "reputation_admin"
  manage_master_user_password = true
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.data.id]
  parameter_group_name   = aws_db_parameter_group.postgres15.name
  multi_az               = var.environment == "prod"
  backup_retention_period = 7
  skip_final_snapshot    = var.environment != "prod"
  deletion_protection    = var.environment == "prod"
  publicly_accessible    = false

  tags = {
    Name = "${local.name_prefix}-postgres"
  }
}

output "rds_endpoint" {
  value     = aws_db_instance.main.endpoint
  sensitive = true
}
