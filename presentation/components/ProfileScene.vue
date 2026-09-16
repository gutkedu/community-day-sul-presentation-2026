<script setup lang="ts">
defineProps<{
  name: string
  role: string
  roleDetail?: string
  body: string
  image: string
  href: string
  linkLabel: string
  credit?: string
  projectImage?: string
  projectHref?: string
  projectLabel?: string
}>()
</script>
<template>
  <section class="profile-scene" :class="{ 'profile-grouped': roleDetail, 'profile-with-project': projectImage }">
    <div class="profile-copy">
      <h2>{{ name }}</h2>
      <p class="profile-role">{{ role }}</p>
      <p v-if="roleDetail" class="profile-role-detail">{{ roleDetail }}</p>
      <p class="profile-body">{{ body }}</p>
      <a :href="href" target="_blank" rel="noopener">{{ linkLabel }} <span aria-hidden="true">↗</span></a>
    </div>
    <a v-if="projectImage" class="profile-project" :href="projectHref" target="_blank" rel="noopener">
      <img :src="projectImage" alt="Repositório público do EventCatalog no GitHub" />
      <span>{{ projectLabel }} <b aria-hidden="true">↗</b></span>
    </a>
    <figure><img :src="image" :alt="name" :class="{ 'speaker-portrait': image === '/people/eduardo.png' }" /><figcaption v-if="credit">{{ credit }}</figcaption></figure>
  </section>
</template>
