// config/app.config.ts

export default () => ({
  keycloak: {
    realm: process.env.KEYCLOAK_REALM,
    login_url: process.env.KEYCLOAK_LOGIN_URL,
  },
  keycloak_admin: {
    baseURL: process.env.KEYCLOAK_ADMIN_BASE_URL,
    clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID,
    clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
    linkLifeSpan: process.env.KEYCLOAK_ADMIN_LINK_LIFESPAN,
    clientRedirectUrl: process.env.KEYCLOAK_ADMIN_REDIRECT_URL,
  },
});
