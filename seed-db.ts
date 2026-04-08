
import { services, categories } from './src/data/services';


const seed = async () => {
    try {
        const response = await fetch('https://mujconnect-3lj9.onrender.com/api/seed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ services, categories }),
        });
        const result = await response.json();
        console.log(result);
    } catch (error) {
        console.error('Error seeding:', error);
    }
};

seed();
