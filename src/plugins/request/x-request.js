import axios from "axios";
import fileDownload from "js-file-download";
import {
  HttpError,
  HTTP_STATUS_CODE,
  HTTP_ERROR_CONSTANT,
} from "./request.constant";

const RequestPlugin = {
  install(Vue, opts) {
    const requestInterceptorMap = new Map();
    const responseInterceptorMap = new Map();

    const options = {
      baseURL: opts.baseURL || "",
      timeout: opts.method || "get",
      headers: opts.headers || {},
      widthCredentials: opts.widthCredentials || false,
      responseType: opts.responseType || "json",
      validateStatus:
        opts.validateStatus ||
        function (status) {
          return status >= 200 && status < 300;
        },
      maxRedirects: opts.maxRedirects || 5,
      onUploadProgress: opts.onUploadProgress,
      onDownloadProgress: opts.onDownloadProgress,
      needShowMessage:
        opts.needShowMessage === true ||
        typeof opts.needShowMessage === "undefined",
    };

    const customOptions = {
      businessValid:
        opts.businessValid ||
        function (response) {
          return response.code === 200 || response.code === "ok";
        },
      businessTransform: function (data, response) {
        if (opts.businessTransform) {
          return false;
        }
        data.headers = response.headers;
        data.data = data.data || data.table;
      },
      errorCatch: function (err, needShowMessage) {
        if (opts.errorCatch(err, needShowMessage)) {
          return;
        }

        if (!needShowMessage) {
          return;
        }

        const showError = (message) => Vue.prototype.$message.error(message);
        const { response, message } = err;

        if (!response) {
          Vue.prototype.$message({
            message: "网络不给力，请稍后重试",
            type: "warning",
            duration: 0,
          });
          return;
        }
        const status = response.status;
        if (HTTP_ERROR_CONSTANT[status]) {
          showError(HTTP_ERROR_CONSTANT[status].errorMsg);
        } else {
          const isBadRequest =
            status >=
              HTTP_ERROR_CONSTANT[HTTP_STATUS_CODE.BadRequestMin].errorCode -
                9000 &&
            status <=
              HTTP_ERROR_CONSTANT[HTTP_STATUS_CODE.BadRequestMax].errorCode -
                9000;

          const isServerException =
            status >=
              HTTP_ERROR_CONSTANT[HTTP_STATUS_CODE.ServerExceptionMin]
                .errorCode -
                9000 &&
            status <=
              HTTP_ERROR_CONSTANT[HTTP_STATUS_CODE.ServerExceptionMin]
                .errorCode -
                9000;

          if (isBadRequest || isServerException) {
            const errorKey = isBadRequest
              ? HTTP_STATUS_CODE.BadRequestMin
              : HTTP_STATUS_CODE.ServerExceptionMin;

            showError(HTTP_ERROR_CONSTANT[errorKey].errorMsg);
          }
        }
      },
      businessErrorCatch:
        opts.businessErrorCatch ||
        function (failRes, response, needShowMessage) {
          if (!needShowMessage) {
            return;
          }
          Vue.$message.info(failRes.message);
        },
    };

    const instance = axios.create({
      baseURL: options.baseURL,
      timeout: options.timeout,
      method: options.method,
      headers: options.headers,
      widthCredentials: options.widthCredentials,
      responseType: options.responseType,
      validateStatus: options.validateStatus,
      maxRedirects: options.maxRedirects,
    });

    Vue.setGlobalConfig = function (networkConfig) {
      const globalOptions = {
        ...options,
        ...networkConfig,
      };
      instance.defaults = {
        ...instance.defaults,
        ...globalOptions,
      };
      Vue.axios = instance;
      Vue.prototype.$axios = instance;
    };

    Vue.addHeaders = function (headers) {
      options.headers = {
        ...options.headers,
        ...headers,
      };
      instance.defaults = {
        ...instance.defaults,
        ...options,
      };
      Vue.axios = instance;
      Vue.prototype.$axios = instance;
    };

    Vue.addInterceptorsRequest = function (interceptorKey, callback) {
      Vue.removeInterceptorsRequest(interceptorKey);
      const requestInterceptor = instance.interceptors.request.use(callback);
      requestInterceptorMap.set(interceptorKey, requestInterceptor);
    };

    Vue.removeInterceptorsRequest = function (interceptorKey) {
      const requestInterceptor = requestInterceptorMap.get(interceptorKey);
      if (!requestInterceptor) {
        return;
      }
      instance.interceptors.request.eject(requestInterceptor);
    };

    Vue.addInterceptorsResponse = function (interceptorKey, callback) {
      Vue.removeInterceptorsResponse(interceptorKey);
      const responseInterceptor = instance.interceptors.response.use(callback);
      responseInterceptorMap.set(interceptorKey, responseInterceptor);
    };

    Vue.removeInterceptorsResponse = function (interceptorKey) {
      const responseInterceptor = responseInterceptorMap.get(interceptorKey);
      if (!responseInterceptor) {
        return;
      }
      instance.interceptors.response.eject(responseInterceptor);
    };

    Vue.request = function (urlConfig, needShowMessage) {
      if (typeof needShowMessage === "undefined") {
        needShowMessage = options.needShowMessage;
      }
      urlConfig = JSON.parse(JSON.stringify(urlConfig));

      const timestamp = "timestamp=" + new Date().valueOf();
      urlConfig.url += urlConfig.url.includes("?")
        ? `&${timestamp}`
        : `?${timestamp}`;

      const config = {
        ...options,
        ...urlConfig,
        url: urlConfig.url,
        method: urlConfig.method,
        params: urlConfig.params,
        headers: {
          ...options.headers,
          ...urlConfig.headers
        },
        cancelToken: urlConfig.config && urlConfig.config.cancelToken
      }
      if (['post', 'POST'].includes(urlConfig.method)) {
        config.data = urlConfig.params;
        delete config.params
      }

      return new Promise((resolve, reject) => {
        instance.request(config).then((response)=>{
        return 
        })
      })
    };

    Vue.post = function (urlConfig, needShowMessage = true) {
      const config = {
        url: urlConfig.url,
        data: urlConfig.params,
        config: {
          ...urlConfig.config,
          method: "post",
        },
      };
      return Vue.request(config, needShowMessage);
    };
  },
};
