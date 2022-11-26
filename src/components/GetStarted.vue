<template>
  <article>
    <div class="m-6 has-text-centered py-6">
      <p class="is-size-5 mb-0">No configured service found!</p>
      <p>Check out the documentation to start building your Homer dashboard.</p>
      <p>
        <a
          class="button is-primary mt-5 has-text-weight-bold"
          href="https://github.com/bastienwirtz/homer/blob/main/docs/configuration.md#configuration"
          target="_blank"
        >
          Get started
        </a>
      </p>
    </div>
  </article>
</template>

<script>
export default {
  name: "GetStarted",
};
</script>

<style lang="scss" scoped>
p {
  color: #4a4a4a;
}

body #app a {
  font-weight: 900;
  color: #ffffff;
  font-family: "Lato", sans-serif;
}
</style>
