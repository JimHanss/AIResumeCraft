<script setup lang="ts">
import { calculateOverallScore, demoResume } from '@airesumecraft/shared'

const score = calculateOverallScore(demoResume)
</script>

<template>
  <main class="min-h-screen">
    <section
      class="mx-auto grid max-w-6xl gap-8 px-5 py-8 md:grid-cols-[1fr_360px] md:py-12"
    >
      <div
        class="flex min-h-[68vh] flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        <div>
          <p
            class="text-sm font-medium uppercase tracking-[0.12em] text-cyan-700"
          >
            Featured Resume
          </p>
          <h1
            class="mt-4 text-4xl font-semibold tracking-normal text-slate-950 md:text-6xl"
          >
            {{ demoResume.profile.name }}
          </h1>
          <p class="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            {{ demoResume.profile.headline }}
          </p>
        </div>

        <div class="mt-10 grid gap-4 sm:grid-cols-3">
          <div
            v-for="section in demoResume.sections.slice(0, 3)"
            :key="section.id"
            class="rounded-md border border-slate-200 p-4"
          >
            <h2 class="text-sm font-semibold text-slate-900">
              {{ section.title }}
            </h2>
            <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
              {{ section.markdown.replaceAll('-', '') }}
            </p>
          </div>
        </div>
      </div>

      <aside
        class="rounded-lg border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"
      >
        <p class="text-sm text-cyan-200">
          Resume score
        </p>
        <strong class="mt-3 block text-6xl tracking-normal">{{ score }}</strong>
        <dl class="mt-8 space-y-4">
          <div
            v-for="[name, value] in Object.entries(demoResume.score)"
            :key="name"
            class="flex items-center justify-between border-b border-white/10 pb-3"
          >
            <dt class="capitalize text-slate-300">
              {{ name }}
            </dt>
            <dd class="font-semibold">
              {{ value }}
            </dd>
          </div>
        </dl>
        <NuxtLink
          to="/resume/demo"
          class="mt-8 inline-flex h-10 items-center rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-200"
        >
          View portfolio page
        </NuxtLink>
      </aside>
    </section>
  </main>
</template>
