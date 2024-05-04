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
      <AccordionItem v-for="stage of groups[selectedVenue]" :value="stage.name">
        <AccordionTrigger>
          {{stage.name}}
        </AccordionTrigger>
        <AccordionContent>
          <div v-for="group of stage.activities">
        <div v-for="activity of group.childActivities">
        {{activity}}
      </div>
      </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    <!-- <Table class="flex w-">
      <TableHeader>
      <TableRow>
      <TableHead v-for="stage of groups[selectedVenue]">
        {{ stage.name }}
      </TableHead>
    </TableRow>
  </TableHeader>
      <TableBody>
        <TableRow v-for="(event, index) of groups[selectedVenue][0].activities">
          <TableCell v-for="stage of groups[selectedVenue]">{{ stage.activities[index].name }}</TableCell>
        </TableRow>
      </TableBody>
    </Table> -->
  </div>
  <div v-else><Loading /></div>
</template>
