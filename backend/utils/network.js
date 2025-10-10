import isOnline from 'is-online';

export const checkInternetConnection = async () => {
    try {
        const online = await isOnline({
            timeout: 3000, 
            retries: 1,    
        });
        return online;
    } catch (e) {
        return false;
    }
};