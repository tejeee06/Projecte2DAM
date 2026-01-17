import React, { useState, useEffect, useMemo } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './Itinerarytab.css';

const SortableCityItem = ({ city, index, onUpdateDays, freeDays }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: city.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };
    const canIncrease = freeDays > 0;
    const canDecrease = city.days > 1;

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            className="city-card-modern"
        >
            <div className="order-circle">
                {index + 1}
            </div>

            <div className="city-info">
                <h3>{city.name}</h3>
                <span className="country-badge">{city.country}</span>
            </div>

            <div 
                className="days-control-wrapper" 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={(e) => e.stopPropagation()}
            >
                <span className="days-label">Durada:</span>
                <div className="days-stepper">
                    <button 
                        className="stepper-btn" 
                        onClick={() => onUpdateDays(city.id, -1)}
                        disabled={!canDecrease}
                    >
                        -
                    </button>
                    <span className="days-value">{city.days} dies</span>
                    <button 
                        className="stepper-btn" 
                        onClick={() => onUpdateDays(city.id, 1)}
                        disabled={!canIncrease}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

const ItineraryTab = ({ cities: initialCities, startDate, endDate, onCitiesUpdate, tripId }) => {

    const [localCities, setLocalCities] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const STORAGE_KEY = `trip_itinerary_${tripId || 'temp'}`;
    const totalTripDays = useMemo(() => {
        if (!startDate || !endDate) return 0;

        const start = new Date(startDate);
        const end = new Date(endDate);

        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const diffTime = end - start;
        const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24)); 
        
        return diffDays + 1;
    }, [startDate, endDate]);

    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                const savedConfig = new Map(parsedData.map(c => [c.id, c]));

                const mergedCities = initialCities.map(city => {
                    const saved = savedConfig.get(city.id);
                    return {
                        ...city,
                        days: saved ? saved.days : (city.days || 1)
                    };
                });

                mergedCities.sort((a, b) => {
                    const indexA = parsedData.findIndex(p => p.id === a.id);
                    const indexB = parsedData.findIndex(p => p.id === b.id);
                    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                    return 0;
                });

                setLocalCities(mergedCities);
            } catch (e) {
                console.error("Error cargando localStorage", e);
                setLocalCities(initialCities.map(c => ({...c, days: c.days || 1})));
            }
        } else {
            const citiesWithDefaultDays = initialCities.map(c => ({
                ...c,
                days: c.days || 1 
            }));
            setLocalCities(citiesWithDefaultDays);
        }
        setIsLoaded(true);
    }, [initialCities, tripId]); 

    const updateStateAndNotify = (newCities) => {
        setLocalCities(newCities);
        
        if (onCitiesUpdate) {
            onCitiesUpdate(newCities);
        }

        const simplifiedData = newCities.map(c => ({ id: c.id, days: c.days }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(simplifiedData));
    };

    const usedDays = localCities.reduce((acc, city) => acc + (city.days || 0), 0);
    const freeDays = totalTripDays - usedDays;
    const isOverLimit = freeDays < 0;
    const isExact = freeDays === 0;

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = localCities.findIndex((i) => i.id === active.id);
            const newIndex = localCities.findIndex((i) => i.id === over.id);
            
            const newItems = [...localCities];
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);
            
            updateStateAndNotify(newItems);
        }
    };

    const handleUpdateDays = (id, change) => {
        if (change > 0 && freeDays <= 0) return;

        const newCities = localCities.map(city => {
            if (city.id === id) {
                const newDays = city.days + change;
                return { ...city, days: Math.max(1, newDays) };
            }
            return city;
        });
        
        updateStateAndNotify(newCities);
    };

    if (!isLoaded) return <div>Carregant itinerari...</div>;

    return (
        <div className="itinerary-wrapper">
            
            <div className={`days-progress-container ${isExact ? 'status-full' : ''} ${isOverLimit ? 'status-error' : ''}`}>
                <div className="progress-text">
                    {isExact ? (
                        <>
                            <span className="icon-cross">✖</span> 
                            <span>Tens <strong>0</strong> dies lliures</span>
                        </>
                    ) : (
                        <>
                            <span className="icon-check">✔</span> 
                            <span>Tens <strong>{freeDays}</strong> dies lliures</span>
                        </>
                    )}
                </div>
                <div className="progress-track">
                    <div 
                        className="progress-fill" 
                        style={{ 
                            width: `${totalTripDays > 0 ? Math.min((usedDays / totalTripDays) * 100, 100) : 0}%`,
                            backgroundColor: isOverLimit ? '#ef5350' : (isExact ? '#4caf50' : '#66bb6a')
                        }}
                    ></div>
                </div>
            </div>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={localCities.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="cities-list-container">
                        {localCities.map((city, index) => (
                            <SortableCityItem 
                                key={city.id} 
                                city={city} 
                                index={index} 
                                onUpdateDays={handleUpdateDays}
                                freeDays={freeDays}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
            
            {localCities.length === 0 && (
                <div className="empty-state">No hi ha ciutats. Afegeix-ne una!</div>
            )}
        </div>
    );
};

export default ItineraryTab;