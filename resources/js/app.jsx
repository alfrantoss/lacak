import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link, NavLink, useParams, useNavigate } from 'react-router-dom';
import '../css/app.css';

// Navbar Component
function Navbar() {
    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-xl font-bold text-gray-900">Phishing Tracker</Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <NavLink to="/" className="border-transparent text-gray-500 hover:border-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</NavLink>
                            <NavLink to="/report" className="border-transparent text-gray-500 hover:border-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Report Phishing</NavLink>
                            <NavLink to="/reports" className="border-transparent text-gray-500 hover:border-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">All Reports</NavLink>
                            <NavLink to="/map" className="border-transparent text-gray-500 hover:border-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Map View</NavLink>
                            <NavLink to="/tracking" className="border-transparent text-gray-500 hover:border-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Tracking Links</NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

// API helper
const api = {
    async getReports(params = {}) {
        const qs = new URLSearchParams(params).toString();
        const res = await fetch(`/api/v1/phishing-reports?${qs}`);
        return res.json();
    },
    async getReport(id) {
        const res = await fetch(`/api/v1/phishing-reports/${id}`);
        return res.json();
    },
    async createReport(data) {
        const res = await fetch('/api/v1/phishing-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    async updateReport(id, data) {
        const res = await fetch(`/api/v1/phishing-reports/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    async deleteReport(id) {
        const res = await fetch(`/api/v1/phishing-reports/${id}`, {
            method: 'DELETE',
        });
        return res.ok;
    },
    // Tracking Links API
    async getTrackingLinks(params = {}) {
        const qs = new URLSearchParams(params).toString();
        const res = await fetch(`/api/v1/tracking-links?${qs}`);
        return res.json();
    },
    async getTrackingLink(id) {
        const res = await fetch(`/api/v1/tracking-links/${id}`);
        return res.json();
    },
    async createTrackingLink(data) {
        const res = await fetch('/api/v1/tracking-links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
    async deleteTrackingLink(id) {
        const res = await fetch(`/api/v1/tracking-links/${id}`, {
            method: 'DELETE',
        });
        return res.ok;
    },
};

// Dashboard Page
function Dashboard() {
    const [stats, setStats] = React.useState({ total: 0, pending: 0, verified: 0, resolved: 0 });
    const [recent, setRecent] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await api.getReports({ per_page: 5 });
            const all = await api.getReports({ per_page: 100 });
            const reports = all.data || [];
            setStats({
                total: reports.length,
                pending: reports.filter(r => r.status === 'pending').length,
                verified: reports.filter(r => r.status === 'verified').length,
                resolved: reports.filter(r => r.status === 'resolved').length,
            });
            setRecent(data.data || []);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Phishing Tracker Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Verified</h3>
                    <p className="text-3xl font-bold text-orange-600">{stats.verified}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
                    <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold p-6 border-b">Recent Reports</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reported</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recent.map((r) => (
                                <tr key={r.id}>
                                    <td className="px-6 py-4 text-sm"><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{r.url}</a></td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{r.domain}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'verified' ? 'bg-orange-100 text-orange-800' : r.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{r.status}</span></td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Report Phishing Page
function ReportPhishing() {
    const [formData, setFormData] = React.useState({ url: '', description: '', reporter_name: '', reporter_email: '' });
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            const result = await api.createReport(formData);
            if (result.id) {
                setSuccess('Report submitted successfully!');
                setTimeout(() => navigate(`/reports/${result.id}`), 1500);
            } else {
                setError(result.message || 'Failed to submit report');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Report Phishing Site</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phishing URL *</label>
                    <input type="url" name="url" value={formData.url} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="https://example-phishing-site.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Describe what makes this site suspicious..."></textarea>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input type="text" name="reporter_name" value={formData.reporter_name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                    <input type="email" name="reporter_email" value={formData.reporter_email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
}

// Reports List Page
function ReportsList() {
    const [reports, setReports] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');

    const loadReports = async () => {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (statusFilter) params.status = statusFilter;
        const data = await api.getReports(params);
        setReports(data.data || []);
        setLoading(false);
    };

    React.useEffect(() => { loadReports(); }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setTimeout(() => loadReports(), 500);
    };

    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
        loadReports();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this report?')) {
            await api.deleteReport(id);
            loadReports();
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">All Phishing Reports</h1>
            <div className="mb-6 flex gap-4">
                <input type="text" value={search} onChange={handleSearch} placeholder="Search by URL, domain, or IP..." className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                <select value={statusFilter} onChange={handleStatusChange} className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="false_positive">False Positive</option>
                </select>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {reports.map((r) => (
                            <tr key={r.id}>
                                <td className="px-6 py-4 text-sm"><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{r.url}</a></td>
                                <td className="px-6 py-4 text-sm text-gray-600">{r.domain}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{r.ip_address || '-'}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{r.country ? `${r.city}, ${r.country}` : '-'}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'verified' ? 'bg-orange-100 text-orange-800' : r.status === 'resolved' ? 'bg-green-100 text-green-800' : r.status === 'investigating' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{r.status}</span></td>
                                <td className="px-6 py-4 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm">
                                    <Link to={`/reports/${r.id}`} className="text-blue-600 hover:underline mr-2">View</Link>
                                    <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Report Detail Page
function ReportDetail() {
    const { id } = useParams();
    const [report, setReport] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [status, setStatus] = React.useState('');
    const navigate = useNavigate();

    React.useEffect(() => {
        const load = async () => {
            const data = await api.getReport(id);
            setReport(data);
            setStatus(data.status);
            setLoading(false);
        };
        load();
    }, [id]);

    const handleStatusUpdate = async () => {
        await api.updateReport(id, { status, verified_at: status === 'verified' ? new Date().toISOString() : null });
        const updated = await api.getReport(id);
        setReport(updated);
    };

    const handleDelete = async () => {
        if (window.confirm('Delete this report?')) {
            await api.deleteReport(id);
            navigate('/reports');
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!report) return <div className="text-center py-12">Report not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Report Details</h1>
                <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Delete Report</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Phishing Information</h2>
                    <div className="space-y-3">
                        <div><span className="font-medium text-gray-500">URL:</span> <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">{report.url}</a></div>
                        <div><span className="font-medium text-gray-500">Domain:</span> <span className="text-gray-900">{report.domain}</span></div>
                        <div><span className="font-medium text-gray-500">IP Address:</span> <span className="text-gray-900">{report.ip_address || 'N/A'}</span></div>
                        <div><span className="font-medium text-gray-500">Location:</span> <span className="text-gray-900">{report.country ? `${report.city}, ${report.country}` : 'N/A'}</span></div>
                        <div><span className="font-medium text-gray-500">Coordinates:</span> <span className="text-gray-900">{report.latitude && report.longitude ? `${report.latitude}, ${report.longitude}` : 'N/A'}</span></div>
                        <div><span className="font-medium text-gray-500">Reported:</span> <span className="text-gray-900">{new Date(report.created_at).toLocaleString()}</span></div>
                        <div><span className="font-medium text-gray-500">Description:</span> <p className="text-gray-900 mt-1">{report.description || 'No description provided.'}</p></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Screenshot</h2>
                    {report.screenshot_url ? (
                        <img src={report.screenshot_url} alt="Phishing site screenshot" className="w-full rounded-md border" />
                    ) : (
                        <div className="bg-gray-100 border-2 border-dashed rounded-md w-full h-64 flex items-center justify-center text-gray-500">No screenshot available</div>
                    )}
                    <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">Update Status</h3>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md mb-3">
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="investigating">Investigating</option>
                            <option value="resolved">Resolved</option>
                            <option value="false_positive">False Positive</option>
                        </select>
                        <button onClick={handleStatusUpdate} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Update Status</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Map View Page
function MapView() {
    const [reports, setReports] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            const data = await api.getReports({ per_page: 100 });
            setReports(data.data?.filter(r => r.latitude && r.longitude) || []);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) return <div className="text-center py-12">Loading map...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Phishing Sites Map</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <p className="text-gray-600 mb-4">{reports.length} phishing sites with location data shown on map.</p>
                <div className="space-y-2">
                    {reports.map((r) => (
                        <div key={r.id} className="border p-3 rounded-md">
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600">{r.domain}</a>
                            <span className="text-sm text-gray-500 ml-2">({r.latitude}, {r.longitude})</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-2">{r.country}</span>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">Note: Full interactive map requires Leaflet integration. Location data is displayed above.</p>
            </div>
        </div>
    );
}

// Tracking Links List Page
function TrackingLinks() {
    const [links, setLinks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [search, setSearch] = React.useState('');

    const loadLinks = async () => {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        const data = await api.getTrackingLinks(params);
        setLinks(data.data || []);
        setLoading(false);
    };

    React.useEffect(() => { loadLinks(); }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setTimeout(() => loadLinks(), 500);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this tracking link?')) {
            await api.deleteTrackingLink(id);
            loadLinks();
        }
    };

    if (loading) return <div className="text-center py-12">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Tracking Links</h1>
                <Link to="/tracking/create" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Create New</Link>
            </div>
            <div className="mb-6">
                <input type="text" value={search} onChange={handleSearch} placeholder="Search tracking links..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {links.map((link) => (
                            <tr key={link.id}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{link.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 break-all">{window.location.origin}/t/{link.slug}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 break-all">{link.target_url}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{link.captures_count || 0}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${link.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{link.is_active ? 'Active' : 'Inactive'}</span></td>
                                <td className="px-6 py-4 text-sm">
                                    <Link to={`/tracking/${link.id}`} className="text-blue-600 hover:underline mr-2">View</Link>
                                    <button onClick={() => handleDelete(link.id)} className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Create Tracking Link Page
function CreateTrackingLink() {
    const [formData, setFormData] = React.useState({ title: '', target_url: '', description: '' });
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const result = await api.createTrackingLink(formData);
            if (result.id) {
                navigate(`/tracking/${result.id}`);
            } else {
                setError(result.message || 'Failed to create tracking link');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        }
        setSubmitting(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Tracking Link</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="e.g., Fake Login Page" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target URL *</label>
                    <input type="url" name="target_url" value={formData.target_url} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="https://target-site.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" placeholder="Optional description..."></textarea>
                </div>
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50">
                    {submitting ? 'Creating...' : 'Create Tracking Link'}
                </button>
            </form>
        </div>
    );
}

// Tracking Link Detail Page
function TrackingLinkDetail() {
    const { id } = useParams();
    const [link, setLink] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const load = async () => {
            const data = await api.getTrackingLink(id);
            setLink(data);
            setLoading(false);
        };
        load();
    }, [id]);

    if (loading) return <div className="text-center py-12">Loading...</div>;
    if (!link) return <div className="text-center py-12">Tracking link not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{link.title}</h1>
                <Link to="/tracking" className="text-blue-600 hover:underline">Back to List</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-xl font-semibold mb-4">Tracking Link Details</h2>
                <div className="space-y-3">
                    <div><span className="font-medium text-gray-500">Tracking URL:</span> <span className="text-gray-900 break-all">{window.location.origin}/t/{link.slug}</span></div>
                    <div><span className="font-medium text-gray-500">Target URL:</span> <a href={link.target_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all">{link.target_url}</a></div>
                    <div><span className="font-medium text-gray-500">Status:</span> <span className={link.is_active ? 'text-green-600' : 'text-gray-600'}>{link.is_active ? 'Active' : 'Inactive'}</span></div>
                    <div><span className="font-medium text-gray-500">Total Captures:</span> <span className="text-gray-900">{link.captures?.length || 0}</span></div>
                    <div><span className="font-medium text-gray-500">Created:</span> <span className="text-gray-900">{new Date(link.created_at).toLocaleString()}</span></div>
                    {link.description && <div><span className="font-medium text-gray-500">Description:</span> <p className="text-gray-900 mt-1">{link.description}</p></div>}
                </div>
            </div>
            {link.captures && link.captures.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Captures</h2>
                    <div className="space-y-4">
                        {link.captures.map((capture) => (
                            <div key={capture.id} className="border rounded-md p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-medium text-gray-700 mb-2">Location Data</h3>
                                        <div className="space-y-1 text-sm">
                                            <div><span className="text-gray-500">IP:</span> {capture.ip_address || 'N/A'}</div>
                                            <div><span className="text-gray-500">Country:</span> {capture.country || 'N/A'}</div>
                                            <div><span className="text-gray-500">City:</span> {capture.city || 'N/A'}</div>
                                            <div><span className="text-gray-500">Region:</span> {capture.region || 'N/A'}</div>
                                            <div><span className="text-gray-500">ISP:</span> {capture.isp || 'N/A'}</div>
                                            <div><span className="text-gray-500">Coordinates:</span> {capture.latitude && capture.longitude ? `${capture.latitude}, ${capture.longitude}` : 'N/A'}</div>
                                            <div><span className="text-gray-500">Browser:</span> {capture.browser || 'N/A'}</div>
                                            <div><span className="text-gray-500">OS:</span> {capture.os || 'N/A'}</div>
                                            <div><span className="text-gray-500">Captured:</span> {capture.captured_at ? new Date(capture.captured_at).toLocaleString() : 'N/A'}</div>
                                        </div>
                                    </div>
                                    {capture.photo_url && (
                                        <div>
                                            <h3 className="font-medium text-gray-700 mb-2">Captured Photo</h3>
                                            <img src={capture.photo_url} alt="Captured" className="w-full rounded-md border" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Main App
function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/report" element={<ReportPhishing />} />
                    <Route path="/reports" element={<ReportsList />} />
                    <Route path="/reports/:id" element={<ReportDetail />} />
                    <Route path="/map" element={<MapView />} />
                    <Route path="/tracking" element={<TrackingLinks />} />
                    <Route path="/tracking/create" element={<CreateTrackingLink />} />
                    <Route path="/tracking/:id" element={<TrackingLinkDetail />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
