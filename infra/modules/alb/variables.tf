variable "name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "public_subnet_ids" {
  type = list(string)
}

variable "security_group_id" {
  type = string
}

variable "frontend_port" {
  type = number
}

variable "backend_port" {
  type = number
}

variable "frontend_health_path" {
  type = string
}

variable "backend_health_path" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
