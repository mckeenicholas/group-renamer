<script setup lang="ts">
import { Input } from "@/components/ui/input";

defineProps<{
  id?: string;
}>();

const [model, modifiers] = defineModel({
  set(value) {
    if (modifiers.dateTime) {
      const newDate = new Date(value as string);
      return newDate.toISOString().split(".")[0] + "Z";
    }
    return value;
  },
  get(value) {
    if (modifiers.dateTime) {
      const date = new Date(value as string);
      const dateTimeLocalValue = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, -1);
      return dateTimeLocalValue;
    }
    return value;
  },
});
</script>

<template>
  <Input :id="id" type="datetime-local" v-model="model" />
</template>
