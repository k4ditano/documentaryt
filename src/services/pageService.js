import axios from 'axios';
const API_URL = '/api/pages';
export const pageService = {
    getPages: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },
    getPage: async (id) => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },
    createPage: async (page) => {
        const response = await axios.post(API_URL, page);
        return response.data;
    },
    updatePage: async (id, page) => {
        const response = await axios.put(`${API_URL}/${id}`, page);
        return response.data;
    },
    deletePage: async (id) => {
        await axios.delete(`${API_URL}/${id}`);
    }
};
