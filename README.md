# Homer
A dead simple static **HOM**epage for your serv**ER** to keep your services on hand, from a simple `yaml` configuration file.

**Check out the live demo [here](https://homer-demo.netlify.com/).**

If you need authentication support, you're on your own (it can be secured using a web server auth module or exposing it only through a VPN network / SSH tunnel, ...)

![screenshot](https://raw.github.com/bastienwirtz/homer/master/screenshot.png)

## Roadmap

- [ ] Colors / theme customization
- [ ] Enable PWA support (making possible to "install" - add to homescreen - it)
- [ ] Improve maintenability (external library import & service workers cached file list.)

## Installation

### Using docker

```sh
sudo docker run -p 8080:8080 -v /your/local/config.yml:/www/config.yml -v /your/local/assets/:/www/assets b4bz/homer:latest
```

### Manually

**How to build / install it?** There is no build system (😱), use it like that! It's meant to be stupid simple & zero maintenance required. Just copy the static files somewhere, and visit the `index.html`.


## Configuration

Title, icons, links, colors, and services can be configured in the `config.yml` file, using [yaml](http://yaml.org/) format.


```yaml
---
# Homepage configuration
# See https://fontawesome.com/icons for icons options

title: "Simple homepage"
subtitle: "Homer"
logo: "assets/homer.png"
# Alternatively a fa icon can be provided:
# icon: "fas fa-skull-crossbones"  
footer: '<p>Created with <span class="has-text-danger">❤️</span> with <a href="https://bulma.io/">bulma</a>, <a href="https://vuejs.org/">vuejs</a> & <a href="https://fontawesome.com/">font awesome</a> // Fork me on <a href="https://github.com/bastienwirtz/homer"><i class="fab fa-github-alt"></i></a></p>'  # set false if you want to hide it.header:

# Optional message
message:
  # url: "https://<my-api-endpoint>" # Can fetch information from an endpoint to override value below.
  style: "is-warning"
  title: "Optional message!"
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque risus mi, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet fringilla. Nullam gravida purus diam, et dictum felis venenatis efficitur. Aenean ac eleifend lacus, in mollis lectus. Donec sodales, arcu et sollicitudin porttitor, tortor urna tempor ligula."

# Optional navbar
# links: [] # Allows for navbar (dark mode, layout, and search) without any links
links:
  - name: "ansible"
    icon: "fa-github"
    url: "https://github.com/xxxxx/ansible/"
    target: '_blank' # optionnal html a tag target attribute
  - name: "Wiki"
    icon: "fa-book"
    url: "https://wiki.xxxxxx.com/"

# Services
# First level array represent a group.
# Leave only a "items" key if not using group (group name, icon & tagstyle are optional, section separation will not be displayed).
services:
  - name: "DevOps"
    icon: "fa-code-fork"
    items:
      - name: "Jenkins"
        logo: "/assets/tools/jenkins.png"
        # Alternatively a fa icon can be provided:
        # icon: "fab fa-jenkins"
        subtitle: "Continuous integration server"
        tag: "CI"
        url: "#"
        target: '_blank' # optionnal html a tag target attribute
      - name: "RabbitMQ Management"
        logo: "/assets/tools/rabbitmq.png"
        subtitle: "Manage & monitor RabbitMQ server"
        tag: "haproxy"
        # Optional tagstyle
        tagstyle: "is-success"
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

If you choose to fetch message information from an endpoint, the output format should be:

```json
{
	"style": null,
	"title": "Lorem ipsum 42",
	"content": "LA LA LA Lorem ipsum dolor sit amet, ....."
}
```

`null` value or missing keys will be ignored and value from the `config.yml` will be used if available.
Empty values (either in `config.yml` or the endpoint data) will hide the element (ex: set `"title": ""` to hide the title bar).
