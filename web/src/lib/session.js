import { computed, ref } from "vue";
import { currentUser } from "./auth";
import { api } from "./api";

// Profile of the logged-in user, shared by the header and the sidebar
export const profile = ref(null);

// Full name when set, otherwise the login email
export const displayName = computed(() => profile.value?.fullName || currentUser.value?.email || "");

// Failures fall back to the email, so no error is shown here
export async function loadProfile() {
  try {
    const { data } = await api.me();
    profile.value = data;
  } catch {
    profile.value = null;
  }
}
