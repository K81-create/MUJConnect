
import { services, categories } from './src/data/services';

const seed = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/seed', {
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
