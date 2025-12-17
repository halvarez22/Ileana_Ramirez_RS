
import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import { PropertyProvider, useProperties } from './components/PropertyContext';
import { ClientProvider } from './components/ClientContext';
import { CampaignProvider } from './components/CampaignContext';
import { Property, PropertyFilters, Client } from './types';
import { parseSearchQuery } from './services/geminiService';
import { useConnectionStatus } from './hooks/useConnectionStatus';

// Component Imports
import Header from './components/Header';
import Hero from './components/Hero';
import PropertyListings from './components/PropertyListings';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import Chatbot from './components/Chatbot';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import UserPortal from './components/UserPortal';
import PropertyDetailPage from './components/PropertyDetailPage';
import AddProperty from './components/AddProperty';
import EditPropertyPage from './components/EditPropertyPage';
import AgentsPage from './components/AgentsPage';
import TrackingPage from './components/TrackingPage';
import UserManagementPage from './components/UserManagementPage';
import ScrollingBanner from './components/ScrollingBanner';
import AppointmentModal from './components/AppointmentModal';
import ClientsPage from './components/ClientsPage';
import MarketingPage from './components/MarketingPage';
import AnalyticsPage from './components/AnalyticsPage';
import AgentPortal from './components/AgentPortal';
import ClientDetailPage from './components/ClientDetailPage';
import AgentPropertyDetailPage from './components/AgentPropertyDetailPage';
import AboutPage from './components/AboutPage';
import ServiciosPage from './components/ServiciosPage';
import ContactPage from './components/ContactPage';
import DataMigration from './components/DataMigration';
import SyncStatus from './components/SyncStatus';

type View =
    | 'home'
    | 'login'
    | 'dashboard'
    | 'userPortal'
    | 'propertyDetail'
    | 'addProperty'
    | 'editProperty'
    | 'agents'
    | 'tracking'
    | 'userManagement'
    | 'clients'
    | 'marketing'
    | 'analytics'
    | 'agentPortal'
    | 'clientDetail'
    | 'agentPropertyDetail'
    | 'about'
    | 'contact'
    | 'servicios';

function App() {
    const { isAuthenticated, currentUser, logout: authLogout } = useAuth();
    const { properties } = useProperties();
    const { isOnline, lastSync } = useConnectionStatus();
    const [view, setView] = useState<View>('home');
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isAppointmentModalOpen, setAppointmentModalOpen] = useState(false);
    
    const [filters, setFilters] = useState<Partial<PropertyFilters>>({});
    const [isSearching, setIsSearching] = useState(false);
    const propertyListingsRef = useRef<HTMLDivElement>(null);

    const handleNavigate = (newView: View) => {
        setView(newView);
        window.scrollTo(0, 0);
    };

    const handleNavigateToProperties = () => {
        handleNavigate('home');
        setTimeout(() => {
            propertyListingsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleViewProperty = (property: Property) => {
        setSelectedProperty(property);
        handleNavigate('propertyDetail');
    };
    
    const handleViewAgentProperty = (property: Property) => {
        setSelectedProperty(property);
        handleNavigate('agentPropertyDetail');
    };

    const handleViewClient = (client: Client) => {
        setSelectedClient(client);
        handleNavigate('clientDetail');
    };

    const handleBackToList = () => {
        setSelectedProperty(null);
        handleNavigate('home');
        setTimeout(() => {
             propertyListingsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleLoginSuccess = () => {
        // Redirection logic is now in useEffect
        handleNavigate('userPortal');
    };

    const handleLogout = () => {
        authLogout();
        setSelectedProperty(null);
        setSelectedClient(null);
        handleNavigate('home');
    };

    const handleNavClick = (href: string) => {
        if (href === '#about') {
            handleNavigate('about');
        } else if (href === '#contact') {
            handleNavigate('contact');
        } else if (href === '#servicios') {
            handleNavigate('servicios');
        } else if (href === '#properties') {
            handleNavigate('home');
            setTimeout(() => {
                propertyListingsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const element = document.querySelector(href);
            element?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        try {
            const parsedFilters = await parseSearchQuery(query);
            setFilters(parsedFilters);
            propertyListingsRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error("Error during AI search:", error);
        } finally {
            setIsSearching(false);
        }
    };
    
    // Redirect logic after login
    useEffect(() => {
        if (isAuthenticated && view === 'userPortal') {
            if (currentUser?.role === 'admin') {
                // Admins stay on userPortal to see all options
            } else if (currentUser?.role === 'agent' || currentUser?.role === 'user') {
                handleNavigate('agentPortal');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, currentUser, view]);


    const renderContent = () => {
        console.log('App.tsx - renderContent called with view:', view);
        const homePage = (
            <>
                <Hero onSearch={handleSearch} isSearching={isSearching} />
                <ScrollingBanner />
                <div ref={propertyListingsRef}>
                    <PropertyListings properties={properties} filters={filters} setFilters={setFilters} onViewProperty={handleViewProperty} />
                </div>
                <ContactSection />
            </>
        );

        if (!isAuthenticated) {
            switch (view) {
                case 'login': return <LoginPage onLoginSuccess={handleLoginSuccess} />;
                case 'propertyDetail': return selectedProperty ? <PropertyDetailPage property={selectedProperty} onBack={handleBackToList} /> : homePage;
                case 'about': 
                    console.log('App.tsx - Rendering AboutPage (not authenticated)');
                    return <AboutPage 
                        onNavigate={(view: View) => {
                            console.log('App.tsx - AboutPage onNavigate called with view:', view);
                            handleNavigate(view);
                        }}
                        onNavigateToProperties={handleNavigateToProperties}
                    />;
                case 'contact': return <ContactPage />;
                case 'servicios': return <ServiciosPage />;
                default: return homePage;
            }
        }
        
        switch (view) {
            case 'dashboard': return <AdminDashboard onNavigate={(v) => handleNavigate(v as View)} />;
            case 'userPortal': return <UserPortal onNavigate={(v) => handleNavigate(v as View)} />;
            case 'agentPortal': return <AgentPortal onNavigate={(v) => handleNavigate(v as View)} onViewClient={handleViewClient} onViewProperty={handleViewAgentProperty} selectedProperty={selectedProperty} selectedClient={selectedClient} />;
            case 'addProperty': return <AddProperty onPropertyAdded={() => handleNavigate('userPortal')} />;
            case 'editProperty': return <EditPropertyPage onBack={() => handleNavigate('userPortal')} />;
            case 'agents': return <AgentsPage />;
            case 'tracking': return <TrackingPage />;
            case 'userManagement': return <UserManagementPage />;
            case 'clients': return <ClientsPage />;
            case 'marketing': return <MarketingPage />;
            case 'analytics': return <AnalyticsPage />;
            case 'propertyDetail': return selectedProperty ? <PropertyDetailPage property={selectedProperty} onBack={handleBackToList} /> : homePage;
            case 'clientDetail': return selectedClient ? <ClientDetailPage client={selectedClient} onBack={() => handleNavigate('agentPortal')} /> : <AgentPortal onNavigate={(v) => handleNavigate(v as View)} onViewClient={handleViewClient} onViewProperty={handleViewAgentProperty} selectedProperty={selectedProperty} selectedClient={selectedClient} />;
            case 'agentPropertyDetail': return selectedProperty ? <AgentPropertyDetailPage property={selectedProperty} onBack={() => handleNavigate('agentPortal')} /> : <AgentPortal onNavigate={(v) => handleNavigate(v as View)} onViewClient={handleViewClient} onViewProperty={handleViewAgentProperty} selectedProperty={selectedProperty} selectedClient={selectedClient} />;
            case 'about': 
                console.log('App.tsx - Rendering AboutPage with handleNavigate:', handleNavigate);
                return <AboutPage 
                    onNavigate={(view: View) => {
                        console.log('App.tsx - AboutPage onNavigate called with view:', view);
                        handleNavigate(view);
                    }}
                    onNavigateToProperties={handleNavigateToProperties}
                />;
            case 'contact': return <ContactPage />;
            case 'servicios': return <ServiciosPage />;
            case 'home':
            default: return homePage;
        }
    };

    return (
        <div className="bg-white text-gray-800 font-sans">
            <Header onNavigate={handleNavigate} onLogout={handleLogout} onNavClick={handleNavClick} onOpenAppointmentModal={() => setAppointmentModalOpen(true)} />
            <main>
                {renderContent()}
            </main>
            {!isAuthenticated && <WhatsAppButton phoneNumber="524777871635" />}
            {!isAuthenticated && <Chatbot />}
            <Footer />
            {isAppointmentModalOpen && <AppointmentModal onClose={() => setAppointmentModalOpen(false)} />}
            <DataMigration />
            <SyncStatus isOnline={isOnline} lastSync={lastSync || undefined} />
        </div>
    );
}

const AppWrapper: React.FC = () => (
    <AuthProvider>
        <PropertyProvider>
            <ClientProvider>
                <CampaignProvider>
                    <App />
                </CampaignProvider>
            </ClientProvider>
        </PropertyProvider>
    </AuthProvider>
);

export default AppWrapper;
