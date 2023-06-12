import { Product } from './models';

const products: Array<Product> = [
  {
    "count": 4,
    "description": "Spiderman Suit in color blue. Can throw web and stick to the walls. Hypoallergenic.",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    "price": 249.99,
    "title": "Spiderman Suit (blue)"
  },
  {
    "count": 6,
    "description": "Spiderman Suit in color black. Can throw web and stick to the walls. Hypoallergenic.",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a0",
    "price": 269.99,
    "title": "Spiderman Suit (black)"
  },
  {
    "count": 7,
    "description": "Shield made from Vibranium. Provides high protection from standard weapons, energy-based weapons powered by the Tesseract.",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    "price": 159.99,
    "title": "Captain America's Shield"
  },
  {
    "count": 12,
    "description": "The hammer of the thunder god Thor. Can be used as a devastating weapon and as a divine instrument to provide blessings.",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
    "price": 259.99,
    "title": "Mjölnir"
  },
  {
    "count": 7,
    "description": "Known as the Bleeding Edge armor. Has rocket thrusters that allows to travel in deep space. Has the ability to form around the owner using nanotechnology. Can regenerate itself if it sustains damage.",
    "id": "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    "price": 1099.99,
    "title": "Mark L"
  },
  {
    "count": 8,
    "description": "A pair of specialized tools used by former S.H.I.E.L.D. agent and Avenger, Hawkeye. Serving as his primary weapons, Hawkeye carries a unique, collapsible recurve bow along with a mechanized quiver that stores and deploys his trick arrows.",
    "id": "7567ec4b-b10c-48c5-9345-fc73348a80a4",
    "price": 99.99,
    "title": "Hawkeye's Bow and Quiver"
  },
  {
    "count": 2,
    "description": "A magical relic that is able to move and fly on its own power, enabling its user to levitate and hover in the air.",
    "id": "7567ec4b-b10c-48c5-9445-fc73c48a80a5",
    "price": 119.99,
    "title": "Cloak of Levitation"
  }
];

export default {
  getProductById: (id: string) => {
    const product = products.find((item) => item.id === id);
    return product ? Promise.resolve(product) : Promise.reject({ error: 404, message: 'Product not found' });
  },
  getProducts: () => Promise.resolve(products)
}