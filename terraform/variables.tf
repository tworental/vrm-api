variable "region" {
  type        = string
  default     = "us-east-1"
  description = "Default AWS region"
}

variable "name" {
  type        = string
  default     = "app"
  description = "Solution name, e.g. 'app' or 'jenkins'"
}

variable "namespace" {
  type        = string
  default     = "api"
  description = "Namespace, which could be your organization name or abbreviation, e.g. 'eg' or 'cp'"
}

variable "label_order" {
  type        = list(string)
  default     = ["environment", "namespace", "stage", "name", "attributes"]
  description = <<-EOT
    The naming order of the id output and Name tag.
    Defaults to ["namespace", "environment", "stage", "name", "attributes"].
    You can omit any of the 5 elements, but at least one must be present.
  EOT
}

variable "tags" {
  type = map(string)
  default = {
    Terraform    = true
    Organization = "TwoRentals"
  }
  description = "Additional tags (e.g. `map('BusinessUnit','XYZ')`"
}
