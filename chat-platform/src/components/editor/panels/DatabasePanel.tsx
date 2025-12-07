
"use client";

import { useState, useEffect } from "react";
import { Database, Plus, Save, Loader2, Play, CheckCircle2, AlertCircle, Trash2, Wrench } from "lucide-react";
import { useWidget } from "@/context/WidgetContext";

type Connection = {
    id?: string;
    name: string;
    type: "postgres" | "mysql";
    host: string;
    port: number;
    username: string;
    password?: string;
    database: string;
    ssl_mode: string;
};

type ActionParam = {
    type: string;
    description: string;
    required: boolean;
};

type Action = {
    id?: string;
    connection_id?: string;
    name: string;
    description: string;
    action_type: "database" | "api";
    sql_query?: string;
    api_config?: {
        url: string;
        method: string;
        headers?: Record<string, string>;
        body?: Record<string, any>;
    };
    parameters: Record<string, ActionParam>;
};

const API_URL = "http://localhost:8001";

export default function DatabasePanel() {
    const { projectId } = useWidget();
    const [activeView, setActiveView] = useState<"overview" | "add-connection" | "add-action">("overview");
    const [connections, setConnections] = useState<Connection[]>([]);
    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState(false);

    // Forms
    const [connForm, setConnForm] = useState<Connection>({
        name: "",
        type: "postgres",
        host: "",
        port: 5432,
        username: "",
        password: "",
        database: "",
        ssl_mode: "prefer"
    });

    const [actionForm, setActionForm] = useState<{
        connection_id: string;
        name: string;
        description: string;
        action_type: "database" | "api";
        sql_query: string;
        api_url: string;
        api_method: string;
        api_headers: string; // JSON
        api_body: string; // JSON
        paramsText: string; // JSON string for editing
    }>({
        connection_id: "",
        name: "",
        description: "",
        action_type: "database",
        sql_query: "SELECT * FROM table WHERE id = :id",
        api_url: "https://api.example.com/items/:id",
        api_method: "GET",
        api_headers: "{}",
        api_body: "{}",
        paramsText: '{\n  "id": {\n    "type": "string",\n    "description": "ID of the item",\n    "required": true\n  }\n}'
    });

    useEffect(() => {
        if (projectId) {
            loadData();
        }
    }, [projectId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [connsRes, actionsRes] = await Promise.all([
                fetch(`${API_URL}/projects/${projectId}/db-connection`),
                fetch(`${API_URL}/projects/${projectId}/actions`)
            ]);

            if (connsRes.ok) setConnections(await connsRes.json());
            if (actionsRes.ok) setActions(await actionsRes.json());
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConnection = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/projects/${projectId}/db-connection`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(connForm)
            });
            if (!res.ok) throw new Error("Failed to save");
            await loadData();
            setActiveView("overview");
            setConnForm({ ...connForm, password: "" });
        } catch (e) {
            alert("Failed to save connection: " + e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAction = async () => {
        setLoading(true);
        try {
            // Validate JSON params
            let params = {};
            try { params = JSON.parse(actionForm.paramsText); } catch (e) { alert("Invalid JSON parameters"); return; }

            let api_headers = {};
            if (actionForm.action_type === "api") {
                try { api_headers = JSON.parse(actionForm.api_headers); } catch (e) { alert("Invalid JSON headers"); return; }
            }

            let api_body = {};
            if (actionForm.action_type === "api" && ["POST", "PUT", "PATCH"].includes(actionForm.api_method)) {
                try { api_body = JSON.parse(actionForm.api_body); } catch (e) { alert("Invalid JSON body"); return; }
            }

            const payload: any = {
                name: actionForm.name,
                description: actionForm.description,
                action_type: actionForm.action_type,
                parameters: params
            };

            if (actionForm.action_type === "database") {
                payload.connection_id = actionForm.connection_id;
                payload.sql_query = actionForm.sql_query;
            } else {
                payload.api_config = {
                    url: actionForm.api_url,
                    method: actionForm.api_method,
                    headers: api_headers,
                    body: api_body
                };
            }

            const res = await fetch(`${API_URL}/projects/${projectId}/actions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to save action");

            await loadData();
            setActiveView("overview");
        } catch (e) {
            alert("Failed to save action: " + e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Database className="h-5 w-5 text-primary" />
                        Data Integrations
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Connect databases or external APIs for the agent to use.
                    </p>
                </div>
            </div>

            {/* Overview View */}
            {activeView === "overview" && (
                <div className="space-y-8">
                    {/* Connections Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Database Connections</h4>
                            <button
                                onClick={() => setActiveView("add-connection")}
                                className="text-xs flex items-center gap-1 text-primary hover:underline"
                            >
                                <Plus className="h-3 w-3" /> Add Connection
                            </button>
                        </div>

                        {connections.length === 0 ? (
                            <div className="text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 border-dashed">
                                <p className="text-sm text-gray-500">No databases connected.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {connections.map(conn => (
                                    <div key={conn.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                                                <Database className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{conn.name}</div>
                                                <div className="text-xs text-gray-500">{conn.type} • {conn.host}</div>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Active
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent Actions (Tools)</h4>
                            <button
                                onClick={() => {
                                    setActionForm(prev => ({ ...prev, connection_id: connections[0]?.id || "" }));
                                    setActiveView("add-action");
                                }}
                                className="text-xs flex items-center gap-1 text-primary hover:underline"
                            >
                                <Plus className="h-3 w-3" /> Add Action
                            </button>
                        </div>

                        {actions.length === 0 ? (
                            <div className="text-center py-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 border-dashed">
                                <p className="text-sm text-gray-500">No actions defined for the agent.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {actions.map(action => (
                                    <div key={action.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <Wrench className="h-4 w-4 text-orange-500" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">{action.name}</span>
                                                <span className={`text-[10px] px-1.5 rounded border ${action.action_type === 'api'
                                                    ? 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                                                    : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                                    }`}>
                                                    {action.action_type === 'api' ? 'API' : 'SQL'}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{action.description}</p>
                                        <div className="bg-gray-50 dark:bg-gray-900/50 p-2 rounded text-xs font-mono text-gray-600 dark:text-gray-300 overflow-x-auto">
                                            {action.action_type === 'database' ? action.sql_query : `${action.api_config?.method} ${action.api_config?.url}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Connection View */}
            {activeView === "add-connection" && (
                <div className="space-y-4 max-w-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">New Database Connection</h4>
                    {/* (Reusing previous form layout) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <input type="text" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="e.g. Main DB" value={connForm.name} onChange={e => setConnForm({ ...connForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Type</label>
                            <select className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                value={connForm.type} onChange={e => setConnForm({ ...connForm, type: e.target.value as any })}>
                                <option value="postgres">PostgreSQL</option>
                                <option value="mysql">MySQL</option>
                            </select>
                        </div>
                    </div>
                    {/* ... (Detailed fields similar to previous step, keeping brevity for prompt) ... */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Host</label>
                            <input type="text" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="localhost" value={connForm.host} onChange={e => setConnForm({ ...connForm, host: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Port</label>
                            <input type="number" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                placeholder="5432" value={connForm.port} onChange={e => setConnForm({ ...connForm, port: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Username</label>
                            <input type="text" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                value={connForm.username} onChange={e => setConnForm({ ...connForm, username: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input type="password" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                value={connForm.password} onChange={e => setConnForm({ ...connForm, password: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Database Name</label>
                        <input type="text" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                            value={connForm.database} onChange={e => setConnForm({ ...connForm, database: e.target.value })} />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button onClick={() => setActiveView("overview")} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                        <button onClick={handleSaveConnection} disabled={loading} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-2">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Save Connection
                        </button>
                    </div>
                </div>
            )}

            {/* Add Action View */}
            {activeView === "add-action" && (
                <div className="space-y-4 max-w-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">New Agent Action</h4>

                    {/* Action Type Selector */}
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Integration Type</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActionForm({ ...actionForm, action_type: "database" })}
                                className={`px-4 py-2 text-xs font-medium rounded-lg border flex-1 transition-colors ${actionForm.action_type === "database"
                                    ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                    : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50"
                                    }`}
                            >
                                Database Query (SQL)
                            </button>
                            <button
                                onClick={() => setActionForm({ ...actionForm, action_type: "api" })}
                                className={`px-4 py-2 text-xs font-medium rounded-lg border flex-1 transition-colors ${actionForm.action_type === "api"
                                    ? "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                                    : "border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50"
                                    }`}
                            >
                                API Request
                            </button>
                        </div>
                    </div>


                    {actionForm.action_type === "database" && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Target Database</label>
                            <select
                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                value={actionForm.connection_id}
                                onChange={e => setActionForm({ ...actionForm, connection_id: e.target.value })}
                            >
                                <option value="">Select Connection</option>
                                {connections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Action Name (Tool Name)</label>
                        <input type="text" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                            placeholder="e.g. get_menu_items"
                            value={actionForm.name}
                            onChange={e => setActionForm({ ...actionForm, name: e.target.value.replace(/\s+/g, '_') })}
                        />
                        <p className="text-[10px] text-gray-500">Validation: No spaces, use snake_case.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 h-20"
                            placeholder="Explain when the agent should use this tool..."
                            value={actionForm.description}
                            onChange={e => setActionForm({ ...actionForm, description: e.target.value })}
                        />
                    </div>

                    {actionForm.action_type === "database" && (
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300">SQL Query</label>
                            <textarea className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono h-24"
                                placeholder="SELECT * FROM table WHERE id = :id"
                                value={actionForm.sql_query}
                                onChange={e => setActionForm({ ...actionForm, sql_query: e.target.value })}
                            />
                            <p className="text-[10px] text-gray-500">Use <code>:param_name</code> for bindings.</p>
                        </div>
                    )}

                    {actionForm.action_type === "api" && (
                        <>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Method</label>
                                    <select
                                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                        value={actionForm.api_method}
                                        onChange={e => setActionForm({ ...actionForm, api_method: e.target.value })}
                                    >
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">URL</label>
                                    <input type="text" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                        placeholder="https://api.example.com/items/:id"
                                        value={actionForm.api_url}
                                        onChange={e => setActionForm({ ...actionForm, api_url: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Headers (JSON)</label>
                                <textarea className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono h-16"
                                    value={actionForm.api_headers}
                                    onChange={e => setActionForm({ ...actionForm, api_headers: e.target.value })}
                                />
                            </div>
                            {["POST", "PUT", "PATCH"].includes(actionForm.api_method) && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Body Template (JSON)</label>
                                    <textarea className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono h-24"
                                        placeholder='{"name": ":name", "quantity": :qty}'
                                        value={actionForm.api_body}
                                        onChange={e => setActionForm({ ...actionForm, api_body: e.target.value })}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Parameters (JSON Schema)</label>
                        <textarea className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 font-mono h-32"
                            value={actionForm.paramsText}
                            onChange={e => setActionForm({ ...actionForm, paramsText: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button onClick={() => setActiveView("overview")} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
                        <button onClick={handleSaveAction} disabled={loading} className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-2">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Save Action
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

