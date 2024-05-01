<script setup lang="ts">
import { useAuthStore } from "@/store/auth.module";
import { onMounted, ref } from "vue";

const store = useAuthStore();
const token = store.$state.token;

const requestCompetitions = async () => {
  const oneWeekAgo = new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000);
  const params = new URLSearchParams({
    managed_by_me: "true",
    start: oneWeekAgo.toISOString(),
  });

  const data = await fetch(
    "https://www.worldcubeassociation.org/api/v0/competitions?" +
      params.toString(),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return await data.json();
};

const competitions = ref<any[]>([]);

onMounted(async () => {
  const data = await requestCompetitions();

  competitions.value = data.filter(
    (competition: { announced_at: null }) => competition.announced_at !== null,
  );
  console.log(data);
});
</script>

<template>
  <div>
    <ul>
      <li v-for="competition in competitions" :key="competition.id">
        {{ competition.name }}
      </li>
    </ul>
  </div>
</template>
