# Kubernetes Installation

We have different solution to install Homer on Kubernetes Cluster, each solution responds to a specific need. 

## Table of Contents

- [Helm Chart](#helm-chart)
- [Controller With CRDs](#controller-crds)
- [Controller With Ingress Annotations](#controller-annotations)
- [Operator](#Operator)
- [Security Context](#security-context)

## Helm Chart

To deploy Homer in Kubernetes

Thanks to [@djjudas21](https://github.com/djjudas21) [charts](https://github.com/djjudas21/charts/tree/main/charts/homer):

### Installation

```sh
helm repo add djjudas21 https://djjudas21.github.io/charts/
helm repo update djjudas21

# install with all defaults
helm install homer djjudas21/homer

# install with customisations
wget https://raw.githubusercontent.com/djjudas21/charts/main/charts/homer/values.yaml
# edit values.yaml
helm install homer djjudas21/homer -f values.yaml
```

## Controller CRDs

To deploy Homer in Kubernetes with [Custom Resources Definition](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/) to dynamic declaration for Homer Service

Thanks to [@jplanckeel](https://github.com/jplanckeel) [homer-k8s](https://github.com/bananaops/homer-k8s/tree/main/):

### Installation

```sh
helm repo add bananaops https://bananaops.github.io/homer-k8s/
helm repo update bananaops

# install with all defaults
helm install homer bananaops/homer-k8s

# install with customisations
wget https://raw.githubusercontent.com/bananaops/homer-k8s/main/helm/homer-k8s/values.yaml
# edit values.yaml
helm install homer bananaops/homer-k8s -f values.yaml
```

### Usage

- [usage](https://github.com/bananaops/homer-k8s/tree/main/?tab=readme-ov-file#crds-homerservices)

## Controller Annotations

To deploy Homer in Kubernetes with controller to check ingress annotation and modify homer configuration 

Thanks to [@paulfantom](https://github.com/paulfantom) [homer-reloader](https://github.com/paulfantom/homer-reloader/tree/main/):


## Operator

To deploy many Homer in Kubernetes with [Custom Resources Definition](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/)

Thanks to [@rajsinghtech](https://github.com/rajsinghtech) [homer-operator](https://github.com/rajsinghtech/homer-operator/tree/main/):


### Installation

```sh
# install with customisations
wget https://raw.githubusercontent.com/rajsinghtech/homer-operator/main/deploy/operator.yaml
# Apply operator file
kubectl apply -f operator.yaml
```

### Usage

- [usage](https://github.com/rajsinghtech/homer-operator?tab=readme-ov-file#usage)

## Security Context

The container starts as root to fix the ownership of the assets directory, then drops to `PUID`:`PGID` (default `1000`) before starting the web server, which never runs as root.

On Kubernetes you usually want to skip that mechanism entirely and set `runAsUser` instead, because `fsGroup` already solves volume ownership natively:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 1000
```

This is equivalent to the docker `--user` option: the container runs unprivileged from the start, `PUID` / `PGID` are ignored, and nothing is chowned for you, so the assets volume must already be readable and writable by that user. Use `fsGroup` to arrange that.

The Helm charts listed above already set `runAsUser`, so they are unaffected.

> [!IMPORTANT]
> The image does not declare a non-root user. Setting `runAsNonRoot: true` **without** a `runAsUser` will fail with `container has runAsNonRoot and image will run as root`, because the kubelet then checks the image itself. Always set `runAsUser` alongside it.

> [!NOTE]
> Setting `runAsUser` requires no capability at all, which is why it pairs naturally with `capabilities: drop: [ALL]` and the `restricted` pod security standard.
>
> Leaving the security context unset instead keeps the ownership fixing behavior, but then the container starts as root and needs the `CHOWN`, `SETUID` and `SETGID` capabilities (plus `DAC_OVERRIDE` if the assets volume is not readable by root). Dropping those makes the startup fail.
