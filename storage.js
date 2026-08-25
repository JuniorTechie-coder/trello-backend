// Shared frontend storage and helper utilities for Trello Clone

const STORAGE_KEY = "trello_clone_data";
const ROLE_KEY = "trello_clone_role";

// Default initial seed data if nothing is in localStorage
const DEFAULT_DATA = {
    workspaces: [
        {
            id: "ws-1",
            name: "Main Workspace",
            boards: [
                {
                    id: "board-1",
                    name: "Project Sprint",
                    lists: [
                        {
                            id: "list-1",
                            name: "To Do",
                            cards: [
                                {
                                    id: "card-1",
                                    title: "Design Login Page",
                                    desc: "Create responsive UI mockup",
                                    priority: "High",
                                    assignee: "Tanmay"
                                },
                                {
                                    id: "card-2",
                                    title: "Create User API",
                                    desc: "Set up REST endpoints for user authentication",
                                    priority: "Medium",
                                    assignee: "Tanmay"
                                }
                            ]
                        },
                        {
                            id: "list-2",
                            name: "In Progress",
                            cards: [
                                {
                                    id: "card-3",
                                    title: "JWT Authentication",
                                    desc: "Generate and verify auth tokens",
                                    priority: "High",
                                    assignee: "Tanmay"
                                }
                            ]
                        },
                        {
                            id: "list-3",
                            name: "Completed",
                            cards: [
                                {
                                    id: "card-4",
                                    title: "User CRUD",
                                    desc: "Basic user setup and schema migration",
                                    priority: "Done",
                                    assignee: "Tanmay"
                                }
                            ]
                        }
                    ],
                    backlog: [
                        {
                            id: "card-5",
                            title: "Setup Database Indexes",
                            desc: "Optimize query performance for workspace and board lookups",
                            priority: "Low",
                            assignee: "Tanmay"
                        }
                    ]
                }
            ]
        }
    ]
};

// Retrieve data from localStorage or initialize with default data
function getData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.workspaces)) {
                return parsed;
            }
        }
    } catch (err) {
        console.error("Error reading from localStorage:", err);
    }
    saveData(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

// Persist data into localStorage
function saveData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        console.error("Error saving to localStorage:", err);
    }
}

// Helper to get URL query parameter
function qs(key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
}

// Helper to find a workspace by ID
function findWorkspace(data, wsId) {
    if (!data || !data.workspaces || !wsId) return null;
    return data.workspaces.find(ws => String(ws.id) === String(wsId)) || null;
}

// Helper to find a board by ID within a workspace
function findBoard(ws, boardId) {
    if (!ws || !ws.boards || !boardId) return null;
    return ws.boards.find(b => String(b.id) === String(boardId)) || null;
}

// Unique ID generator
function uid(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// Role management (Team Member vs Team Lead)
function getRole() {
    return localStorage.getItem(ROLE_KEY) || "member";
}

function setRole(role) {
    localStorage.setItem(ROLE_KEY, role);
}
