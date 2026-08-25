let data = getData();

const workspacesView = document.getElementById("workspacesView");
const boardsView = document.getElementById("boardsView");
const workspaceGrid = document.getElementById("workspaceGrid");
const boardGrid = document.getElementById("boardGrid");
const boardsWsName = document.getElementById("boardsWsName");
const crumbWorkspaces = document.getElementById("crumbWorkspaces");
const crumbSep = document.getElementById("crumbSep");
const crumbBoardWs = document.getElementById("crumbBoardWs");

let activeWsId = qs("ws");

function render() {
    data = getData();

    if (activeWsId && findWorkspace(data, activeWsId)) {
        renderBoardsView();
    } else {
        activeWsId = null;
        renderWorkspacesView();
    }
}

function renderWorkspacesView() {
    workspacesView.hidden = false;
    boardsView.hidden = true;
    crumbSep.hidden = true;
    crumbBoardWs.hidden = true;

    workspaceGrid.innerHTML = "";

    if (!data.workspaces || data.workspaces.length === 0) {
        workspaceGrid.innerHTML = `<div class="empty-state">No workspaces yet — create your first one to start adding boards.</div>`;
        return;
    }

    data.workspaces.forEach((ws, idx) => {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.style.animationDelay = `${Math.min(idx * 0.05, 0.3)}s`;
        const boardCount = (ws.boards || []).length;
        tile.innerHTML = `
            <div>
                <h3>${escapeHtml(ws.name)}</h3>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px;">
                <span class="muted" style="font-size:13px; font-weight:500;">📁 ${boardCount} board${boardCount === 1 ? "" : "s"}</span>
                <span style="color:var(--primary); font-size:13px; font-weight:600;">Open &rarr;</span>
            </div>
        `;
        tile.addEventListener("click", () => {
            activeWsId = ws.id;
            history.pushState({}, "", `workspace.html?ws=${ws.id}`);
            render();
        });
        workspaceGrid.appendChild(tile);
    });
}

function renderBoardsView() {
    const ws = findWorkspace(data, activeWsId);
    if (!ws) {
        activeWsId = null;
        renderWorkspacesView();
        return;
    }

    workspacesView.hidden = true;
    boardsView.hidden = false;
    crumbSep.hidden = false;
    crumbBoardWs.hidden = false;
    crumbBoardWs.textContent = ws.name;

    boardsWsName.textContent = ws.name;
    boardGrid.innerHTML = "";

    const boards = ws.boards || [];
    if (boards.length === 0) {
        boardGrid.innerHTML = `<div class="empty-state">No boards yet — add one to start organizing tasks.</div>`;
        return;
    }

    boards.forEach((board, idx) => {
        const tile = document.createElement("a");
        tile.className = "tile board-tile";
        tile.style.animationDelay = `${Math.min(idx * 0.05, 0.3)}s`;
        tile.href = `board.html?ws=${ws.id}&board=${board.id}`;
        const cardCount = (board.lists || []).reduce((sum, l) => sum + ((l && l.cards) ? l.cards.length : 0), 0);
        tile.innerHTML = `
            <div>
                <h3>${escapeHtml(board.name)}</h3>
            </div>
            <div style="margin-top:14px;">
                <p class="muted">${(board.lists || []).length} lists · ${cardCount} cards</p>
            </div>
        `;
        boardGrid.appendChild(tile);
    });
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

crumbWorkspaces.addEventListener("click", () => {
    activeWsId = null;
    history.pushState({}, "", "workspace.html");
    render();
});

/* ---------- generic modal for "new workspace" / "new board" ---------- */

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalInput = document.getElementById("modalInput");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");

let modalOnConfirm = null;

function openModal(title, onConfirm) {
    modalTitle.textContent = title;
    modalInput.value = "";
    modalOnConfirm = onConfirm;
    modalOverlay.hidden = false;
    setTimeout(() => modalInput.focus(), 50);
}

function closeModal() {
    modalOverlay.hidden = true;
    modalOnConfirm = null;
}

modalCancel.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", e => {
    if (e.target === modalOverlay) closeModal();
});
modalConfirm.addEventListener("click", submitModal);
modalInput.addEventListener("keydown", e => {
    if (e.key === "Enter") submitModal();
    if (e.key === "Escape") closeModal();
});

function submitModal() {
    const value = modalInput.value.trim();
    if (!value) {
        modalInput.focus();
        return;
    }
    if (modalOnConfirm) modalOnConfirm(value);
    closeModal();
}

document.getElementById("newWorkspaceBtn").addEventListener("click", () => {
    openModal("New workspace", name => {
        data.workspaces = data.workspaces || [];
        data.workspaces.push({ id: uid("ws"), name, boards: [] });
        saveData(data);
        render();
    });
});

document.getElementById("newBoardBtn").addEventListener("click", () => {
    openModal("New board", name => {
        const ws = findWorkspace(data, activeWsId);
        if (!ws) return;
        ws.boards = ws.boards || [];
        ws.boards.push({
            id: uid("board"),
            name,
            lists: [
                { id: uid("list"), name: "To Do", cards: [] },
                { id: uid("list"), name: "In Progress", cards: [] },
                { id: uid("list"), name: "Completed", cards: [] }
            ],
            backlog: []
        });
        saveData(data);
        render();
    });
});

window.addEventListener("popstate", () => {
    activeWsId = qs("ws");
    render();
});

render();
