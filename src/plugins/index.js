/*
 * @Author: your name
 * @Date: 2021-04-22 10:57:36
 * @LastEditTime: 2021-07-06 19:17:14
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /x-platform-admin/src/plugins/index.js
 */
import Vue from 'vue'

import XDateFormatPlugin from './dayjs/x-date-format'
import XLodashPlugin from './lodash/x-lodash'
import XBomeventPlugin from './bomevent/x-bomevent'
import XRequestPlugin from '@x-ui/x-dcloud-ui/lib/x-request-plugin'
import VueClipboard from 'vue-clipboard2'
import { FormEngine, NetworkControl } from '@x-apaas/x-dcloud-page-engine'
import { SET_TENANT_TOKEN, SET_PLATFORM_TOKEN } from '../store/auth.store'
import store from '../store'
import router from '@/router'

// appended by Mosuzi
import { ExtensionEngine } from 'x-extension'
import {
  SET_ORG_PLUGIN,
  SET_BUSINESS_EVENT_PLUGIN,
  SET_JOB_SCHEDULE_PLUGIN,
  SET_I18N_MANAGE_PLUGIN,
  SET_RESOURCE_MANAG__PLUGIN,
  SET_PROBLEM_MANAG__PLUGIN,
  SET_CURRENT_ORG,
  SET_DATA_DEVELOPMENT__PLUGIN,
  SET_IPAAS__PLUGIN,
  SET_OPERATION__PLUGIN,
  SET_RESOURCE_LOCK__PLUGIN,
  SET_PROCESS_VERSION_PLUGIN,
  SET_PLUGIN_FORM_VERSION,
  SET_CODE_EXPORT,
  SET_GRAYSCALE_RELEASE,
  SET_DEPT_EXPAND__PLUGIN,
  SET_USER_EXPAND__PLUGIN,
  SET_PLUGIN_CHATGPT,
  SET_DATA_VISUALIZATION
} from '../store/tenant.store'
import ExtensionUtil from '../utils/extension.util'
import { toLogin } from '@/vendor/sso.config.js'
import ParamsEncryptUtil from '../utils/paramsEncrypt.util'
import { parseXdaptenantidFromUrl } from '../utils/request-params-repair.util'
import { getCurrentLangEnv } from '@/locale/utils'
import EncryptionFilter from '@/api/encryption-filter'

const plugins = [XDateFormatPlugin, XLodashPlugin, XBomeventPlugin]
const xDapPluginStatusMap = {
  PLUGIN_LOGO: SET_ORG_PLUGIN,
  PLUGIN_EVENT: SET_BUSINESS_EVENT_PLUGIN,
  PLUGIN_JOB_SCHEDULE: SET_JOB_SCHEDULE_PLUGIN,
  PLUGIN_I18N: SET_I18N_MANAGE_PLUGIN,
  PLUGIN_METRICS: SET_RESOURCE_MANAG__PLUGIN,
  PLUGIN_PROBLEM: SET_PROBLEM_MANAG__PLUGIN,
  PLUGIN_DATA_DEV: SET_DATA_DEVELOPMENT__PLUGIN,
  PLUGIN_IPAAS: SET_IPAAS__PLUGIN,
  PLUGIN_RESOURCE_EDIT_LOCK: SET_RESOURCE_LOCK__PLUGIN,
  PLUGIN_PROCESS_VERSION: SET_PROCESS_VERSION_PLUGIN,
  PLUGIN_FORM_VERSION: SET_PLUGIN_FORM_VERSION,
  PLUGIN_GRAYSCALE_RELEASE: SET_GRAYSCALE_RELEASE,
  PLUGIN_OPERATION_LOG: SET_OPERATION__PLUGIN,
  PLUGIN_CODE_EXPORT: SET_CODE_EXPORT,
  PLUGIN_DEPT_EXPAND: SET_DEPT_EXPAND__PLUGIN,
  PLUGIN_USER_EXPAND: SET_USER_EXPAND__PLUGIN,
  PLUGIN_CHATGPT: SET_PLUGIN_CHATGPT,
  PLUGIN_DATA_VISUALIZATION: SET_DATA_VISUALIZATION
}
plugins.forEach((plugin) => {
  Vue.use(plugin)
})

Vue.use(XRequestPlugin, {
  baseURL: Vue.GLOBAL_ENV.VUE_APP_BASE_DOMAIN,
  headers: {
    'Accept-Language': 'zh-CN'
  },
  needShowMessage: true,
  businessErrorCatch: function (failRes, response, needShowMessage) {
    // 通用业务错误处理
    // console.log(failRes, 'failRes')
    // console.log(response, 'response')
    // console.log(needShowMessage, 'needShowMessage')
    // if (failRes.code === 'error' && needShowMessage) {
    //   Vue.prototype.$message({
    //     message: failRes.message,
    //     type: 'error'
    //   })
    // }
    if (response.status === 200 && failRes.code === 'error' && needShowMessage) {
      Vue.prototype.$message({
        message: failRes.message,
        type: 'warning',
        customClass: 'message-toast-class'
      })
    } else {
      Vue.prototype.$message({
        message: failRes.message,
        type: 'error',
        customClass: 'message-toast-class'
      })
    }
    if (failRes.bizCode === '1307' || failRes.bizCode === '3029') {
      toLogin()
    }
  },
  errorCatch: function (err, needShowMessage) {
    const token = err && err.response && err.response.headers && err.response.headers.xdaptoken
    if (token) {
      if (
        router.currentRoute.matched.find(
          (item) => item.name === 'admin-layout' || item.name === 'default-layout'
        )
      ) {
        store.commit(`authModule/${SET_TENANT_TOKEN}`, token)
      }
      if (router.currentRoute.matched.find((item) => item.name === 'platform-admin-layout')) {
        store.commit(`authModule/${SET_PLATFORM_TOKEN}`, token)
      }
      Vue.addHeaders({
        xdaptoken: token
      })
      FormEngine.registerGlobalToken(token)
    }
    // console.error(err)
    if (err.response && err.response.status === 401) {
      // Vue.prototype.$message.error()
      toLogin()
      return true
    }
    if (err.response && err.response.status === 428) {
      // Vue.prototype.$message.error()
      router.replace({ name: 'unauthorized' })
      return true
    }
    if (err.response && err.response.status === 417) {
      // Vue.prototype.$message.error()
      router.replace({ name: '425' })
      return true
    }
    if (err.response && err.response.status === 424) {
      Vue.prototype.$message({
        message: err.response.data.message,
        type: err.response.data.code
      })
      return true
    }
    if (err.response && err.response.status === 500) {
      Vue.prototype.$message({
        message: err.response.data && err.response.data.message,
        type: 'error'
      })
      return true
    }
  }
})

Vue.use(VueClipboard)

// 添加request拦截器
Vue.addInterceptorsRequest('REQUEST_PARAMS_INTERCEPTOR', (e) => {
  e.headers['xdaptimestamp'] = new Date().getTime()
  e.headers['Accept-Language'] = getCurrentLangEnv()
  const authStore = store.state.authModule
  const token = authStore.tenantBlock.token || authStore.platformBlock.token
  if (token) {
    e.headers['xdaptoken'] = token
    // e.headers['xdaptoken'] = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjE2MjAyNzIxODksImlhdCI6MTYyMDI2NDk4OSwieGRhcHVzZXJpZCI6IjEwMDE1Nzg5MTkyNDE3NzQ1MzA1NiJ9.Uth8FGvP0xAfsT299eGfhc3Fs_dukhL-AG0xWVxgk4VEo9FS1NZ6Ux1lPvBXFNHpYv7MFn8eHvcdj4yBGjTi9w'
    if (token !== NetworkControl.token) {
      Vue.addHeaders({
        xdaptoken: token
      })
      FormEngine.registerGlobalToken(token)
    }
  }
  if (router.currentRoute.matched.find((item) => item.name === 'platform-admin-layout')) {
    // 平台内 headers 的 xdaptenantid 置为 null
    e.headers['xdaptenantid'] = null
  } else {
    // TODO: 暂时添加租户id
    if (
      !(
        store.state.tenantModule &&
        store.state.tenantModule.currentOrg &&
        store.state.tenantModule.currentOrg.id
      )
    ) {
      // (!router.currentRoute.name && router.currentRoute.query && router.currentRoute.query.tenantId))
      // 这个判断是为了兼容插件中注册的路由，可能会在掉接口时找不到，这样就会找不到params，导致tenantId不存在，跳转到登录页面
      try {
        const orgId = router.currentRoute.params.orgId || (!router.currentRoute.name && router.currentRoute.query.tenantId) || parseXdaptenantidFromUrl()
        const currentOrg = store.state.authModule.orgs.find(
          (org) => org.id === orgId
        )
        if (currentOrg) {
          store.commit(`tenantModule/${SET_CURRENT_ORG}`, currentOrg)
          // tenantStoreMethods.setCurrentOrg(currentOrg)
        }
      } catch (error) {
        console.error(error)
      }
    }
    e.headers['xdaptenantid'] =
      e.headers['xdaptenantid'] || store.state.tenantModule.currentOrg.id || ''
  }
  // 加解密开关
  const paramsEnsrypt = Vue.GLOBAL_ENV.VUE_APP_SM2_ENCRYPT_TYPE

  // 参数加密 过滤掉文件上传的接口
  if (!e.url.includes('attachments') && !EncryptionFilter.some(item => e.url.includes(item))) {
    if ((e.data || e.params) && paramsEnsrypt === 'ENABLE') {
      let encryptionData = ParamsEncryptUtil.encryptSM2(e.data || e.params)
      if (e.data) {
        e.data = {}
        e.data['encryptionData'] = encryptionData
      } else {
        e.params = {}
        e.params['encryptionData'] = encryptionData
      }
    }
  }
  return e
})

// 添加response拦截器
Vue.addInterceptorsResponse('RESPONSE_SUCCESS_MSG_INTERCEPTOR', (e) => {
  // 替换{DynamicsHost}占位符为全路径的baseDomain
  if (e && e.data) {
    let dataStr = JSON.stringify(e.data)
    if (dataStr.includes('{DynamicsHost}')) {
      dataStr = dataStr.replace(/{DynamicsHost}/g, window._getBaseDomain())
      e.data = JSON.parse(dataStr)
    }
  }
  const token = e && e.headers && e.headers.xdaptoken
  if (token) {
    if (
      router.currentRoute.matched.find(
        (item) => item.name === 'admin-layout' || item.name === 'default-layout'
      )
    ) {
      store.commit(`authModule/${SET_TENANT_TOKEN}`, token)
    }
    if (router.currentRoute.matched.find((item) => item.name === 'platform-admin-layout')) {
      store.commit(`authModule/${SET_PLATFORM_TOKEN}`, token)
    }
  }
  // appended by Mosuzi: 插件信息
  const xDapPlugin = e && e.headers && e.headers.xdapplugin
  // const xDapPlugin = 'UExVR0lOX0ZFSV9TSFUsUExVR0lOX0kxOE4sUExVR0lOX0VWRU5ULFBMVUdJTl9NRVRSSUNTX0RFU0MsUExVR0lOX1BST0JMRU0K'//无数据开发
  // const xDapPlugin = 'UExVR0lOX0ZFSV9TSFUsUExVR0lOX0kxOE4sUExVR0lOX0VWRU5ULFBMVUdJTl9EQVRBX0RFVixQTFVHSU5fTUVUUklDU19ERVNDLFBMVUdJTl9QUk9CTEVN'// 有数据开发
  if (xDapPlugin !== undefined && xDapPlugin !== null) {
    // eslint-disable-next-line no-unused-vars
    for (let key in xDapPluginStatusMap) {
      store.commit(
        `tenantModule/${xDapPluginStatusMap[key]}`,
        ExtensionUtil.existPlugin(xDapPlugin, key)
      )
    }
    ExtensionEngine.getInstance().setGlobalBlackExtensionsByWhite(xDapPlugin)
    ExtensionEngine.getInstance().resetActivation(xDapPlugin)
  } else {
    console.warn(e.config && e.config.url, e, '该接口响应头没有xdapplugin响应头相关信息')
  }
  // 接口解密
  const paramsEnsrypt = Vue.GLOBAL_ENV.VUE_APP_SM2_ENCRYPT_TYPE
  if (e.data.encryptionData && paramsEnsrypt === 'ENABLE') {
    let encryptionData = ParamsEncryptUtil.decryptSM2(e.data.encryptionData.substring(2))
    e.data = {}
    e.data = encryptionData
  }
  if (e && e.status === 200 && e.data.code === 'ok' && !e.config.disableSuccessMsg) {
    if (e.data.interval) {
      Vue.prototype.$message({
        message: e.data.message,
        type: 'success',
        durationTime: e.data.interval
      })
    } else {
      Vue.prototype.$message({
        message: e.data.message,
        type: 'success'
      })
    }
  }
  return e
})
