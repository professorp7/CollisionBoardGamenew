import { useLocation } from "wouter";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  
  const tabs = [
    { id: 'characters', label: 'Characters', icon: 'user-alt', path: '/characters' },
    { id: 'teams', label: 'Teams', icon: 'users', path: '/teams' },
    { id: 'battle', label: 'Battle', icon: 'gamepad', path: '/battle' },
    { id: 'dice', label: 'Dice', icon: 'dice-d20', path: '/dice' },
  ];
  
  const isActive = (path: string) => {
    return location === path || (location === '/' && path === '/characters');
  };

  return (
    <div className="mb-8">
      <nav className="flex border-b border-gray-300">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn px-6 py-3 font-heading font-medium text-lg border-b-2 transition
              ${isActive(tab.path) 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-600 hover:text-primary'}`}
            onClick={() => setLocation(tab.path)}
          >
            <i className={`fas fa-${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
