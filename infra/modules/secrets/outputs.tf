output "client_id_arn" {
  value = aws_secretsmanager_secret.client_id.arn
}

output "client_secret_arn" {
  value = aws_secretsmanager_secret.client_secret.arn
}
