# Kubernetes Installation

We have different solution to install Homer on Kubernetes Cluster, each solution responds to a specific need. 


## Table of Contents

- [Helm Chart](#helm-chart)
- [Controller With CRDs](#controller-crds)
- [Controller With Ingress Annotations](#controller-annotations)
- [Operator](#Operator)

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

To deploy Homer in Kubernetes with controller to check ingress annoation and modify homer configuration 

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




