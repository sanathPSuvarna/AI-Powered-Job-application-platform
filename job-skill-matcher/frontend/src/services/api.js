

const API_URL = "http://localhost:5000/api";

export const api = {
    test: () => fetch(`${API_URL}/test`)
        .then(response => response.json())
        .catch(error => console.error('Error:', error))
};

export default API_URL;
