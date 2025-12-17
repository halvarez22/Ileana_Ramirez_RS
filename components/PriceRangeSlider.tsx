import React, { useCallback, useEffect, useState, useRef } from 'react';

interface PriceRangeSliderProps {
    min: number;
    max: number;
    onChange: (values: { min: number; max: number }) => void;
    value: { min: number; max: number };
    step?: number;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({ min, max, onChange, value, step = 50000 }) => {
    const [minVal, setMinVal] = useState(value.min);
    const [maxVal, setMaxVal] = useState(value.max);
    const minValRef = useRef<HTMLInputElement>(null);
    const maxValRef = useRef<HTMLInputElement>(null);
    const range = useRef<HTMLDivElement>(null);

    // Convert to percentage
    const getPercent = useCallback(
        (value: number) => Math.round(((value - min) / (max - min)) * 100),
        [min, max]
    );

    // Sync parent state with local state and update range bar
    useEffect(() => {
        setMinVal(value.min);
        setMaxVal(value.max);

        if (maxValRef.current) {
            const minPercent = getPercent(value.min);
            const maxPercent = getPercent(value.max);

            if (range.current) {
                range.current.style.left = `${minPercent}%`;
                range.current.style.width = `${maxPercent - minPercent}%`;
            }
        }
    }, [value, getPercent]);

    const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.min(Number(event.target.value), maxVal - step);
        setMinVal(value);
        onChange({ min: value, max: maxVal });
    };
    
    const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(Number(event.target.value), minVal + step);
        setMaxVal(value);
        onChange({ min: minVal, max: value });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(price);
    };

    return (
        <div className="relative flex flex-col items-center justify-center pt-4 pb-2">
             <div className="flex justify-between w-full mb-2 text-sm text-gray-800 font-medium">
                <span>{formatPrice(minVal)}</span>
                <span>{formatPrice(maxVal)}</span>
            </div>
            <div className="w-full relative h-4 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    ref={minValRef}
                    onChange={handleMinChange}
                    step={step}
                    className="thumb thumb--zindex-3"
                    aria-label="Precio mínimo"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    ref={maxValRef}
                    onChange={handleMaxChange}
                    step={step}
                    className="thumb thumb--zindex-4"
                    aria-label="Precio máximo"
                />

                <div className="relative w-full">
                    <div className="absolute rounded h-1 bg-gray-200 w-full z-10 top-0"></div>
                    <div ref={range} className="absolute rounded h-1 bg-inverland-green z-20 top-0"></div>
                </div>
            </div>
        </div>
    );
};

export default PriceRangeSlider;
