<template>
  <div class="bar">
    <h1>This is an bar page</h1>
    <p>Hello World!</p>
    <p>visit: {{ visit }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      visit: 0
    };
  },
  methods: {
    autoincrement() {
      this.visit++;
    }
  },
  created() {
    this.autoincrement();
  },
  activated() {
    if (this.$router.isForward) {
      this.autoincrement();
    }
  }
};
</script>
