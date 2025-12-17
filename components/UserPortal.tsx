import React from 'react';
import { useAuth } from './AuthContext';

type View = 'home' | 'login' | 'dashboard' | 'userPortal' | 'addProperty' | 'editProperty' | 'agents' | 'tracking' | 'userManagement' | 'clients' | 'marketing' | 'analytics';

interface UserPortalProps {
    onNavigate: (view: View) => void;
}

interface ManagementCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}

const AddPropertyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const AgentsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const TrackingIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
);

const UserAddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);

const EditPropertyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
);

const ClientsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125a4 4 0 00-6.44 0A6 6 0 003 20v1h12z" />
    </svg>
);

const MarketingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514C18.378 1.21 18.755 1 19 1c.39 0 .74.22.923.55.18.32.16.71-.058 1.002L15.999 9.5l4.53 6.953c.218.332.24.782.058 1.102-.18.33-.532.545-.922.545-.245 0-.622-.21-.93-.514A7.625 7.625 0 0017.832 15H7a4 4 0 01-1.564-.317z" />
    </svg>
);

const AnalyticsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const ManagementCard: React.FC<ManagementCardProps> = ({ title, description, icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-white rounded-lg shadow-ileana-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out group text-left p-4 md:p-6 flex flex-col items-start cursor-pointer border border-ileana-orange/20"
        >
            <div className="bg-ileana-navy p-4 rounded-lg mb-4 group-hover:bg-ileana-orange transition-colors duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-ileana-navy mb-2">{title}</h3>
            <p className="text-gray-600 flex-grow">{description}</p>
             <span className="mt-4 text-ileana-orange font-semibold group-hover:text-ileana-navy transition-colors duration-300">
                Acceder &rarr;
            </span>
        </button>
    );
};

const UserPortal: React.FC<UserPortalProps> = ({ onNavigate }) => {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return (
            <section className="py-16 md:py-24 bg-ileana-light-gray">
                <div className="container mx-auto px-4 sm:px-6 text-center">
                    <h2 className="text-2xl font-bold text-ileana-navy">Por favor, inicia sesión para ver tu portal.</h2>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 md:py-24 bg-ileana-light-gray min-h-screen">
            <div className="container mx-auto px-4 sm:px-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-ileana-navy mb-4">
                    Portal de Gestión
                </h2>
                <p className="text-lg text-ileana-orange mb-12">Bienvenido, {currentUser.username}. Desde aquí puedes administrar la plataforma.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    <ManagementCard 
                        title="Alta Inmuebles"
                        description="Registra nuevas casas, departamentos o terrenos en el sistema."
                        icon={<AddPropertyIcon />}
                        onClick={() => onNavigate('addProperty')}
                    />
                    <ManagementCard 
                        title="Edición de Fichas"
                        description="Modifica y actualiza los datos de inmuebles ya registrados en el sistema."
                        icon={<EditPropertyIcon />}
                        onClick={() => onNavigate('editProperty')}
                    />
                    <ManagementCard 
                        title="Gestión de Clientes"
                        description="Administra tu base de datos de clientes potenciales y existentes."
                        icon={<ClientsIcon />}
                        onClick={() => onNavigate('clients')}
                    />
                    <ManagementCard 
                        title="Seguimiento"
                        description="Monitorea el estatus de los inmuebles y el pipeline de ventas."
                        icon={<TrackingIcon />}
                        onClick={() => onNavigate('tracking')}
                    />
                    <ManagementCard 
                        title="Marketing y Campañas"
                        description="Crea, segmenta y envía campañas de email a tu base de datos."
                        icon={<MarketingIcon />}
                        onClick={() => onNavigate('marketing')}
                    />
                    <ManagementCard 
                        title="Analítica y Reportes"
                        description="Visualiza métricas clave y reportes de rendimiento del negocio."
                        icon={<AnalyticsIcon />}
                        onClick={() => onNavigate('analytics')}
                    />
                    <ManagementCard 
                        title="Agentes"
                        description="Administra los agentes y asigna propiedades a sus portafolios."
                        icon={<AgentsIcon />}
                        onClick={() => onNavigate('agents')}
                    />
                    <ManagementCard 
                        title="Alta Usuarios"
                        description="Crear, ver y gestionar las cuentas de usuario de la plataforma."
                        icon={<UserAddIcon />}
                        onClick={() => onNavigate('userManagement')}
                    />
                </div>
            </div>
        </section>
    );
};

export default UserPortal;