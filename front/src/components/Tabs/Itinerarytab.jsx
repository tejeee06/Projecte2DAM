import React, { useState, useEffect } from 'react';
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
        touchAction: 'none'
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

const ItineraryTab = ({ cities, totalTripDays, onCitiesUpdate }) => {
    
    const usedDays = cities.reduce((acc, city) => acc + city.days, 0);
    const freeDays = totalTripDays - usedDays;
    const isOverLimit = freeDays < 0;
    const isExact = freeDays === 0;

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = cities.findIndex((i) => i.id === active.id);
            const newIndex = cities.findIndex((i) => i.id === over.id);
            
            const newItems = [...cities];
            const [movedItem] = newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, movedItem);
            
            onCitiesUpdate(newItems);
        }
    };

    const handleUpdateDays = (id, change) => {
        if (change > 0 && freeDays <= 0) return; 

        const newCities = cities.map(city => {
            if (city.id === id) {
                const newDays = city.days + change;
                return { ...city, days: Math.max(1, newDays) };
            }
            return city;
        });
        
        onCitiesUpdate(newCities);
    };

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
                            width: `${Math.min((usedDays / totalTripDays) * 100, 100)}%`,
                            backgroundColor: isExact ? '#ef5350' : '#66bb6a'
                        }}
                    ></div>
                </div>
            </div>

            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={cities.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <div className="cities-list-container">
                        {cities.map((city, index) => (
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
            
            {cities.length === 0 && (
                <div className="empty-state">No hi ha ciutats. Afegeix-ne una!</div>
            )}
        </div>
    );
};

export default ItineraryTab;