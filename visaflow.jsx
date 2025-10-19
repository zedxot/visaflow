import React, { useState, useMemo } from 'react';
import { User, Users, DollarSign, FileText, ChevronLeft, PlusCircle, Sparkles, BrainCircuit, MessageSquare, Clipboard, X, Briefcase, Receipt, TrendingUp, ArrowRightLeft, Target, ShieldCheck, CheckSquare, LogOut } from 'lucide-react';

// --- MOCK DATABASE ---
// In a real app, this data would come from a database with hashed passwords.

const initialAgents = [
    { id: 1, name: 'Alom 101', phone: '01712345678' },
    { id: 2, name: 'Habib Khan', phone: '01987654321' },
    { id: 3, name: 'RJ Travels', phone: '01811223344' },
    { id: 4, name: 'NF Overseas', phone: '01655443322' },
];

const initialTeam = [
    { id: 1, name: 'Admin User', role: 'Administrator', email: 'admin@visaflow.com', password: 'admin' },
    { id: 2, name: 'Sales Executive 1', role: 'Sales', email: 'sales1@visaflow.com', password: 'sales' },
    { id: 3, name: 'Sales Executive 2', role: 'Sales', email: 'sales2@visaflow.com', password: 'sales' },
];

const initialLeads = [
    { id: 1, name: 'Prospective Client A', phone: '01700000001', source: 'Facebook Ad', status: 'New', assignedToId: 2, notes: 'Interested in Dubai visa.', followUps: [{date: '2025-10-17', note: 'Initial lead created.'}] },
    { id: 2, name: 'Prospective Client B', phone: '01800000002', source: 'Agent Referral', status: 'Contacted', assignedToId: 3, notes: 'Called once, needs follow-up next week.', followUps: [{date: '2025-10-18', note: 'Called, client is busy. Asked to call back next week.'}, {date: '2025-10-17', note: 'Initial lead created.'}] },
    { id: 3, name: 'Prospective Client C', phone: '01900000003', source: 'Walk-in', status: 'Follow-up', assignedToId: 2, notes: 'Wants to bring passport on Monday.', followUps: [] },
    { id: 4, name: 'Prospective Client D', phone: '01600000004', source: 'Website', status: 'Qualified', assignedToId: 3, notes: 'Ready to pay booking money.', followUps: [] },
    { id: 5, name: 'Prospective Client E', phone: '01500000005', source: 'Facebook Ad', status: 'Lost', assignedToId: 2, notes: 'Found a cheaper option elsewhere.', followUps: [] },
    { id: 6, name: 'Prospective Client F', phone: '01700000006', source: 'Agent Referral', status: 'New', assignedToId: null, notes: 'New inquiry from Agent Habib.', followUps: [] },
];

const initialClients = [
    { id: 1, submissionDate: '2025-10-18', passportNo: 'A12345678', name: 'Md Alamger Kabir', agentId: 1, country: 'Saudi Arabia', job: 'Airport Job', provider: 'NF Overseas', totalFee: 500000, statuses: { passportBook: 'Yes', policeClearance: 'Yes', medicalFitCard: 'Yes', mofa: 'Done', fingure: 'Yes', visa: 'Pending', manpower: 'Pending', airTicket: 'Pending' }, payments: [{ date: '2025-10-10', amount: 200000, method: 'Bank' }, { date: '2025-10-15', amount: 150000, method: 'Cash' }], expenses: [{date: '2025-10-12', type: 'Medical', amount: 5500}, {date: '2025-10-15', type: 'Mofa', amount: 2100}, {date: '2025-10-17', type: 'Visa Fee', amount: 250000}] },
    { id: 2, submissionDate: '2025-10-16', passportNo: 'B98765432', name: 'MD Mohir Uddin', agentId: 1, country: 'Saudi Arabia', job: 'Free Visa', provider: 'RJ Travels', totalFee: 450000, statuses: { passportBook: 'Yes', policeClearance: 'Yes', medicalFitCard: 'Yes', mofa: 'Done', fingure: 'None', visa: 'No', manpower: 'No', airTicket: 'No' }, payments: [{ date: '2025-10-11', amount: 450000, method: 'Cash' }], expenses: [{date: '2025-10-11', type: 'Full Package', amount: 380000}] },
    { id: 3, submissionDate: '2025-10-17', passportNo: 'C45678901', name: 'Sourav Ahmed', agentId: null, country: 'United Arab Emirates', job: 'Salesman', provider: 'Habib Khan', totalFee: 480000, statuses: { passportBook: 'Yes', policeClearance: 'Yes', medicalFitCard: 'Yes', mofa: 'Done', fingure: 'Yes', visa: 'Pending', manpower: 'Pending', airTicket: 'Pending' }, payments: [{ date: '2025-10-12', amount: 100000, method: 'Bkash' }], expenses: [{date: '2025-10-13', type: 'Medical', amount: 6000}] },
];

// --- PERMISSIONS & ACCESS CONTROL ---
const ROLES = {
    ADMINISTRATOR: 'Administrator',
    SALES: 'Sales',
};

const PERMISSIONS = {
    [ROLES.ADMINISTRATOR]: {
        canSeeDashboard: true,
        canSeeLeads: true,
        canSeeClients: true,
        canSeeAgents: true,
        canSeeTransactions: true,
        canSeeTeam: true,
        canSeeFinancials: true, // Key permission for profit/expense
    },
    [ROLES.SALES]: {
        canSeeDashboard: true,
        canSeeLeads: true,
        canSeeClients: true,
        canSeeAgents: true,
        canSeeTransactions: false,
        canSeeTeam: false,
        canSeeFinancials: false, // Cannot see profit/expense
    }
};


// Helper function to calculate totals from arrays of objects
const calculateTotal = (items, key) => items.reduce((sum, item) => sum + item[key], 0);

// --- REUSABLE UI COMPONENTS ---
const Card = ({ children, className }) => <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>{children}</div>;
const StatCard = ({ icon, title, value, color }) => (
    <Card className="flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </Card>
);

// --- MODAL COMPONENTS ---
const Modal = ({ title, content, onClose }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(content).then(() => alert('Copied to clipboard!'));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                </div>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-gray-700 text-sm max-h-[60vh] overflow-y-auto">
                    {content}
                </div>
                <div className="mt-4 flex justify-end">
                    <button onClick={handleCopy} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition">
                        <Clipboard size={18} />
                        <span>Copy Text</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddTransactionModal = ({ client, type, onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const isExpense = type === 'expense';
    const title = isExpense ? `Add Expense for ${client.name}` : `Add Payment for ${client.name}`;
    const descriptionLabel = isExpense ? 'Purpose (e.g., Medical Fee)' : 'Payment Method (e.g., Cash)';
    const buttonLabel = isExpense ? 'Save Expense' : 'Save Payment';
    const buttonColor = isExpense ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !amount || !description) {
            alert('Please fill all fields.');
            return;
        }
        
        const transactionData = {
            date,
            amount: parseFloat(amount),
            [isExpense ? 'type' : 'method']: description
        };

        onSave(client.id, transactionData, type);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                        <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800"><X size={24} /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Amount (৳)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">{descriptionLabel}</label>
                            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button type="submit" className={`text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition ${buttonColor}`}>
                            <PlusCircle size={18} />
                            <span>{buttonLabel}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddLeadModal = ({ team, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [source, setSource] = useState('');
    const [assignedToId, setAssignedToId] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!name || !phone) {
            alert('Name and Phone are required.');
            return;
        }
        const newLead = {
            id: Date.now(),
            name,
            phone,
            source,
            status: 'New',
            assignedToId: assignedToId ? parseInt(assignedToId) : null,
            notes,
            followUps: [{ date: new Date().toISOString().slice(0, 10), note: 'Lead created.'}]
        };
        onSave(newLead);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Lead</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Source</label>
                            <input type="text" value={source} onChange={e => setSource(e.target.value)} placeholder="e.g., Facebook, Agent" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Assign To</label>
                             <select value={assignedToId} onChange={e => setAssignedToId(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                                <option value="">Unassigned</option>
                                {team.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                             </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Initial Notes</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"></textarea>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <PlusCircle size={18} />
                            <span>Save Lead</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
};

const AddClientModal = ({ agents, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        passportNo: '',
        agentId: '',
        provider: '',
        country: '',
        job: '',
        totalFee: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.passportNo || !formData.totalFee) {
            alert('Name, Passport No, and Total Fee are required.');
            return;
        }

        const newClient = {
            id: Date.now(),
            submissionDate: new Date().toISOString().slice(0, 10),
            ...formData,
            agentId: formData.agentId ? parseInt(formData.agentId) : null,
            totalFee: parseFloat(formData.totalFee),
            statuses: { passportBook: 'Pending', policeClearance: 'Pending', medicalFitCard: 'Pending', mofa: 'Pending', fingure: 'Pending', visa: 'Pending', manpower: 'Pending', airTicket: 'Pending' },
            payments: [],
            expenses: []
        };
        onSave(newClient);
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Client</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Passenger Name" className="border p-2 rounded-md" />
                        <input name="passportNo" value={formData.passportNo} onChange={handleChange} placeholder="Passport No" className="border p-2 rounded-md" />
                        <select name="agentId" value={formData.agentId} onChange={handleChange} className="border p-2 rounded-md">
                            <option value="">Direct Client</option>
                            {agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                        </select>
                        <input name="provider" value={formData.provider} onChange={handleChange} placeholder="Provider" className="border p-2 rounded-md" />
                        <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="border p-2 rounded-md" />
                        <input name="job" value={formData.job} onChange={handleChange} placeholder="Job" className="border p-2 rounded-md" />
                        <input name="totalFee" type="number" value={formData.totalFee} onChange={handleChange} placeholder="Total Fee (৳)" className="border p-2 rounded-md md:col-span-2" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Save Client</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddAgentModal = ({ onClose, onSave }) => {
     const [name, setName] = useState('');
     const [phone, setPhone] = useState('');

     const handleSubmit = (e) => {
         e.preventDefault();
         if (!name) {
             alert('Agent name is required.');
             return;
         }
         const newAgent = { id: Date.now(), name, phone };
         onSave(newAgent);
     };

     return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Agent</h2>
                    <div className="space-y-4">
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="Agent Name" className="border p-2 rounded-md w-full" />
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" className="border p-2 rounded-md w-full" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Save Agent</button>
                    </div>
                </form>
            </div>
        </div>
     );
};

const AddTeamModal = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email || !role || !password) {
            alert('All fields are required.');
            return;
        }
        const newMember = { id: Date.now(), name, email, role, password };
        onSave(newMember);
    };

    return (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md">
               <form onSubmit={handleSubmit}>
                   <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Team Member</h2>
                   <div className="space-y-4">
                       <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="border p-2 rounded-md w-full" />
                       <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="border p-2 rounded-md w-full" />
                       <select value={role} onChange={e => setRole(e.target.value)} className="border p-2 rounded-md w-full">
                           <option value="">Select Role</option>
                           <option value={ROLES.ADMINISTRATOR}>Administrator</option>
                           <option value={ROLES.SALES}>Sales</option>
                       </select>
                       <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="border p-2 rounded-md w-full" />
                   </div>
                   <div className="mt-6 flex justify-end space-x-3">
                       <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                       <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Save Team Member</button>
                   </div>
               </form>
           </div>
       </div>
    );
};

const LoginPage = ({ onLogin, error }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(email, password);
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md">
                <Card>
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-blue-600">VisaFlow</h1>
                        <p className="text-gray-500">Welcome back! Please log in.</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                            Login
                        </button>
                    </form>
                </Card>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---
export default function App() {
    const [clients, setClients] = useState(initialClients);
    const [agents, setAgents] = useState(initialAgents);
    const [team, setTeam] = useState(initialTeam);
    const [leads, setLeads] = useState(initialLeads);
    
    // Simulate user authentication
    const [currentUser, setCurrentUser] = useState(null); 
    const [loginError, setLoginError] = useState('');
    const permissions = currentUser ? PERMISSIONS[currentUser.role] : {};

    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);

    const [view, setView] = useState('dashboard');
    const [loadingState, setLoadingState] = useState({ reminder: false, steps: false, briefing: false });
    const [modalContent, setModalContent] = useState(null);
    const [transactionModal, setTransactionModal] = useState({ isOpen: false, type: null, client: null });
    const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
    const [addClientModalOpen, setAddClientModalOpen] = useState(false);
    const [addAgentModalOpen, setAddAgentModalOpen] = useState(false);
    const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);

    // --- Data Calculation & Helper Functions ---
    const totalClients = clients.length;
    const totalAgents = agents.length;
    const totalLeads = leads.length;
    const totalPaid = clients.reduce((sum, c) => sum + calculateTotal(c.payments, 'amount'), 0);
    const totalExpenses = clients.reduce((sum, c) => sum + calculateTotal(c.expenses, 'amount'), 0);
    const netProfit = totalPaid - totalExpenses;

    const getAgentName = (agentId) => agents.find(a => a.id === agentId)?.name || 'Direct Client';
    const getTeamMemberName = (teamId) => team.find(t => t.id === teamId)?.name || 'Unassigned';
    
    const topAgents = useMemo(() => agents.map(agent => ({
        ...agent,
        clientCount: clients.filter(c => c.agentId === agent.id).length
    })).sort((a, b) => b.clientCount - a.clientCount).slice(0, 5), [agents, clients]);

    const teamPerformance = useMemo(() => team.map(member => ({
        ...member,
        leadCount: leads.filter(l => l.assignedToId === member.id).length,
        statusBreakdown: leads.filter(l => l.assignedToId === member.id).reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {})
    })), [team, leads]);


    // --- State Update Handlers ---
    const handleLogin = (email, password) => {
        const user = team.find(u => u.email === email && u.password === password);
        if (user) {
            setCurrentUser(user);
            setView(PERMISSIONS[user.role].canSeeDashboard ? 'dashboard' : 'leads'); // Set default view
            setLoginError('');
        } else {
            setLoginError('Invalid email or password.');
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleSelectClient = (client) => setSelectedClient(client);
    const handleBackToClientList = () => setSelectedClient(null);

    const handleSelectLead = (lead) => setSelectedLead(lead);
    const handleBackToLeadBoard = () => setSelectedLead(null);
    
    const handleSaveLead = (newLead) => {
        setLeads(prev => [...prev, newLead]);
        setAddLeadModalOpen(false);
    };

    const handleSaveClient = (newClient) => {
        setClients(prev => [...prev, newClient]);
        setAddClientModalOpen(false);
    };

    const handleSaveAgent = (newAgent) => {
        setAgents(prev => [...prev, newAgent]);
        setAddAgentModalOpen(false);
    };
    
    const handleSaveTeamMember = (newMember) => {
        setTeam(prev => [...prev, newMember]);
        setAddTeamModalOpen(false);
    };

    const handleLeadDragEnd = (leadId, newStatus) => {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    };

    const handleAddFollowUp = (leadId, newNote) => {
        if (!newNote.trim()) return;

        const followUp = {
            date: new Date().toISOString().slice(0, 10),
            note: newNote,
        };

        const updateState = (items) => items.map(item => 
            item.id === leadId 
            ? { ...item, followUps: [followUp, ...item.followUps] } 
            : item
        );
        
        setLeads(updateState);
        if(selectedLead?.id === leadId) {
            setSelectedLead(prev => ({...prev, followUps: [followUp, ...prev.followUps]}));
        }
    };

    const handleStatusChange = (clientId, statusField, newValue) => {
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, statuses: { ...c.statuses, [statusField]: newValue } } : c));
    };
    
    const handleSaveTransaction = (clientId, transactionData, type) => {
        const dataKey = type === 'expense' ? 'expenses' : 'payments';
        setClients(prev => prev.map(c => c.id === clientId ? { ...c, [dataKey]: [...c[dataKey], transactionData] } : c));
        if (selectedClient?.id === clientId) {
             setSelectedClient(prev => ({...prev, [dataKey]: [...prev[dataKey], transactionData]}));
        }
        setTransactionModal({ isOpen: false, type: null, client: null });
    };

    // --- VIEW COMPONENTS ---
    const DashboardView = () => (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Agency Dashboard</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
                {permissions.canSeeLeads && <StatCard icon={<Target size={24} className="text-cyan-500" />} title="Active Leads" value={totalLeads} color="bg-cyan-100" />}
                {permissions.canSeeClients && <StatCard icon={<Users size={24} className="text-blue-500" />} title="Active Clients" value={totalClients} color="bg-blue-100" />}
                {permissions.canSeeAgents && <StatCard icon={<Briefcase size={24} className="text-purple-500" />} title="Total Agents" value={totalAgents} color="bg-purple-100" />}
                <StatCard icon={<DollarSign size={24} className="text-green-500" />} title="Total Paid" value={`৳${totalPaid.toLocaleString()}`} color="bg-green-100" />
                {permissions.canSeeFinancials && <StatCard icon={<Receipt size={24} className="text-red-500" />} title="Total Expenses" value={`৳${totalExpenses.toLocaleString()}`} color="bg-red-100" />}
                {permissions.canSeeFinancials && <StatCard icon={<TrendingUp size={24} className="text-indigo-500" />} title="Net Profit" value={`৳${netProfit.toLocaleString()}`} color="bg-indigo-100" />}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                     <h2 className="text-xl font-semibold mb-4 text-gray-700">Clients with Outstanding Balance</h2>
                     <div className="overflow-x-auto">
                         <table className="w-full text-left text-sm">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="p-2 font-semibold text-gray-600">Name</th>
                                    <th className="p-2 font-semibold text-gray-600">Agent</th>
                                    <th className="p-2 font-semibold text-gray-600">Balance Due</th>
                                </tr>
                            </thead>
                             <tbody>
                                {clients.filter(c => (c.totalFee - calculateTotal(c.payments, 'amount')) > 0).slice(0, 5).map(client => (
                                    <tr key={client.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectClient(client)}>
                                        <td className="p-2 font-semibold">{client.name}</td>
                                        <td className="p-2 text-gray-600">{getAgentName(client.agentId)}</td>
                                        <td className="p-2 text-red-600 font-medium">৳{(client.totalFee - calculateTotal(client.payments, 'amount')).toLocaleString()}</td>
                                    </tr>
                                ))}
                             </tbody>
                         </table>
                     </div>
                </Card>
                <Card>
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Top Agents by Client Referrals</h2>
                     <div className="space-y-3">
                        {topAgents.map(agent => (
                            <div key={agent.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                                <div>
                                    <p className="font-semibold">{agent.name}</p>
                                    <p className="text-xs text-gray-500">{agent.phone}</p>
                                </div>
                                <div className="text-right">
                                     <p className="font-bold text-lg text-blue-600">{agent.clientCount}</p>
                                     <p className="text-xs text-gray-500">Clients</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
    
    const LeadsView = () => {
        const leadStatuses = ['New', 'Contacted', 'Follow-up', 'Qualified', 'Lost'];
        
        const handleDragStart = (e, leadId) => e.dataTransfer.setData("leadId", leadId);
        const handleDrop = (e, newStatus) => {
            const leadId = parseInt(e.dataTransfer.getData("leadId"));
            handleLeadDragEnd(leadId, newStatus);
        };
        const handleDragOver = (e) => e.preventDefault();

        const statusColors = {
            'New': 'bg-blue-500', 'Contacted': 'bg-cyan-500', 'Follow-up': 'bg-yellow-500',
            'Qualified': 'bg-green-500', 'Lost': 'bg-red-500',
        };

        return (
            <div>
                 <div className="flex justify-between items-center mb-6">
                     <h1 className="text-3xl font-bold text-gray-800">Lead Management</h1>
                     <button onClick={() => setAddLeadModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition">
                        <PlusCircle size={20} />
                        <span>Add New Lead</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {leadStatuses.map(status => (
                        <div key={status} className="bg-gray-100 rounded-lg p-3" onDrop={(e) => handleDrop(e, status)} onDragOver={handleDragOver}>
                             <h3 className={`font-semibold mb-3 text-white p-2 rounded-md text-center ${statusColors[status]}`}>{status}</h3>
                             <div className="space-y-3 min-h-[50vh]">
                                {leads.filter(l => l.status === status).map(lead => (
                                    <div key={lead.id} draggable onDragStart={(e) => handleDragStart(e, lead.id)} onClick={() => handleSelectLead(lead)} className="bg-white p-3 rounded-md shadow cursor-pointer hover:shadow-lg transition">
                                        <p className="font-semibold text-sm">{lead.name}</p>
                                        <p className="text-xs text-gray-500">{lead.source}</p>
                                        <div className="text-xs mt-2 pt-2 border-t flex justify-between items-center">
                                            <span>Assigned to:</span>
                                            <span className="font-semibold">{getTeamMemberName(lead.assignedToId)}</span>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const LeadDetailView = ({ lead, onBack }) => {
        const [newNote, setNewNote] = useState('');

        const handleFollowUpSubmit = (e) => {
            e.preventDefault();
            handleAddFollowUp(lead.id, newNote);
            setNewNote('');
        };

        return(
            <div className="space-y-6">
                <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 font-semibold hover:underline">
                    <ChevronLeft size={20} />
                    <span>Back to Leads Board</span>
                </button>
                 <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{lead.name}</h1>
                        <p className="text-gray-500">{lead.phone}</p>
                    </div>
                    {lead.status === 'Qualified' && (
                        <button className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition">
                            <CheckSquare size={20} />
                            <span>Convert to Client</span>
                        </button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card><h3 className="font-semibold">Status</h3><p>{lead.status}</p></Card>
                    <Card><h3 className="font-semibold">Source</h3><p>{lead.source}</p></Card>
                    <Card><h3 className="font-semibold">Assigned To</h3><p>{getTeamMemberName(lead.assignedToId)}</p></Card>
                </div>
                
                <Card>
                    <h3 className="font-semibold text-lg mb-4">Follow-up History & Notes</h3>
                    <form onSubmit={handleFollowUpSubmit} className="mb-4">
                        <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows="3" placeholder="Add a new note or follow-up action..." className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                        <button type="submit" className="mt-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Add Note</button>
                    </form>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {lead.followUps.map((fu, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                                <p className="text-xs text-gray-500 font-semibold">{fu.date}</p>
                                <p className="text-sm">{fu.note}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        );
    };

    const ClientTrackerView = () => {
        const statusOptions = ['Pending', 'Yes', 'No', 'Done', 'None'];
        const statusFields = ['passportBook', 'policeClearance', 'medicalFitCard', 'mofa', 'fingure', 'visa', 'manpower', 'airTicket'];
    
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                     <h1 className="text-3xl font-bold text-gray-800">Client Tracker</h1>
                     <button onClick={() => setAddClientModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition">
                        <PlusCircle size={20} />
                        <span>Add New Client</span>
                    </button>
                </div>
                <Card className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="border-b bg-gray-50">
                                <tr>
                                    <th className="p-2 font-semibold text-gray-600">Passenger Name</th>
                                    <th className="p-2 font-semibold text-gray-600">Passport No</th>
                                    {permissions.canSeeFinancials && <th className="p-2 font-semibold text-gray-600">Total Expenses</th>}
                                    {permissions.canSeeFinancials && <th className="p-2 font-semibold text-gray-600">Net Profit</th>}
                                    {statusFields.map(field => <th key={field} className="p-2 font-semibold text-gray-600 capitalize">{field.replace(/([A-Z])/g, ' $1')}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map(client => {
                                    const clientExpenses = calculateTotal(client.expenses, 'amount');
                                    const clientProfit = calculateTotal(client.payments, 'amount') - clientExpenses;
                                    const profitColor = clientProfit >= 0 ? 'text-green-600' : 'text-red-600';
    
                                    return (
                                     <tr key={client.id} className="border-b hover:bg-gray-50">
                                        <td className="p-2 font-semibold text-blue-600 hover:underline cursor-pointer" onClick={() => handleSelectClient(client)}>{client.name}</td>
                                        <td className="p-2 font-mono">{client.passportNo}</td>
                                        {permissions.canSeeFinancials && <td className="p-2 font-medium text-red-600">৳{clientExpenses.toLocaleString()}</td>}
                                        {permissions.canSeeFinancials && <td className={`p-2 font-bold ${profitColor}`}>৳{clientProfit.toLocaleString()}</td>}
                                        {statusFields.map(field => (
                                            <td key={field} className="p-1">
                                                <select value={client.statuses[field]} onChange={(e) => handleStatusChange(client.id, field, e.target.value)} className={`text-xs p-1 rounded border-2 w-full`}>
                                                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </td>
                                        ))}
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );
    };

    const ClientDetailView = ({ client, onBack }) => {
        const totalPaid = calculateTotal(client.payments, 'amount');
        const balanceDue = client.totalFee - totalPaid;
        const totalExpenses = calculateTotal(client.expenses, 'amount');
        const netProfit = totalPaid - totalExpenses;
        const profitColor = netProfit >= 0 ? 'text-indigo-600' : 'text-red-600';
    
        return (
            <div className="space-y-6">
                 <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 font-semibold hover:underline">
                    <ChevronLeft size={20} />
                    <span>Back to Client Tracker</span>
                </button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>
                        <p className="text-gray-500 font-mono">{client.passportNo}</p>
                    </div>
                    <div className="flex space-x-2">
                        {permissions.canSeeFinancials && <button onClick={() => setTransactionModal({ isOpen: true, type: 'expense', client })} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 flex items-center space-x-2 transition">
                            <PlusCircle size={20} />
                            <span>Add Expense</span>
                        </button>}
                        <button onClick={() => setTransactionModal({ isOpen: true, type: 'payment', client })} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition">
                            <PlusCircle size={20} />
                            <span>Add Payment</span>
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <h3 className="font-semibold text-lg mb-4">Financials</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>Total Fee:</span> <span className="font-bold">৳{client.totalFee.toLocaleString()}</span></div>
                            <div className="flex justify-between text-green-600"><span>Total Paid:</span> <span className="font-bold">৳{totalPaid.toLocaleString()}</span></div>
                             {permissions.canSeeFinancials && <div className="flex justify-between text-red-600"><span>Total Expenses:</span> <span className="font-bold">৳{totalExpenses.toLocaleString()}</span></div>}
                             {permissions.canSeeFinancials && <div className={`flex justify-between font-bold ${profitColor}`}><span>Net Profit:</span> <span>৳{netProfit.toLocaleString()}</span></div>}
                            <div className="flex justify-between text-gray-600 pt-2 border-t"><span>Balance Due:</span> <span className="font-bold">৳{balanceDue.toLocaleString()}</span></div>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="font-semibold text-lg mb-4">Processing Status</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {Object.entries(client.statuses).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center capitalize">
                                    <span>{key.replace(/([A-Z])/g, ' $1')}:</span>
                                    <span>{value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        );
    };

    const AgentListView = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Agents</h1>
                <button onClick={() => setAddAgentModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition">
                    <PlusCircle size={20} />
                    <span>Add New Agent</span>
                </button>
            </div>
            <Card>
                <table className="w-full text-left">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="p-3 text-sm font-semibold text-gray-600">Agent Name</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Phone</th>
                            <th className="p-3 text-sm font-semibold text-gray-600">Referred Clients</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map(agent => (
                             <tr key={agent.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-semibold">{agent.name}</td>
                                <td className="p-3 font-mono text-sm">{agent.phone}</td>
                                <td className="p-3 font-bold text-blue-600 text-center">{clients.filter(c => c.agentId === agent.id).length}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
    
    const TransactionsView = () => {
        const [filter, setFilter] = useState('all');
    
        const allTransactions = useMemo(() => {
            const combined = [];
            clients.forEach(client => {
                client.payments.forEach(p => combined.push({ ...p, type: 'payment', clientName: client.name, passportNo: client.passportNo, details: p.method }));
                client.expenses.forEach(e => combined.push({ ...e, type: 'expense', clientName: client.name, passportNo: client.passportNo, details: e.type }));
            });
            return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
        }, [clients]);
    
        const filteredTransactions = allTransactions.filter(t => {
            if (filter === 'all') return true;
            return t.type === filter;
        });
    
        return (
             <div>
                <div className="flex justify-between items-center mb-6">
                     <h1 className="text-3xl font-bold text-gray-800">Transaction Log</h1>
                     <div className="flex space-x-2 p-1 bg-gray-200 rounded-lg">
                        <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === 'all' ? 'bg-white shadow' : 'text-gray-600'}`}>All</button>
                        <button onClick={() => setFilter('payment')} className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === 'payment' ? 'bg-white shadow' : 'text-gray-600'}`}>Payments</button>
                        <button onClick={() => setFilter('expense')} className={`px-3 py-1 text-sm font-semibold rounded-md ${filter === 'expense' ? 'bg-white shadow' : 'text-gray-600'}`}>Expenses</button>
                     </div>
                </div>
                <Card>
                    <table className="w-full text-left text-sm">
                         <thead className="border-b bg-gray-50">
                            <tr>
                                <th className="p-3 font-semibold text-gray-600">Date</th>
                                <th className="p-3 font-semibold text-gray-600">Client Name</th>
                                <th className="p-3 font-semibold text-gray-600">Passport No</th>
                                <th className="p-3 font-semibold text-gray-600">Type</th>
                                <th className="p-3 font-semibold text-gray-600">Details</th>
                                <th className="p-3 font-semibold text-gray-600 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((t, index) => (
                                <tr key={index} className="border-b">
                                    <td className="p-3 text-gray-600">{t.date}</td>
                                    <td className="p-3 font-semibold">{t.clientName}</td>
                                    <td className="p-3 font-mono">{t.passportNo}</td>
                                    <td className="p-3">
                                        {t.type === 'payment' 
                                            ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Payment</span> 
                                            : <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Expense</span>
                                        }
                                    </td>
                                    <td className="p-3 text-gray-600">{t.details}</td>
                                    <td className={`p-3 font-bold text-right ${t.type === 'payment' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'payment' ? '+' : '-'}৳{t.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            </div>
        );
    };
    
    const TeamView = () => (
         <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Team Performance</h1>
                <button onClick={() => setAddTeamModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition">
                    <PlusCircle size={20} />
                    <span>Add New Team Member</span>
                </button>
            </div>
            <Card>
                <div className="space-y-4">
                    {teamPerformance.map(member => (
                        <div key={member.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg">{member.name}</p>
                                    <p className="text-sm text-gray-600">{member.role}</p>
                                    <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-xl text-blue-600">{member.leadCount}</p>
                                    <p className="text-xs text-gray-500">Assigned Leads</p>
                                </div>
                            </div>
                            <div className="flex space-x-4 mt-3 pt-3 border-t text-xs">
                                {Object.entries(member.statusBreakdown).map(([status, count]) => (
                                    <div key={status}>
                                        <span className="font-semibold">{status}:</span> {count}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );

    // --- MAIN RENDER ---
    const MainContent = () => {
        if (selectedLead) return <LeadDetailView lead={selectedLead} onBack={handleBackToLeadBoard} />;
        if (selectedClient) return <ClientDetailView client={selectedClient} onBack={handleBackToClientList} />;
        
        switch (view) {
            case 'leads': return permissions.canSeeLeads ? <LeadsView /> : null;
            case 'team': return permissions.canSeeTeam ? <TeamView /> : null;
            case 'clients': return permissions.canSeeClients ? <ClientTrackerView /> : null;
            case 'agents': return permissions.canSeeAgents ? <AgentListView /> : null;
            case 'transactions': return permissions.canSeeTransactions ? <TransactionsView /> : null;
            default: return permissions.canSeeDashboard ? <DashboardView /> : <LeadsView />; // Default to leads for restricted users
        }
    };
    
    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} error={loginError} />;
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
             {modalContent && <Modal title={modalContent.title} content={modalContent.content} onClose={() => setModalContent(null)} />}
             {transactionModal.isOpen && <AddTransactionModal client={transactionModal.client} type={transactionModal.type} onClose={() => setTransactionModal({isOpen: false, type: null, client: null})} onSave={handleSaveTransaction} />}
             {addLeadModalOpen && <AddLeadModal team={team} onClose={() => setAddLeadModalOpen(false)} onSave={handleSaveLead} />}
             {addClientModalOpen && <AddClientModal agents={agents} onClose={() => setAddClientModalOpen(false)} onSave={handleSaveClient} />}
             {addAgentModalOpen && <AddAgentModal onClose={() => setAddAgentModalOpen(false)} onSave={handleSaveAgent} />}
             {addTeamModalOpen && <AddTeamModal onClose={() => setAddTeamModalOpen(false)} onSave={handleSaveTeamMember} />}


            <div className="flex">
                <nav className="w-64 bg-white shadow-lg h-screen sticky top-0 flex flex-col">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-blue-600">VisaFlow</h1>
                    </div>
                    <div className="flex-grow">
                        {permissions.canSeeDashboard && <a href="#" onClick={() => { setView('dashboard'); setSelectedClient(null); setSelectedLead(null); }} className={`flex items-center py-3 px-6 text-gray-700 hover:bg-gray-200 ${view === 'dashboard' && !selectedClient && !selectedLead ? 'bg-gray-200' : ''}`}>
                            <User size={20} className="mr-3" /> Dashboard
                        </a>}
                        {permissions.canSeeLeads && <a href="#" onClick={() => { setView('leads'); setSelectedClient(null); setSelectedLead(null); }} className={`flex items-center py-3 px-6 text-gray-700 hover:bg-gray-200 ${view === 'leads' || selectedLead ? 'bg-gray-200' : ''}`}>
                            <Target size={20} className="mr-3" /> Leads
                        </a>}
                        {permissions.canSeeClients && <a href="#" onClick={() => { setView('clients'); setSelectedClient(null); setSelectedLead(null); }} className={`flex items-center py-3 px-6 text-gray-700 hover:bg-gray-200 ${view === 'clients' || selectedClient ? 'bg-gray-200' : ''}`}>
                            <Users size={20} className="mr-3" /> Clients
                        </a>}
                        {permissions.canSeeAgents && <a href="#" onClick={() => { setView('agents'); setSelectedClient(null); setSelectedLead(null); }} className={`flex items-center py-3 px-6 text-gray-700 hover:bg-gray-200 ${view === 'agents' ? 'bg-gray-200' : ''}`}>
                            <Briefcase size={20} className="mr-3" /> Agents
                        </a>}
                         {permissions.canSeeTransactions && <a href="#" onClick={() => { setView('transactions'); setSelectedClient(null); setSelectedLead(null); }} className={`flex items-center py-3 px-6 text-gray-700 hover:bg-gray-200 ${view === 'transactions' ? 'bg-gray-200' : ''}`}>
                            <ArrowRightLeft size={20} className="mr-3" /> Transactions
                        </a>}
                        {permissions.canSeeTeam && <a href="#" onClick={() => { setView('team'); setSelectedClient(null); setSelectedLead(null); }} className={`flex items-center py-3 px-6 text-gray-700 hover:bg-gray-200 ${view === 'team' ? 'bg-gray-200' : ''}`}>
                            <ShieldCheck size={20} className="mr-3" /> Team
                        </a>}
                    </div>
                </nav>

                <main className="flex-1 flex flex-col h-screen">
                     <div className="bg-white p-4 border-b flex justify-between items-center">
                        <div></div> {/* Empty div for spacing */}
                        <div className="flex items-center">
                            <span className="text-sm mr-4">Welcome, <span className="font-semibold">{currentUser.name}</span></span>
                            <button onClick={handleLogout} className="flex items-center space-x-2 bg-red-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-red-600 text-sm transition">
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                     </div>
                    <div className="flex-1 p-8 overflow-y-auto">
                        <MainContent />
                    </div>
                </main>
            </div>
        </div>
    );
}

