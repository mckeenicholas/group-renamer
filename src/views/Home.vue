<script setup lang="ts">
import { CircleUserRound } from "lucide-vue-next";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button/Button.vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.module";
import { onMounted } from "vue";

const router = useRouter();
const store = useAuthStore();

const { requestLogin, handleAuthRedirect } = store;

onMounted(() => {
  if (handleAuthRedirect()) {
    router.push("/competitions");
  }
});
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <Card>
      <CardContent class="p-2">
        <div class="flex justify-center">
          <CircleUserRound class="h-16 w-16 items-center" />
        </div>
        <h1>To use this app, you must sign in</h1>
        <hr class="m-2" />
        <div class="flex items-center justify-center align-middle">
          <Button @click="requestLogin">Sign in</Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
