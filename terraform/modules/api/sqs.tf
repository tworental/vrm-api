resource "aws_sqs_queue" "reminder_emails" {
  name = "${local.prefix}-reminder-emails"

  // quotes must be filled in < 90s
  delay_seconds = 90

  // after 3mins, stop retrying
  message_retention_seconds = 360

  // if a message fails 3x, send it to the DLQ
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.reminder_emails_dlq.arn
    maxReceiveCount     = 3
  })

  tags = var.tags
}

resource "aws_sqs_queue" "reminder_sms" {
  name = "${local.prefix}-reminder-sms"

  // quotes must be filled in < 90s
  delay_seconds = 90

  // after 3mins, stop retrying
  message_retention_seconds = 360

  // if a message fails 3x, send it to the DLQ
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.reminder_sms_dlq.arn
    maxReceiveCount     = 3
  })

  tags = var.tags
}

resource "aws_sqs_queue" "reminder_emails_dlq" {
  name = "${local.prefix}-reminder-emails-dlq"
  tags = var.tags
}

resource "aws_sqs_queue" "reminder_sms_dlq" {
  name = "${local.prefix}-reminder-sms-dlq"
  tags = var.tags
}
