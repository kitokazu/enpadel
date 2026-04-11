"use client";

import { useState, useEffect } from "react";

const images = ["/hero-1.jpg", "/hero-2.jpg", "/hero-3.jpg"];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-slideshow">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`hero-slide${i === current ? " active" : ""}`}
        />
      ))}
    </div>
  );
}
