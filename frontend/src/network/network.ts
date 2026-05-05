import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import storage from "@/utils/storage.ts";
import { toast } from "@/utils/states/state.ts";
import { getAppConfig } from "@/utils/appConfig";

/** Backward-compatible export — reads from runtime config.json */
export const get_BASE_URL = () => getAppConfig().backendUrl;

const client = axios.create();


interface ApiResponse {
    code: number;
    message: string;
    data: any;
}

export const request = async (options: AxiosRequestConfig) => {
    // Set baseURL from runtime config on every call
    client.defaults.baseURL = getAppConfig().backendUrl;

    const token = storage.getToken()

    if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`

    client.defaults.headers.common["Accept-Language"] = localStorage.getItem("language") ?? 'en'

    const isFormData = options.data instanceof FormData;
    if (!isFormData && !options.headers?.['Content-Type']) {
        options.headers = {
            ...options.headers,
            "Content-Type": "application/json"
        };
    }

    options.headers = {
        ...options.headers,
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0"
    };
    
    const onSuccess = async (response: AxiosResponse<ApiResponse>) => {
        if (options.responseType === 'blob') {
            return response.data;
        }
        return response?.data?.data;
    }

    const onError = async (error: AxiosError<ApiResponse>): Promise<string> => {
        if (error.response?.status === 401) {
            toast.value = {
                ...toast.value,
                message: 'The sessions is expired',
                isExpired: true,
            }
            /* `storage.clearToken()` is a function call that is used to clear the token stored in the
            storage. In this context, it is called when there is a 401 status response
            (Unauthorized) from the API, indicating that the session has expired. This function
            clears the token stored in the storage, effectively logging out the user or removing the
            expired token. */
            storage.clearToken()
        }
        const errorMessage = error.response?.data?.message ?? error.message;
        return Promise.reject(errorMessage);
    };


    return client(options).then(onSuccess).catch(onError);
}
