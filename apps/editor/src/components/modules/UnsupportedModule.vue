<script setup lang="ts">
defineProps<{
  type: string
}>()
</script>

<template>
  <div class="unsupported-module">
    Unsupported module: {{ type }}
  </div>
</template>
