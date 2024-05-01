import { createMemoryHistory, createRouter } from "vue-router";

import Home from "./views/Home.vue";
import CompetitionList from "./views/CompetitionList.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/competitions", component: CompetitionList },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes: routes,
});

export default router;
