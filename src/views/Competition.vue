<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { Loading } from "@/components/ui/loading";
import {
  eventNames,
  roundNames,
  useAuthRequest,
  formatTime,
} from "@/lib/utils";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
let wcifOriginal = {};
let events: any[] = [];
let venues: any[] = [];

onMounted(async () => {
  const data = await useAuthRequest(
    `https://www.worldcubeassociation.org/api/v0/competitions/${competitionId}/wcif/`,
    {},
    await store.$state,
  );
  wcif.value = data;
  wcifOriginal = JSON.parse(JSON.stringify(data));

  for (const event of data.events) {
    for (const round of event.rounds) {
      const id = round.id;
      const sep = id.split("-");
      const name = `${eventNames[sep[0]]} ${roundNames[sep[1]]}`;
      events.push({ name: name, id: id });
    }
  }
  venues = data.schedule.venues.map((item: { name: any }) => {
    return item.name;
  });

  selectedEvent.value = events[0].id;
  selectedVenue.value = 0;
});

const groups = computed(() => {
  return wcif.value.schedule.venues.map((venue: { rooms: any[] }) => {
    return venue.rooms.flatMap((room) => {
      const activities = room.activities.find(
        (event: { activityCode: any }) =>
          event.activityCode === selectedEvent.value,
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

const syncStartTime = (groupCode: string, newTime: string) => {
  const venue = wcif.value.schedule.venues[selectedVenue.value].rooms;

  venue.map(
    (room: {
      activities: {
        childActivities: { activityCode: string; startTime: string }[];
      }[];
    }) => {
      room.activities.map(
        (event: {
          childActivities: { activityCode: string; startTime: string }[];
        }) => {
          event.childActivities.map(
            (group: { activityCode: string; startTime: string }) => {
              if (group.activityCode === groupCode) {
                group.startTime = newTime;
              }
            },
          );
        },
      );
    },
  );
};

const syncEndTime = (groupCode: string, newTime: string) => {
  const venue = wcif.value.schedule.venues[selectedVenue.value].rooms;

  venue.map(
    (room: {
      activities: {
        childActivities: { activityCode: string; endTime: string }[];
      }[];
    }) => {
      room.activities.map(
        (event: {
          childActivities: { activityCode: string; endTime: string }[];
        }) => {
          event.childActivities.map(
            (group: { activityCode: string; endTime: string }) => {
              if (group.activityCode === groupCode) {
                group.endTime = newTime;
              }
            },
          );
        },
      );
    },
  );
};

const renameAllGroups = (all: boolean) => {
  console.log("test" + all);
};

const getDifferences = () => {
  let diffMsg = [];

  for (const [stageIdx, stage] of wcifOriginal.schedule.venues[
    selectedVenue.value
  ].rooms.entries()) {
    for (const [eventIdx, event] of stage.activities.entries()) {
      for (const [groupIdx, group] of event.childActivities.entries()) {
        const modifiedGroup =
          wcif.value.schedule.venues[selectedVenue.value].rooms[stageIdx]
            .activities[eventIdx].childActivities[groupIdx];

        if (group.name !== modifiedGroup.name) {
          diffMsg.push({
            stage: stage.name,
            diffMsg: `Group name changed: ${group.name} → ${modifiedGroup.name}`,
          });
        }

        if (group.activityCode !== modifiedGroup.activityCode) {
          diffMsg.push({
            stage: stage.name,
            diffMsg: `Group activity code changed: ${group.activityCode} → ${modifiedGroup.activityCode}`,
          });
        }

        if (group.startTime !== modifiedGroup.startTime) {
          diffMsg.push({
            stage: stage.name,
            diffMsg: `${group.name}: Start time changed: ${formatTime(group.startTime)} → ${formatTime(modifiedGroup.startTime)}`,
          });
        }

        if (group.endTime !== modifiedGroup.endTime) {
          diffMsg.push({
            stage: stage.name,
            diffMsg: `${group.name}: End time changed: ${formatTime(group.endTime)} → ${formatTime(modifiedGroup.endTime)}`,
          });
        }
      }
    }
  }

  return diffMsg;
};

const save = async () => {
  console.log("save");
};
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="min-w-[50%] m-10" v-if="wcif">
      <div class="flex justify-center mb-8">
        <h1 class="text-4xl font-bold">{{ wcif.name }}</h1>
      </div>
      <Tabs v-model="selectedVenue" class="m-4 flex justify-center">
        <TabsList>
          <TabsTrigger v-for="(venue, index) of venues" :value="index">
            {{ venue }}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Select v-model="selectedEvent" class="m-4">
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
        <AccordionItem
          v-for="stage of groups[selectedVenue]"
          :value="stage.name"
        >
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
                      <div class="mb-4">
                        <div>
                          <Label for="groupName">Group Display Name</Label>
                          <Input id="groupName" v-model="activity.name" />
                        </div>
                        <div class="mt-4">
                          <Label for="groupId">Group ID</Label>
                          <Input id="groupId" v-model="activity.activityCode" />
                        </div>
                        <div class="mt-4">
                          <Label for="startTime">Start Time</Label>
                          <div class="flex flex-row">
                            <DateTimePicker
                              class="me-2"
                              id="startTime"
                              v-model.dateTime="activity.startTime"
                              @change="() => checkTime()"
                            />
                            <Button
                              class="p-3"
                              @click="
                                () =>
                                  syncStartTime(
                                    activity.activityCode,
                                    activity.startTime,
                                  )
                              "
                              >Sync Across Stages</Button
                            >
                          </div>
                        </div>
                        <div class="mt-4">
                          <Label for="endTime">End Time</Label>
                          <div class="flex flex-row">
                            <DateTimePicker
                              class="me-2"
                              id="endTime"
                              v-model.dateTime="activity.endTime"
                              @change="() => checkTime()"
                            />
                            <Button
                              class="p-3"
                              @click="
                                () =>
                                  syncEndTime(
                                    activity.activityCode,
                                    activity.endTime,
                                  )
                              "
                              >Sync Across Stages</Button
                            >
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose as-child>
                          <Button>Close</Button>
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
      <div class="mt-4 flex flex-row">
        <div class="grow">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button class="p-3 me-2"> Rename Groups </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem @click="() => renameAllGroups(false)"
                >This Event</DropdownMenuItem
              >
              <DropdownMenuItem @click="() => renameAllGroups(true)"
                >All Events</DropdownMenuItem
              >
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div class="place-content-end">
          <Dialog>
            <DialogTrigger as-child>
              <Button class="p-3 me-2">View Changes</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Changes made to {{ wcif.name }}</DialogTitle>
              </DialogHeader>
              <div v-if="getDifferences().length > 0">
                <ul>
                  <li v-for="item of getDifferences()" class="mb-3">
                    <div class="grid grid-cols-[20%_80%] gap-4">
                      <p class="font-bold">
                        {{ item.stage }}
                      </p>
                      <p>
                        {{ item.diffMsg }}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div v-else>No Changes Made!</div>
              <DialogFooter>
                <DialogClose as-child>
                  <Button>Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button class="p-3" @click="save">Save</Button>
        </div>
      </div>
    </div>
    <div v-else><Loading /></div>
  </div>
</template>
