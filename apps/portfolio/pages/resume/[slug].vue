<script setup lang="ts">
import { demoResume } from '@airesumecraft/shared'

const route = useRoute()
const slug = computed(() => route.params.slug)

useSeoMeta({
  title: `${demoResume.profile.name} - AIResumeCraft`,
  description: demoResume.profile.headline,
})
</script>

<template>
  <main class="mx-auto max-w-4xl px-5 py-8 md:py-12">
    <NuxtLink
      to="/"
      class="text-sm font-medium text-cyan-700 hover:text-cyan-900"
    >
      Back
    </NuxtLink>

    <article
      class="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-10"
    >
      <header class="border-b border-slate-200 pb-6">
        <p class="text-sm text-slate-500">
          /resume/{{ slug }}
        </p>
        <h1 class="mt-3 text-4xl font-semibold tracking-normal text-slate-950">
          {{ demoResume.profile.name }}
        </h1>
        <p class="mt-3 text-lg text-slate-600">
          {{ demoResume.profile.headline }}
        </p>
        <p class="mt-2 text-sm text-slate-500">
          {{ demoResume.profile.email }} · {{ demoResume.profile.location }}
        </p>
      </header>

      <section
        v-for="section in demoResume.sections"
        :key="section.id"
        class="border-b border-slate-100 py-6 last:border-0"
      >
        <h2 class="text-base font-semibold text-slate-950">
          {{ section.title }}
        </h2>
        <p class="mt-3 whitespace-pre-line leading-8 text-slate-700">
          {{ section.markdown }}
        </p>
      </section>
    </article>
  </main>
</template>
