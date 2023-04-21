data "aws_route53_zone" "this" {
  name = var.hosted_zone_name
}

resource "aws_route53_record" "MX_google_com" {
  zone_id = data.aws_route53_zone.this.id
  name    = ""
  type    = "MX"
  ttl     = "300"
  records = [
    "1 aspmx.l.google.com",
    "5 alt1.aspmx.l.google.com",
    "5 alt2.aspmx.l.google.com",
    "10 alt3.aspmx.l.google.com",
    "10 alt4.aspmx.l.google.com",
  ]
}

resource "aws_route53_record" "TXT_google_com" {
  zone_id = data.aws_route53_zone.this.id
  name    = ""
  type    = "TXT"
  ttl     = "300"
  records = [
    "google-site-verification=iuEtkoyW9yMUoZyGisXvqxIAg3wYr5CZzaKw43ZavG0",
    "v=spf1 include:dc-aa8e722993._spfm.tworentals.com ~all",
    "dc-aa8e722993._spfm v=spf1 include:_spf.google.com ~all"
  ]
}
