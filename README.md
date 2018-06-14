# Homer
A very simple static HOMepage for your servER.
Add all your useful service, external links, notes... or anything.

If you need authentication support, you're on your own (it can be secured using a web server auth module or exposing it only through a VPN network / SSH tunneling, ...)

![screenshot](https://github.com/bastienwirtz/homer/blob/master/screenshot.png)

**How to build / install it? Where is the webpack config?**
There is no build system (😱), use it like that! It'meant to be stupid simple & zero maintenance required. just copy the static files somewhere, and visit the `index.html`.
 

## configuration

Title, icons, links, colors, and services can be configured in the `config.yml` file, using [yaml](http://yaml.org/) format.


```yaml
---
# Homepage configuration
# See https://fontawesome.com/v4.7.0/icons/ for icons options

title: "Simple homepage"
subtitle: "Homer"
logo: "assets/homer.png"

# Optional message
message:
  style: "is-warning"
  title: "Optional message!"
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus mi, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet fringilla. Nullam gravida purus diam, et dictum felis venenatis efficitur. Aenean ac eleifend lacus, in mollis lectus. Donec sodales, arcu et sollicitudin porttitor, tortor urna tempor ligula."

# Optional navbar
links:
  - name: "ansible"
    icon: "fa-github"
    url: "https://github.com/xxxxx/ansible/"
  - name: "Wiki"
    icon: "fa-book"
    url: "https://wiki.xxxxxx.com/"

# Services
# First level array represent a group.
# Leave only a "items" key if not using group (group name & icon are optional, section separation will not be displayed).
services:
  - name: "DevOps"
    icon: "fa-code-fork"
    items:
      - name: "Jenkins"
        logo: "/assets/tools/jenkins.png"
        subtitle: "Continuous integration server"
        tag: "CI"
        url: "#"
      - name: "RabbitMQ Management"
        logo: "/assets/tools/rabbitmq.png"
        subtitle: "Manage & monitor RabbitMQ server"
        tag: "haproxy"
        url: "#"
  - name: "Monitoring"
    icon: "fa-heartbeat"
    items:
      - name: "M/Monit"
        logo: "/assets/tools/monit.png"
        subtitle: "Monitor & manage all monit enabled hosts"
        tag: "monit"
        url: "#"
      - name: "Grafana"
        logo: "/assets/tools/grafana.png"
        subtitle: "Metric analytics & dashboards"
        url: "#"
      - name: "Kibana"
        logo: "/assets/tools/elastic.png"
        subtitle: "Explore & visualize logs"
        tag: "elk"
        url: "#"
      - name: "Website monitoring"
        logo: "/assets/tools/pingdom.png"
        subtitle: "Pingdom public reports overview"
        tag: "CI"
        url: "#"

```