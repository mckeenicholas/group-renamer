import { defineStore } from "pinia";

interface AuthState {
  name: string | null;
  token: string | null;
}

const links = {
  url: "https://worldcubeassociation.org",
  appId: "AHB8-DJmu4TTHhfsDg8DeS1cxzOuxRXbxq_SGpJYIkI",
  redirect: "http://localhost:5173/",
};

export const useAuthStore = defineStore({
  id: "auth",
  state: (): AuthState => ({
    name: null,
    token: null,
  }),
  actions: {
    async requestLogin() {
      window.location.href = `${links.url}/oauth/authorize?client_id=${links.appId}&redirect_uri=${links.redirect}&response_type=token&scope=public+manage_competitions`;
    },
    logout() {
      this.$reset();
      // Optionally, add code here to clear token from local storage or do any other necessary cleanup
    },
    handleAuthRedirect() {
      // Check if the URL contains an access token
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = urlParams.get("access_token");

      if (accessToken) {
        // Token exists, update token in the store
        this.token = accessToken;
        return true;
      }

      return false;
    },
  },
});
