import React, { useState } from 'react';

interface AppointmentModalProps {
    onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        time: '09:00',
        notes: '',
    });
    
    const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; date?: string }>({});

    const getTodayString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const validateForm = (): boolean => {
        const newErrors: { name?: string; email?: string; phone?: string; date?: string } = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es obligatorio.';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Por favor, introduce un email válido.';
        }

        if (!formData.date) {
            newErrors.date = 'La fecha es obligatoria.';
        }

        if (formData.phone && !/^[+\d\s]+$/.test(formData.phone)) {
            newErrors.phone = 'El teléfono solo puede contener números, espacios y "+".';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const { name, email, phone, date, time, notes } = formData;
        const startTime = new Date(`${date}T${time}:00`);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); 

        const toGoogleFormat = (date: Date) => date.toISOString().replace(/[-:]|\.\d{3}/g, '');
        const googleDates = `${toGoogleFormat(startTime)}/${toGoogleFormat(endTime)}`;
        const eventDetails = `Cita con ${name}.\nEmail: ${email}\nTeléfono: ${phone}\n\nNotas:\n${notes}`;
        const eventLocation = "Oficinas de Grupo Inverland, Calle Nubes 219, Col. Jardines de Moral, 37160, León Gto. MX.";
        
        const calendarUrl = new URL('https://www.google.com/calendar/render');
        calendarUrl.searchParams.append('action', 'TEMPLATE');
        calendarUrl.searchParams.append('text', `Cita Inverland - ${name}`);
        calendarUrl.searchParams.append('dates', googleDates);
        calendarUrl.searchParams.append('details', eventDetails);
        calendarUrl.searchParams.append('location', eventLocation);
        calendarUrl.searchParams.append('add', 'inverlandnet@gmail.com');

        window.open(calendarUrl.toString(), '_blank');
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-fade-in">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 id="modal-title" className="text-2xl font-bold text-inverland-dark">Agendar una Cita</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre completo</label>
                        <input 
                            type="text" 
                            name="name" 
                            id="name" 
                            value={formData.name} 
                            onChange={handleInputChange} 
                            required 
                            className={`mt-1 block w-full input-style ${errors.name ? '!border-red-500 focus:!ring-red-500' : ''}`}
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? 'name-error' : undefined}
                        />
                        {errors.name && <p id="name-error" className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            id="email" 
                            value={formData.email} 
                            onChange={handleInputChange} 
                            required 
                            className={`mt-1 block w-full input-style ${errors.email ? '!border-red-500 focus:!ring-red-500' : ''}`}
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                        />
                        {errors.email && <p id="email-error" className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
                        <input 
                            type="tel" 
                            name="phone" 
                            id="phone" 
                            value={formData.phone} 
                            onChange={handleInputChange} 
                            className={`mt-1 block w-full input-style ${errors.phone ? '!border-red-500 focus:!ring-red-500' : ''}`}
                            aria-invalid={!!errors.phone}
                            aria-describedby={errors.phone ? 'phone-error' : undefined}
                        />
                        {errors.phone && <p id="phone-error" className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Fecha</label>
                             <input 
                                type="date" 
                                name="date" 
                                id="date" 
                                value={formData.date} 
                                onChange={handleInputChange} 
                                required 
                                min={getTodayString()} 
                                className={`mt-1 block w-full input-style ${errors.date ? '!border-red-500 focus:!ring-red-500' : ''}`}
                                aria-invalid={!!errors.date}
                                aria-describedby={errors.date ? 'date-error' : undefined}
                            />
                             {errors.date && <p id="date-error" className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Hora</label>
                            <input
                                type="time"
                                name="time"
                                id="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                                min="09:00"
                                max="18:00"
                                step="3600"
                                className="mt-1 block w-full input-style"
                            />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notas (Opcional)</label>
                        <textarea name="notes" id="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="mt-1 block w-full input-style" placeholder="¿Hay alguna propiedad en particular que te interese?"></textarea>
                    </div>

                    <div className="p-5 pt-0 -mx-6 -mb-6 mt-6 border-t bg-gray-50 flex justify-end space-x-4 rounded-b-lg">
                        <button onClick={onClose} type="button" className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-6 py-2 bg-inverland-green text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors">
                            Confirmar Cita
                        </button>
                    </div>
                </form>

                 <style>{`
                        .input-style { 
                            background-color: white; 
                            color: #1F2937; 
                            border-radius: 0.375rem; 
                            border-width: 1px; 
                            border-color: #D1D5DB; 
                            padding: 0.5rem 0.75rem; 
                            width: 100%; 
                            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                            transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                        } 
                        .input-style:focus { 
                            outline: 2px solid transparent; 
                            outline-offset: 2px; 
                            --tw-ring-color: #083d5c; 
                            box-shadow: 0 0 0 2px var(--tw-ring-color); 
                            border-color: #083d5c; 
                        }
                        select.input-style {
                            -webkit-appearance: none;
                            -moz-appearance: none;
                            appearance: none;
                            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
                            background-position: right 0.5rem center;
                            background-repeat: no-repeat;
                            background-size: 1.5em 1.5em;
                            padding-right: 2.5rem;
                        }
                    `}</style>
            </div>
        </div>
    );
};

export default AppointmentModal;