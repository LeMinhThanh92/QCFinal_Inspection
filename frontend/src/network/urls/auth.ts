import { request } from "@/network/network.ts";

export type LoginRequest = {
    username: string,
    password: string,
}

const path = "/auth"

export const loginRequest = (body: LoginRequest) => request({
    method: "POST",
    url: `${path}/login`,
    data: body,
})

export const logoutRequest = () => request({
    method: 'POST',
    url: `${path}/logout`,
})

export const validateSession = () => request({
    method: 'GET',
    url: `${path}/validate-session`,
})
