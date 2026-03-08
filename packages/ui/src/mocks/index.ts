export { handlers } from './handlers'
// server and browser exports removed from barrel to prevent MSW from being
// bundled in production. Tests import directly from './server' or './browser'.
