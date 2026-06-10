export type Category = {
  id: number;
  title: string;
  description: string;
  accent: string;
  countLabel: string;
  image: string;
  alt: string;
};

export type FeaturedProduct = {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string;
  etiqueta: string;
  formato: string;
  tonos: [string, string];
  image: string;
  alt: string;
};

export type BrandValue = {
  id: number;
  title: string;
  description: string;
};

export const categories: Category[] = [
  {
    id: 1,
    title: "Animales en cerámica",
    description: "Piezas únicas de animales hechas a mano, con acabados artesanales y presencia cálida.",
    accent: "from-[#d8b49a] to-[#a9694f]",
    countLabel: "Colección animal",
    image: "/categorias/jarrones.png",
    alt: "Figuras de animales en cerámica",
  },
  {
    id: 2,
    title: "Frutas en cerámica",
    description: "Miniaturas de frutas esmaltadas con acabado brillante para decorar cocinas y bandejas.",
    accent: "from-[#c9b8a7] to-[#8d6b5a]",
    countLabel: "Colección frutal",
    image: "/categorias/frutas.png",
    alt: "Miniaturas de frutas en cerámica",
  },
  {
    id: 3,
    title: "Piezas temáticas",
    description: "Objetos con carácter, ideales para regalos, vitrinas pequeñas y colecciones con personalidad.",
    accent: "from-[#e8d8c8] to-[#bc8b67]",
    countLabel: "Serie especial",
    image: "/categorias/brujas.png",
    alt: "Piezas temáticas de cerámica",
  },
];


export const featuredProducts: FeaturedProduct[] = [
  {
    id: 1,                   
    nombre: "Loro azul",    
    precio: 85.50,   
    descripcion: "Ceramica artesanal de un loro azul. Pieza decorativa hecha a mano con acabados brillantes.",
    etiqueta: "Nueva colección",
    formato: "Figura decorativa",
    tonos: ["#d9bfae", "#b77d59"],
    image: "/categorias/loro.png",
    alt: "Figura de loro azul de cerámica",
  },
];

export const brandValues: BrandValue[] = [
  {
    id: 1,
    title: "Diseño con intención",
    description: "Cada pieza es pensada para destacar, combinando estética y funcionalidad.",
  },
  {
    id: 2,
    title: "Trabajo artesanal",
    description: "Nada es en serie: cada producto tiene detalles únicos que lo hacen especial.",
  },
  {
    id: 3,
    title: "Hecho para tu espacio",
    description: "Creamos piezas que se adaptan a tu estilo y aportan personalidad a tu entorno.",
  },
];