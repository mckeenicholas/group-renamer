<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { Loading } from "@/components/ui/loading";
import { eventNames, roundNames, useAuthRequest } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.module";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Button from "@/components/ui/button/Button.vue";
import { Badge } from '@/components/ui/badge'


const wcif: any = ref(null);
const selectedEvent: any = ref(null);
const selectedVenue: any = ref(null);
const store = useAuthStore();
const route = useRoute();
const competitionId = route.params.id;
let events = [];
let venues = [];

onMounted(async () => {
  const data = await useAuthRequest(
    `https://www.worldcubeassociation.org/api/v0/competitions/${competitionId}/wcif/`,
    {},
    await store.$state,
  );
  wcif.value = data;

  for (const event of data.events) {
    for (const round of event.rounds) {
      const id = round.id;
      const sep = id.split("-");
      const name = `${eventNames[sep[0]]} ${roundNames[sep[1]]}`
      events.push({name: name, id: id})
    }
  }
  venues = data.schedule.venues.map((item) => {
    return item.name;
  })

  selectedEvent.value = events[0].id;
  selectedVenue.value = 0;

});
const groups = computed(() => {
  // Assuming wcif, selectedEvent are reactive ref objects
  return wcif.value.schedule.venues.map((venue) => {
    return venue.rooms.flatMap((room) => {
      const activities = room.activities.filter((event) => event.activityCode === selectedEvent.value);
      if (activities.length > 0) {
        return { id: room.id, name: room.name, activities: activities}
      } else {
        return [];
      }
    })
  });
});

const groupEdit = (stage: number, group: number) => {
  console.log(stage, group);
}
</script>

<template>  
  <div v-if="wcif" >
    <Tabs v-model="selectedVenue">
  <TabsList>
    <TabsTrigger v-for="(venue, index) of venues" :value="index">
      {{ venue }}
    </TabsTrigger>
  </TabsList>
</Tabs>
    <Select v-model="selectedEvent">
      <SelectTrigger>
        <SelectValue placeholder="Select Event"/>
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="event in events" :value="event.id">
          {{ event.name }}
        </SelectItem>
      </SelectContent>
    </Select>

    <Accordion type="multiple" collapsible>
      <AccordionItem v-for="(stage, stageIndex) of groups[selectedVenue]" :value="stage.name">
        <AccordionTrigger>
          {{stage.name}}
        </AccordionTrigger>
        <AccordionContent>
          <ul>
            <li v-for="(activity, activityIndex) of stage.activities[0].childActivities" class="my-1">
              {{activity.name}}
              <Badge @click="() => groupEdit(stageIndex, activityIndex)" style="cursor: pointer">
                Edit Group
              </Badge>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
  <div v-else><Loading /></div>
</template>