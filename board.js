let data = getData();
const wsId = qs("ws");
const boardId = qs("board");

const ws = findWorkspace(data, wsId);
const board = ws ? findBoard(ws, boardId) : null;

if (!ws || !board) {
    document.body.innerHTML = `
        <div class="empty-state" style="margin:60px auto;max-width:420px;text-align:center;">
            Board not found. <a href="workspace.html" style="color:var(--accent-pink);font-weight:700;">Go back to workspaces</a>.
        </div>`;
    throw new Error("Board not found");
}

board.lists = board.lists || [];
board.backlog = board.backlog || [];

document.getElementById("crumbWs").textContent = ws.name;
document.getElementById("crumbWs").href = `workspace.html?ws=${ws.id}`;
document.getElementById("crumbBoard").textContent = board.name;
document.getElementById("sidebarWsName").textContent = ws.name;
document.getElementById("boardTitle").textContent = board.name;
document.getElementById("boardBreadcrumb").textContent = `${ws.name} / ${board.name}`;

const boardListsEl = document.getElementById("boardLists");
const backlogCardsEl = document.getElementById("backlogCards");
const addBacklogCardBtn = document.getElementById("addBacklogCardBtn");
const backlogHint = document.getElementById("backlogHint");

let role = getRole();

/* ---------------- Theme Picker ---------------- */

const THEME_STORAGE_KEY = "trello_board_theme";
let currentTheme = localStorage.getItem(THEME_STORAGE_KEY) || "theme-sunset";
document.body.className = currentTheme;

const themeButtons = document.querySelectorAll(".theme-btn");
themeButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === currentTheme);
    btn.addEventListener("click", () => {
        currentTheme = btn.dataset.theme;
        document.body.className = currentTheme;
        localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
        themeButtons.forEach(b => b.classList.toggle("active", b === btn));
    });
});

/* ---------------- rendering ---------------- */

function persist() {
    saveData(data);
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function priorityClass(priority) {
    return "priority-" + (priority || "Medium").toLowerCase();
}

function cardEl(card, source, idx = 0) {
    const el = document.createElement("div");
    const prio = (card.priority || "Medium").toLowerCase();
    el.className = `card priority-${prio}-card` + (card.priority === "Done" ? " completed" : "");
    el.style.animationDelay = `${Math.min(idx * 0.04, 0.25)}s`;
    el.draggable = true;
    el.dataset.cardId = card.id;
    el.dataset.source = source; // list id, or "backlog"

    el.innerHTML = `
        <button class="card-delete" title="Delete card" aria-label="Delete card">&times;</button>
        <h4>${escapeHtml(card.title)}</h4>
        ${card.desc ? `<p>${escapeHtml(card.desc)}</p>` : ""}
        <div class="card-footer">
            <span class="badge ${priorityClass(card.priority)}">${escapeHtml(card.priority)}</span>
            <span title="Assignee" style="display:inline-flex;align-items:center;gap:3px;">
                <span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:#e2e8f0;text-align:center;line-height:16px;font-size:10px;font-weight:700;color:#475569;">
                    ${(card.assignee || "U").charAt(0).toUpperCase()}
                </span>
                ${escapeHtml(card.assignee || "Unassigned")}
            </span>
        </div>
    `;

    el.addEventListener("dragstart", e => {
        el.classList.add("dragging");
        e.dataTransfer.setData("text/plain", JSON.stringify({ cardId: card.id, source }));
        e.dataTransfer.effectAllowed = "move";
    });
    
    el.addEventListener("dragend", () => {
        el.classList.remove("dragging");
        document.querySelectorAll(".drop-target").forEach(zone => zone.classList.remove("drop-target"));
    });

    el.querySelector(".card-delete").addEventListener("click", ev => {
        ev.stopPropagation();
        el.style.transform = "scale(0.85)";
        el.style.opacity = "0";
        setTimeout(() => deleteCard(card.id, source), 120);
    });

    return el;
}

function renderBoard() {
    boardListsEl.innerHTML = "";

    board.lists.forEach((list, listIdx) => {
        const listEl = document.createElement("div");
        listEl.className = "list";
        listEl.dataset.listId = list.id;
        listEl.style.animationDelay = `${Math.min(listIdx * 0.05, 0.25)}s`;

        listEl.innerHTML = `
            <div class="list-header">
                <h3>${escapeHtml(list.name)}</h3>
                <span>${list.cards.length}</span>
            </div>
            <div class="cards" data-list-id="${list.id}"></div>
            <button class="add-card">+ Add a card</button>
        `;

        const cardsContainer = listEl.querySelector(".cards");
        list.cards.forEach((card, cardIdx) => cardsContainer.appendChild(cardEl(card, list.id, cardIdx)));

        registerDropZone(cardsContainer, list.id, "list");

        listEl.querySelector(".add-card").addEventListener("click", () => {
            openCardModal({ target: "list", listId: list.id });
        });

        boardListsEl.appendChild(listEl);
    });

    const addListBtn = document.createElement("button");
    addListBtn.className = "add-list";
    addListBtn.innerHTML = `<span>+</span> Add another list`;
    addListBtn.addEventListener("click", openListModal);
    boardListsEl.appendChild(addListBtn);
}

function renderBacklog() {
    backlogCardsEl.innerHTML = "";
    addBacklogCardBtn.hidden = role !== "lead";
    backlogHint.textContent = role === "lead"
        ? "Stage upcoming work here for the team to pick up."
        : "Drag a card into an active list to start working on it.";

    if (board.backlog.length === 0) {
        backlogCardsEl.innerHTML = `<div class="empty-state small">Backlog is empty. ${role === "lead" ? "Click '+ Stage Card' to add tasks." : ""}</div>`;
    } else {
        board.backlog.forEach((card, cardIdx) => backlogCardsEl.appendChild(cardEl(card, "backlog", cardIdx)));
    }

    registerDropZone(backlogCardsEl, "backlog", "backlog");
}

function render() {
    renderBoard();
    renderBacklog();
}

/* ---------------- drag & drop ---------------- */

function registerDropZone(el, ownerId, kind) {
    el.addEventListener("dragover", e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        el.classList.add("drop-target");
    });
    el.addEventListener("dragleave", e => {
        if (!el.contains(e.relatedTarget)) {
            el.classList.remove("drop-target");
        }
    });
    el.addEventListener("drop", e => {
        e.preventDefault();
        el.classList.remove("drop-target");
        try {
            const payload = JSON.parse(e.dataTransfer.getData("text/plain"));
            moveCard(payload.cardId, payload.source, ownerId);
        } catch (err) {
            console.error("Drop parsing error:", err);
        }
    });
}

function findCardAndRemove(source) {
    if (source === "backlog") {
        return { list: board.backlog, take(cardId) {
            const idx = board.backlog.findIndex(c => c.id === cardId);
            if (idx === -1) return null;
            return board.backlog.splice(idx, 1)[0];
        }};
    }
    const list = board.lists.find(l => l.id === source);
    return { list: list ? list.cards : [], take(cardId) {
        if (!list) return null;
        const idx = list.cards.findIndex(c => c.id === cardId);
        if (idx === -1) return null;
        return list.cards.splice(idx, 1)[0];
    }};
}

function moveCard(cardId, source, target) {
    if (source === target) return;

    const { take } = findCardAndRemove(source);
    const card = take(cardId);
    if (!card) return;

    if (target === "backlog") {
        board.backlog.push(card);
    } else {
        const targetList = board.lists.find(l => l.id === target);
        if (!targetList) {
            if (source === "backlog") board.backlog.push(card);
            else {
                const src = board.lists.find(l => l.id === source);
                if (src) src.cards.push(card);
            }
            return;
        }
        targetList.cards.push(card);
    }

    persist();
    render();
}

function deleteCard(cardId, source) {
    const { take } = findCardAndRemove(source);
    take(cardId);
    persist();
    render();
}

/* ---------------- role toggle ---------------- */

document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        role = btn.dataset.role;
        setRole(role);
        document.querySelectorAll(".role-btn").forEach(b => b.classList.toggle("active", b === btn));
        renderBacklog();
    });
});
document.querySelectorAll(".role-btn").forEach(b => b.classList.toggle("active", b.dataset.role === role));

/* ---------------- card modal (add card to a list or the backlog) ---------------- */

const cardModalOverlay = document.getElementById("cardModalOverlay");
const cardTitleInput = document.getElementById("cardTitleInput");
const cardDescInput = document.getElementById("cardDescInput");
const cardPriorityInput = document.getElementById("cardPriorityInput");
const cardAssigneeInput = document.getElementById("cardAssigneeInput");

let cardModalContext = null;

function openCardModal(context) {
    cardModalContext = context;
    cardTitleInput.value = "";
    cardDescInput.value = "";
    cardPriorityInput.value = "Medium";
    cardAssigneeInput.value = "";
    cardModalOverlay.hidden = false;
    setTimeout(() => cardTitleInput.focus(), 50);
}

function closeCardModal() {
    cardModalOverlay.hidden = true;
    cardModalContext = null;
}

document.getElementById("cardModalCancel").addEventListener("click", closeCardModal);
cardModalOverlay.addEventListener("click", e => { if (e.target === cardModalOverlay) closeCardModal(); });

document.getElementById("cardModalConfirm").addEventListener("click", () => {
    const title = cardTitleInput.value.trim();
    if (!title) { cardTitleInput.focus(); return; }

    const newCard = {
        id: uid("card"),
        title,
        desc: cardDescInput.value.trim(),
        priority: cardPriorityInput.value,
        assignee: cardAssigneeInput.value.trim() || "Tanmay"
    };

    if (cardModalContext.target === "list") {
        const list = board.lists.find(l => l.id === cardModalContext.listId);
        list.cards.push(newCard);
    } else if (cardModalContext.target === "backlog") {
        board.backlog.push(newCard);
    }

    persist();
    render();
    closeCardModal();
});

cardTitleInput.addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("cardModalConfirm").click();
    if (e.key === "Escape") closeCardModal();
});

addBacklogCardBtn.addEventListener("click", () => openCardModal({ target: "backlog" }));

/* ---------------- list modal (add list) ---------------- */

const listModalOverlay = document.getElementById("listModalOverlay");
const listNameInput = document.getElementById("listNameInput");

function openListModal() {
    listNameInput.value = "";
    listModalOverlay.hidden = false;
    setTimeout(() => listNameInput.focus(), 50);
}
function closeListModal() {
    listModalOverlay.hidden = true;
}

document.getElementById("listModalCancel").addEventListener("click", closeListModal);
listModalOverlay.addEventListener("click", e => { if (e.target === listModalOverlay) closeListModal(); });

document.getElementById("listModalConfirm").addEventListener("click", () => {
    const name = listNameInput.value.trim();
    if (!name) { listNameInput.focus(); return; }
    board.lists.push({ id: uid("list"), name, cards: [] });
    persist();
    render();
    closeListModal();
});

listNameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("listModalConfirm").click();
    if (e.key === "Escape") closeListModal();
});

render();
