/**
 * Game data for the "Who is the Imposter?" game
 * 
 * Easy to modify - just add/remove words from the arrays below!
 */

export interface Category {
    id: string;
    name: string;
    icon: string;
    words: string[];
    isCustom?: boolean;
}

/**
 * Predefined word categories
 * Each category should have at least 10 words for variety
 */
export const PREDEFINED_CATEGORIES: Category[] = [
    {
        id: 'animals',
        name: 'Animals',
        icon: '🐾',
        words: [
            'Dog', 'Cat', 'Lion', 'Elephant', 'Penguin',
            'Eagle', 'Dolphin', 'Tiger', 'Bear', 'Rabbit',
            'Giraffe', 'Monkey', 'Snake', 'Owl', 'Wolf',
            'Kangaroo', 'Panda', 'Zebra', 'Shark', 'Whale',
            'Horse', 'Cow', 'Goat', 'Sheep', 'Pig',
            'Chicken', 'Duck', 'Frog', 'Turtle', 'Crocodile',
            'Alligator', 'Leopard', 'Cheetah', 'Fox', 'Deer',
            'Bat', 'Bee', 'Butterfly', 'Ant', 'Spider',
            'Octopus', 'Crab', 'Lobster', 'Seal', 'Otter',
            'Hamster', 'Rat', 'Mouse', 'Parrot',
        ],
    },
    {
        id: 'food',
        name: 'Food',
        icon: '🍕',
        words: [
            'Pizza', 'Burger', 'Sushi', 'Pasta', 'Tacos',
            'Ice Cream', 'Chocolate', 'Salad', 'Steak', 'Soup',
            'Sandwich', 'Pancakes', 'Ramen', 'Curry', 'Donut',
            'Fried Rice', 'Lasagna', 'Hot Dog', 'Nachos', 'Waffles',
            'Fries', 'Burrito', 'Dumplings', 'Noodles', 'Kebab',
            'Spring Rolls', 'Samosa', 'Omelette', 'Toast', 'Bagel',
            'Cheesecake', 'Brownie', 'Cupcake', 'Popcorn', 'Pudding',
            'Apple', 'Banana', 'Orange', 'Mango', 'Grapes',
            'Watermelon', 'Strawberry', 'Pineapple', 'Avocado',
        ],
    },
    {
        id: 'movies',
        name: 'Movies',
        icon: '🎬',
        words: [
            'Titanic', 'Avatar', 'Inception', 'Frozen', 'Jaws',
            'Rocky', 'Gladiator', 'Shrek', 'Matrix', 'Joker',
            'Interstellar', 'Avengers', 'Jurassic Park', 'Star Wars',
            'Harry Potter', 'The Lion King', 'Toy Story',
            'Spider-Man', 'Batman', 'Terminator',
            'Iron Man', 'Black Panther', 'Doctor Strange',
            'Fast and Furious', 'Transformers',
            'Kung Fu Panda', 'Finding Nemo', 'Up',
            'Inside Out', 'Coco',
            'Godfather', 'Dark Knight', 'Forrest Gump',
            'Fight Club', 'Parasite', 'La La Land',
            'Dune', 'Oppenheimer', 'Barbie',
        ],
    },
    {
        id: 'sports',
        name: 'Sports',
        icon: '⚽',
        words: [
            'Football', 'Basketball', 'Tennis', 'Swimming', 'Golf',
            'Baseball', 'Hockey', 'Boxing', 'Volleyball', 'Rugby',
            'Skiing', 'Surfing', 'Wrestling', 'Cycling', 'Archery',
            'Badminton', 'Cricket', 'Gymnastics', 'Karate', 'Bowling',
            'Table Tennis', 'Handball', 'Fencing', 'Judo',
            'Skateboarding', 'Snowboarding', 'Diving',
            'Rowing', 'Sailing', 'Climbing',
            'Weightlifting', 'Powerlifting',
            'Marathon', 'Sprint', 'Triathlon',
            'Taekwondo', 'Kickboxing', 'Sumo',
        ]
    },
    {
        id: 'places',
        name: 'Places',
        icon: '🌍',
        words: [
            'Paris', 'Tokyo', 'New York', 'London', 'Sydney',
            'Dubai', 'Rome', 'Cairo', 'Mumbai', 'Beijing',
            'Los Angeles', 'Moscow', 'Berlin', 'Barcelona',
            'Amsterdam', 'Singapore', 'Bangkok', 'Istanbul',
            'Toronto', 'Rio de Janeiro',
            'Seoul', 'Hong Kong', 'Shanghai', 'San Francisco',
            'Chicago', 'Boston', 'Las Vegas',
            'Venice', 'Florence', 'Milan',
            'Madrid', 'Lisbon', 'Prague',
            'Vienna', 'Zurich', 'Stockholm',
            'Oslo', 'Helsinki', 'Copenhagen',
            'Reykjavik', 'Athens', 'Budapest',
            'Warsaw', 'Krakow',
        ],
    },
    {
        id: 'professions',
        name: 'Jobs',
        icon: '👔',
        words: [
            'Doctor', 'Teacher', 'Chef', 'Pilot', 'Engineer',
            'Artist', 'Lawyer', 'Firefighter', 'Police Officer',
            'Nurse', 'Astronaut', 'Architect', 'Dentist',
            'Scientist', 'Actor', 'Mechanic', 'Writer',
            'Photographer', 'Farmer', 'Musician',
            'Singer', 'Dancer', 'YouTuber', 'Streamer',
            'Game Developer', 'Web Developer',
            'Data Scientist', 'AI Engineer',
            'Electrician', 'Plumber',
            'Carpenter', 'Designer',
            'Product Manager', 'Marketing Manager',
            'Salesperson', 'HR Manager',
            'Translator', 'Interpreter',
        ],
    },
    {
        id: 'objects',
        name: 'Objects',
        icon: '📦',
        words: [
            'Phone', 'Computer', 'Television', 'Refrigerator',
            'Clock', 'Camera', 'Umbrella', 'Mirror',
            'Lamp', 'Wallet', 'Backpack', 'Sunglasses',
            'Headphones', 'Keyboard', 'Bottle',
            'Scissors', 'Hammer', 'Pillow',
            'Toothbrush', 'Candle',
            'Chair', 'Table', 'Sofa',
            'Bed', 'Door', 'Window',
            'Fan', 'Air Conditioner',
            'Microwave', 'Oven',
            'Plate', 'Spoon', 'Fork',
            'Knife', 'Mug',
            'Notebook', 'Pen', 'Pencil',
            'Charger', 'Power Bank',
            'Watch', 'Remote',
        ],
    },
    {
        id: 'nature',
        name: 'Nature',
        icon: '🌲',
        words: [
            'Mountain', 'Ocean', 'Forest', 'Desert', 'River',
            'Volcano', 'Waterfall', 'Beach', 'Island',
            'Cave', 'Rainbow', 'Lightning',
            'Sunset', 'Snowflake', 'Tornado',
            'Glacier', 'Canyon', 'Jungle',
            'Lake', 'Meadow',
            'Valley', 'Hill', 'Cliff',
            'Storm', 'Cloud', 'Rain',
            'Wind', 'Earthquake',
            'Tsunami', 'Aurora',
            'Coral Reef', 'Savanna',
            'Wetland', 'Mangrove',
            'Delta', 'Lagoon',
            'Spring', 'Autumn',
        ],
    },
];

/**
 * Get a random word pair for the game
 * Returns two different words from the same category
 */
export function getRandomWordPair(category: Category): { realWord: string; imposterWord: string } {
    const words = [...category.words];

    // Shuffle and pick two different words
    const shuffled = words.sort(() => Math.random() - 0.5);

    return {
        realWord: shuffled[0],
        imposterWord: shuffled[1],
    };
}

/**
 * Get a random player to be the imposter
 */
export function getRandomImposterIndex(playerCount: number): number {
    return Math.floor(Math.random() * playerCount);
}

/**
 * Get a random starting player
 */
export function getRandomStartingPlayer(playerCount: number): number {
    return Math.floor(Math.random() * playerCount) + 1; // 1-indexed for display
}
