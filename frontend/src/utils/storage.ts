const keyStorageToken = 'system-token'

const storage = {
    getToken: (): string | null => {
        return localStorage.getItem(keyStorageToken)
    },

    setToken: (token: string) => {
        localStorage.setItem(keyStorageToken, token)
    },

    clearToken: () => {
        localStorage.removeItem(keyStorageToken)
    }
}

export default storage
