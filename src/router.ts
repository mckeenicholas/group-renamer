import { createWebHistory, createRouter } from "vue-router";

import Home from "./views/Home.vue";
import CompetitionList from "./views/CompetitionList.vue";
import Competition from "./views/Competition.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/competitions/:id", component: Competition },
  { path: "/competitions", component: CompetitionList },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
