variable "alert_sns_topic_arn" {
  description = "SNS topic for PagerDuty/Slack routing"
  type        = string
  default     = ""
}

variable "on_call_runbook_url" {
  description = "Runbook URL embedded in alert payloads"
  type        = string
  default     = "https://github.com/onchain-reputation/runbooks/blob/main/documentation/runbooks/on-call.md"
}

resource "aws_cloudwatch_metric_alarm" "api_5xx_rate" {
  count = var.environment == "prod" ? 1 : 0

  alarm_name          = "${local.name_prefix}-api-5xx-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5xxErrorRate"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Average"
  threshold           = 1
  alarm_description   = "API 5xx rate > 1% for 5m. Runbook: ${var.on_call_runbook_url}"
  treat_missing_data  = "notBreaching"

  alarm_actions = var.alert_sns_topic_arn != "" ? [var.alert_sns_topic_arn] : []
}

resource "aws_cloudwatch_metric_alarm" "indexer_dlq_depth" {
  count = var.environment != "dev" ? 1 : 0

  alarm_name          = "${local.name_prefix}-indexer-dlq-depth"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Maximum"
  threshold           = 0
  alarm_description   = "Indexer DLQ > 0 for 15m. Runbook: ${var.on_call_runbook_url}"
  treat_missing_data  = "notBreaching"

  dimensions = {
    QueueName = "${local.name_prefix}-indexer-dlq"
  }

  alarm_actions = var.alert_sns_topic_arn != "" ? [var.alert_sns_topic_arn] : []
}
