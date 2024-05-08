<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { Loading } from "@/components/ui/loading";
import { eventNames, roundNames, useAuthRequest, formatTime } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.module";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Button from "@/components/ui/button/Button.vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DateTimePicker } from "@/components/ui/picker";
import { AlertCircle } from "lucide-vue-next";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const wcif: any = ref(null);
const selectedEvent: any = ref(null);
const selectedVenue: any = ref(null);
const errorMessages: any = ref([]);
const store = useAuthStore();
const route = useRoute();
const competitionId = route.params.id;
let events: any[] = [];
let venues: any[] = [];

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
      const name = `${eventNames[sep[0]]} ${roundNames[sep[1]]}`;
      events.push({ name: name, id: id });
    }
  }
  venues = data.schedule.venues.map((item: { name: any; }) => {
    return item.name;
  });

  selectedEvent.value = events[0].id;
  selectedVenue.value = 0;
});

const groups = computed(() => {
  return wcif.value.schedule.venues.map((venue: { rooms: any[]; }) => {
    return venue.rooms.flatMap((room) => {
      const activities = room.activities.find(
        (event: { activityCode: any; }) => event.activityCode === selectedEvent.value,
      );
      return activities
        ? { id: room.id, name: room.name, activities: activities }
        : [];
    });
  });
});

const checkTime = () => {
  const venue = wcif.value.schedule.venues[selectedVenue.value].rooms;

  errorMessages.value = venue.flatMap(
    (room: { activities: any[]; name: any }) => {
      return room.activities.flatMap((event) => {
        if (event.childActivities) {
          return event.childActivities.flatMap(
            (group: { startTime: string; name: string; endTime: string }) => {
              let messages = [];

              if (new Date(group.startTime) < new Date(event.startTime)) {
                messages.push(
                  `${room.name}: ${group.name}: start time is before parent event start`,
                );
              }

              if (new Date(group.endTime) > new Date(event.endTime)) {
                messages.push(
                  `${room.name}: ${group.name}: ends time is after parent event end`,
                );
              }

              if (new Date(group.endTime) < new Date(group.startTime)) {
                messages.push(
                  `${room.name}: ${group.name}: start time is after end time`,
                );
              }

              return messages;
            },
          );
        } else {
          return [];
        }
      });
    },
  );
};


</script>

<template>
  <div v-if="wcif">
    <Tabs v-model="selectedVenue">
      <TabsList>
        <TabsTrigger v-for="(venue, index) of venues" :value="index">
          {{ venue }}
        </TabsTrigger>
      </TabsList>
    </Tabs>
    <Select v-model="selectedEvent">
      <SelectTrigger>
        <SelectValue placeholder="Select Event" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="event in events" :value="event.id">
          {{ event.name }}
        </SelectItem>
      </SelectContent>
    </Select>
    <div v-if="errorMessages.length > 0">
      <Alert variant="destructive">
        <AlertCircle class="w-4 h-4" />
        <AlertTitle>Warning</AlertTitle>
        <div v-for="message of errorMessages">
          <AlertDescription>
            {{ message }}
          </AlertDescription>
        </div>
      </Alert>
    </div>
    <Accordion type="multiple" collapsible>
      <AccordionItem v-for="stage of groups[selectedVenue]" :value="stage.name">
        <AccordionTrigger>
          {{
            `${stage.name}: ${formatTime(stage.activities.startTime)} - ${formatTime(stage.activities.endTime)}`
          }}
        </AccordionTrigger>
        <AccordionContent>
          <ul>
            <li
              v-for="activity of stage.activities.childActivities"
              class="my-1"
            >
              <div class="flex">
                <div class="me-4">
                  {{ activity.name }}
                </div>
                <div class="me-4">
                  {{
                    `${formatTime(activity.startTime)} - ${formatTime(activity.endTime)}`
                  }}
                </div>
                <Dialog>
                  <DialogTrigger as-child>
                    <Badge style="cursor: pointer"> Edit </Badge>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit {{ activity.name }}</DialogTitle>
                    </DialogHeader>
                    <div>
                      <div>
                        <Label for="groupName">Group Display Name</Label>
                        <Input id="groupName" v-model="activity.name" />
                      </div>
                      <div class="mt-4">
                        <Label for="startTime">Start Time</Label>
                        <DateTimePicker
                          id="startTime"
                          v-model.dateTime="activity.startTime"
                          @change="() => checkTime()"
                        />
                      </div>
                      <div class="mt-4">
                        <Label for="startTime">End Time</Label>
                        <DateTimePicker
                          id="startTime"
                          v-model.dateTime="activity.endTime"
                          @change="() => checkTime()"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose as-child>
                        <Button> Close </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
  <div v-else><Loading /></div>
</template>
