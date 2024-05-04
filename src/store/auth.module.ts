import { defineStore } from "pinia";

interface AuthState {
  name: string | null;
  token: string | null;
  expiry: Date | null;
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
    expiry: null,
  }),
  actions: {
    async requestLogin() {
      window.location.href = `${links.url}/oauth/authorize?client_id=${links.appId}&redirect_uri=${links.redirect}&response_type=token&scope=public+manage_competitions`;
    },
    logout() {
      this.$reset();
    },
    handleAuthRedirect() {
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = urlParams.get("access_token");
      const expiresIn = urlParams.get("expires_in");

      if (accessToken && expiresIn) {
        this.token = accessToken;

        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
        this.expiry = new Date((currentTime + parseInt(expiresIn)) * 1000);

        return true;
      }

      return false;
    },
  },
});
