import { useState, useEffect } from "react";

interface BackgroundSlideshowProps {
    images: string[];
    interval?: number;
}

export function BackgroundSlideshow({ images, interval = 5000 }: BackgroundSlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, interval);
        return () => clearInterval(timer);
    }, [images.length, interval]);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40 z-10" />

            {images.map((img, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <img
                        src={img}
                        alt={`Background slide ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
        </div>
    );
}
