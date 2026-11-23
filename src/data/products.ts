import cake2 from "../assets/cake-2.jpg";
import cake4 from "../assets/cake-4.jpg";
import cake5 from "../assets/cake-5.jpg";
import cara1 from "../assets/cara-1.jpg";
import cara2 from "../assets/cara-2.jpg";
import cara3 from "../assets/cara-3.jpg";
import cara4 from "../assets/cara-4.jpg";
import type { Product } from "../components/ProductCard";

export const products: Product[] = [
  {
    name: "Berry cloud",
    description: "Vanilla sponge · berries · cream",
    price: "₹1,250",
    tag: "Bestseller",
    category: "Wedding Cakes",
    image: cara1,
  },
  {
    name: "Chocolate muse",
    description: "Dark chocolate · ganache · sea salt",
    price: "₹1,450",
    category: "Party Cakes",
    image: cara2,
  },
  {
    name: "Pistachio petal",
    description: "Pistachio · rose · white chocolate",
    price: "₹1,350",
    tag: "New",
    category: "Wedding Cakes",
    image: cara3,
  },
  {
    name: "Red velvet",
    description: "Velvet sponge · cream cheese · cocoa",
    price: "₹1,550",
    category: "Birthday Cakes",
    image: cara4,
  },
  {
    name: "Red velvet",
    description: "Velvet sponge · cream cheese · cocoa",
    price: "₹1,550",
    category: "Birthday Cakes",
    image: cara4,
  },
  {
    name: "Orange layer",
    description: "Orange curd · vanilla · toasted almond",
    price: "₹1,550",
    category: "Cake Jars",
    image: cake4,
  },
  {
    name: "Chocolate delight",
    description: "Caramel · chocolate · hazelnut",
    price: "₹1,550",
    category: "Party Cakes",
    image: cake2,
  },
  {
    name: "Strawberry daydream",
    description: "Strawberry · vanilla · whipped cream",
    price: "₹1,400",
    category: "Cake Jars",
    image: cake5,
  },
  {
    name: "Midnight fudge",
    description: "Fudge sponge · dark ganache · cacao",
    price: "₹1,600",
    category: "Party Cakes",
    image: cara2,
  },
];
