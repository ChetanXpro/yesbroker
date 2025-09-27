"use client";
import { useState, useRef, useEffect } from "react";

interface PropertyImageSliderProps {
    images: string[];
    title: string;
    className?: string;
}

export function PropertyImageSlider({ images, title, className = "" }: PropertyImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // If no images, show placeholder
    if (!images || images.length === 0) {
        return (
            <div className={`relative h-48 bg-gray-200 rounded-lg overflow-hidden ${className}`}>
                <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                </div>
            </div>
        );
    }

    // Single image - no slider needed
    if (images.length === 1) {
        return (
            <div className={`relative h-48 bg-gray-200 rounded-lg overflow-hidden ${className}`}>
                <img
                    src={images[0]}
                    alt={title}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        if (sliderRef.current) {
            const slideWidth = sliderRef.current.offsetWidth;
            sliderRef.current.scrollTo({
                left: index * slideWidth,
                behavior: 'smooth'
            });
        }
    };

    const goToNext = () => {
        const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        goToSlide(nextIndex);
    };

    const goToPrev = () => {
        const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        goToSlide(prevIndex);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
        setScrollLeft(sliderRef.current?.scrollLeft || 0);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !sliderRef.current) return;
        e.preventDefault();
        const x = e.pageX - (sliderRef.current.offsetLeft || 0);
        const walk = (x - startX) * 2;
        sliderRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        // Snap to nearest slide
        if (sliderRef.current) {
            const slideWidth = sliderRef.current.offsetWidth;
            const newIndex = Math.round(sliderRef.current.scrollLeft / slideWidth);
            setCurrentIndex(Math.max(0, Math.min(newIndex, images.length - 1)));
        }
    };

    const handleScroll = () => {
        if (!sliderRef.current || isDragging) return;
        const slideWidth = sliderRef.current.offsetWidth;
        const newIndex = Math.round(sliderRef.current.scrollLeft / slideWidth);
        setCurrentIndex(newIndex);
    };

    return (
        <div
            className={`relative h-48 bg-gray-200 rounded-lg overflow-hidden group ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Slider */}
            <div
                ref={sliderRef}
                className="flex w-full h-full overflow-x-scroll scrollbar-hide cursor-grab active:cursor-grabbing"
                style={{ scrollSnapType: 'x mandatory' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onScroll={handleScroll}
            >
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="flex-shrink-0 w-full h-full"
                        style={{ scrollSnapAlign: 'start' }}
                    >
                        <img
                            src={image}
                            alt={`${title} - Image ${index + 1}`}
                            className="w-full h-full object-cover select-none"
                            draggable={false}
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToPrev();
                        }}
                        className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNext();
                        }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                goToSlide(index);
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                index === currentIndex
                                    ? 'bg-white scale-110'
                                    : 'bg-white/60 hover:bg-white/80'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
}