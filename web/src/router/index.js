import { createRouter, createWebHistory } from "vue-router";
import { authReady, currentUser } from "../lib/auth";
import { modules } from "../config/modules";
import LoginView from "../views/LoginView.vue";
import ProfileView from "../views/ProfileView.vue";
import ResourceView from "../views/ResourceView.vue";

// One route per API module, all rendered by the generic ResourceView
const moduleRoutes = modules.map((m) => ({
  path: m.path,
  component: ResourceView,
  props: { moduleKey: m.key },
}));

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", component: LoginView, meta: { public: true } },
    { path: "/", redirect: modules[0].path },
    ...moduleRoutes,
    { path: "/perfil", component: ProfileView },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

router.beforeEach(async (to) => {
  await authReady;
  const loggedIn = Boolean(currentUser.value);

  if (!to.meta.public && !loggedIn) return "/login";
  if (to.meta.public && loggedIn) return "/";
});

export default router;
