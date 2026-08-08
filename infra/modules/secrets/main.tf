resource "aws_secretsmanager_secret" "client_id" {
  name                    = "${var.name}/sf-client-id"
  description             = "Salesforce OAuth client ID for ${var.name}"
  recovery_window_in_days = 0

  tags = merge(var.tags, { Name = "${var.name}/sf-client-id" })
}

resource "aws_secretsmanager_secret" "client_secret" {
  name                    = "${var.name}/sf-client-secret"
  description             = "Salesforce OAuth client secret for ${var.name}"
  recovery_window_in_days = 0

  tags = merge(var.tags, { Name = "${var.name}/sf-client-secret" })
}
