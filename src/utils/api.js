import axios from 'axios'

import { store } from '../redux/store'


export const apiRequest = request => axios({...request, url: `https://ddos.sakuravm.net/api${request.url}`});
export const v1Request = request => axios({...request, url: `https://ddos.sakuravm.net/api/v1${request.url}`});
export const v1AuthRequest = request => axios({
  ...request,
  url: `https://ddos.sakuravm.net/api/v1${request.url}`,
  headers: {...request.headers, Authorization: `Bearer ${store.getState().auth.token}`}
});
export const v2AuthRequest = request => axios({
  ...request,
  url: `https://ddos.sakuravm.net/api/v2${request.url}`,
  headers: {...request.headers, Authorization: `Bearer ${store.getState().auth.token}`}
});
