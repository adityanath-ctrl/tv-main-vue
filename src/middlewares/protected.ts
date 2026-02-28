import { type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import useAuthStore from '../store/useAuthStore'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'

export interface DecodedToken {
  name?: string
  [key: string]: any // To handle other properties in the token
}
export default (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
): void => {
  const authToken = localStorage.getItem('authToken')
  if (authToken) {
    try {
      // Decode the JWT
      const decoded: DecodedToken = jwtDecode(authToken)
      console.log(decoded)
      // Check if the name includes "guest"
      if (decoded.name && decoded.name.includes('guest')) {
        next('/')
      } else {
        next()
      }
    } catch (error) {
      console.error('Invalid token:', error)
      next('/') // Redirect in case of an invalid token
    }
  } else {
    next('/')
  }
}
