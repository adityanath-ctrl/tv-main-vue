/* /src/router/router.ts */
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import protectedRoute from '../middlewares/protected'
import Featured from '../views/Featured/index.vue'
import Profile from '../views/Profile.vue'
import ProfileNoGuard from '../views/ProfileNoGuard.vue'
import Failed from '../views/Failed.vue'
import MovieDetails from '../views/svod/MovieDetails.vue'
import SeriesDetails from '../views/svod/SeriesDetails.vue'
import SvodContents from '../views/svod/Contents.vue'
import SvodPackageDetails from '../views/svod/SvodPackageDetails.vue'
import LivePlayer from '../views/Players/LiveTVPlayer.vue'
import EventPlayer from '../views/Players/EventsPlayer.vue'
import SportPlayer from '../views/Players/SportsPlayer.vue'
import RadioPlayer from '../views/Players/RadioPlayer.vue'
import MoviePlayer from '../views/Players/MoviePlayer.vue'
import SeriesPlayer from '../views/Players/SeriesPlayer.vue'
import CategoryContents from '../views/Category/CategoryContents.vue'
import Provider from '../views/Provider/index.vue'

import { registerGuard } from './Guard'
import PostLogout from '../views/PostLogout.vue'
import Settings from '../views/Settings.vue'
import Search from '../views/Search/index.vue'
import ViewAll from '../views/Search/ViewAll.vue'
import MyAccount from '../views/MyAccount/index.vue'
import EnterCode from '../views/Codes/EnterCode.vue'
import ManageDevices from '../views/ManageDevices/index.vue'
import BrowsePackages from '../views/BrowsePackages/index.vue'
import StaticHome from '../views/StaticHome.vue'

import { ONLY_MANAGE_ACCOUNT } from '@/mainConfig'

// Build routes conditionally
const fullAppRoutes: Array<RouteRecordRaw> = [
  { path: '/', name: 'FeaturedCategoriesRoot', component: Featured },
  { path: '/menu/:menuId', name: 'FeaturedCategoriesMainMenu', component: Featured },
  { path: '/menu/:menuId/s/:subMenuId', name: 'FeaturedCategoriesSubMainMenu', component: Featured },

  { path: '/player/live-tv/:liveId', name: 'LivePlayer', component: LivePlayer, meta: { lockScroll: true }},
  { path: '/player/match/:sportId', name: 'SportPlayer', component: SportPlayer, meta: { lockScroll: true }},
  { path: '/player/radio/:radioId', name: 'RadioPlayer', component: RadioPlayer, meta: { lockScroll: true }},
  { path: '/player/video/:eventId', name: 'EventPlayer', component: EventPlayer, meta: { lockScroll: true }},
  { path: '/player/movie/:movieId', name: 'MoviePlayer', component: MoviePlayer, meta: { lockScroll: true, hidesGlobalUI: true }},
  { path: '/player/series/:seriesId/:episodeId', name: 'SeriesPlayer', component: SeriesPlayer, meta: { lockScroll: true }},

  { path: '/svod/movie/:id', name: 'MovieDetails', component: MovieDetails },
  { path: '/svod/series/:id', name: 'SeriesDetails', component: SeriesDetails },
  { path: '/svod/package/:packageId', name: 'SvodPackageDetails', component: SvodPackageDetails },
  { path: '/svod/contents', name: 'SvodContents', component: SvodContents },

  { path: '/provider/:providerId', name: 'Provider', component: Provider },
  { path: '/category/:categoryId/:menuContentType/:menuType?', name: 'CategoryContents', component: CategoryContents },

  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true }, beforeEnter: protectedRoute },
  { path: '/profileNoGuard', name: 'ProfileNoGuard', component: ProfileNoGuard },
  { path: '/failed', name: 'Failed', component: Failed },
  { path: '/postlogout', name: 'PostLogout', component: PostLogout },
  { path: '/settings', name: 'Settings', component: Settings },
  { path: '/search', name: 'Search', component: Search },
  { path: '/search/all/:categoryName', name: 'SearchViewAll', component: ViewAll, props: true },
  { path: '/my-account', name: 'MyAccount', component: MyAccount },
  { path: '/manage-devices', name: 'ManageDevices', component: ManageDevices },
  { path: '/enter-code', name: 'EnterCode', component: EnterCode },
  { path: '/packages', name: 'Packages', component: BrowsePackages },
]

// Minimal routes when ONLY_MANAGE_ACCOUNT is true
const manageOnlyRoutes: Array<RouteRecordRaw> = [
  { path: '/', name: 'StaticHome', component: StaticHome },
  { path: '/my-account', name: 'MyAccount', component: MyAccount },
  { path: '/manage-devices', name: 'ManageDevices', component: ManageDevices },
  // Optional: a 404 that always sends you to /
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const routes = ONLY_MANAGE_ACCOUNT ? manageOnlyRoutes : fullAppRoutes

// Names where we always reset scroll to top (keep as-is)
const resetScrollOnRoutes = new Set([
  'LivePlayer',
  'EventPlayer',
  'MoviePlayer',
  'SeriesPlayer',
  'SportPlayer',
  'RadioPlayer'
])

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { left: 0, top: 0 };
  }
})

// Hard gate when ONLY_MANAGE_ACCOUNT is on (paranoia guard)
router.beforeEach((to, _from, next) => {
  if (!ONLY_MANAGE_ACCOUNT) return next();

  const allowed = new Set(['StaticHome', 'MyAccount', 'ManageDevices']);
  if (allowed.has(String(to.name))) return next();

  return next({ name: 'StaticHome', replace: true });
});

router.afterEach((to) => {
  const locked = to.matched.some(r => r.meta?.lockScroll);
  document.documentElement.classList.toggle('lock-scroll', locked);
  document.body.classList.toggle('lock-scroll', locked);
  const app = document.getElementById('app');
  if (app) app.classList.toggle('lock-scroll', locked);
});

registerGuard(router)

export default router
