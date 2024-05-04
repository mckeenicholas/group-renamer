<script setup lang="ts">
import { useAuthStore } from "@/store/auth.module";
import { onMounted, ref } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useAuthRequest } from "@/lib/utils";

const store = useAuthStore();

const oneWeekAgo = new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000);
const params = new URLSearchParams({
  managed_by_me: "true",
  start: oneWeekAgo.toISOString(),
});

const competitions = ref<any[]>([]);

onMounted(async () => {
  const data = await useAuthRequest(
    `https://www.worldcubeassociation.org/api/v0/competitions?${params.toString()}`,
    {},
    await store.$state,
  );

  competitions.value = data
    .filter(
      (competition: { announced_at: null }) =>
        competition.announced_at !== null,
    )
    .reverse();
  console.log(data);
});
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <Card>
      <div class="flex justify-center m-3">
        <h1 class="text-2xl font-bold">Upcoming Competitions:</h1>
      </div>
      <hr />
      <CardContent class="p-0">
        <ol v-if="competitions.length != 0">
          <li v-for="competition in competitions" :id="competition.id">
            <RouterLink :to="`competitions/${competition.id}`">
              <div
                class="flex justify-between hover:bg-muted text-lg px-3 py-2 rounded-md"
              >
                <p class="me-8">{{ competition.name }}</p>
                <p>{{ competition.date_range }}</p>
              </div>
            </RouterLink>
          </li>
        </ol>
        <div v-else>
          <Loading />
        </div>
      </CardContent>
    </Card>
  </div>
</template>
