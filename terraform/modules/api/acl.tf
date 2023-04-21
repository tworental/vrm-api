data "aws_network_acls" "public" {
  filter {
    name   = "association.subnet-id"
    values = module.subnets.public_subnet_ids
  }
}

resource "aws_network_acl_rule" "ingress" {
  count          = length(local.ip_blacklist)
  network_acl_id = element(tolist(data.aws_network_acls.public.ids), 0)
  rule_number    = 25
  protocol       = -1
  rule_action    = "deny"
  cidr_block     = "${element(local.ip_blacklist, count.index)}/32"
}