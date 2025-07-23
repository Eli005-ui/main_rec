document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const cam_id = document.getElementById("cam_id").value;
    const source = document.getElementById("source").value;
    const res = await fetch(`/add_camera?cam_id=${cam_id}&source=${encodeURIComponent(source)}`, { method: "POST" });
    if (res.ok) {
        loadCameras();
    } else {
        alert("Fehler beim Hinzufügen");
    }
});

async function loadCameras() {
    const res = await fetch("/list_cameras");
    const cams = await res.json();
    const container = document.getElementById("streams");
    container.innerHTML = "";

    cams.forEach(cam_id => {
        // Container für den Stream
        const streamContainer = document.createElement("div");
        streamContainer.className = "stream-container";
        streamContainer.id = cam_id;  // Wichtig für die reload-Funktion

        // Loader (wird während Neuladen angezeigt)
        const loader = document.createElement("div");
        loader.className = "loader";
        loader.style.display = "none";
        loader.innerHTML = "Lädt...";
        
        // Bild-Element
        const img = document.createElement("img");
        img.src = `/video/${cam_id}?t=${Date.now()}`;
        img.width = 640;
        img.height = 480;

        // Control-Buttons
        const controls = document.createElement("div");
        controls.className = "stream-controls";
        controls.innerHTML = `
            <button title="Löschen" onclick="deleteCamera('${cam_id}')">×</button>
            <button title="Neu laden" onclick="reloadCameraPrompt('${cam_id}')">↻</button>
        `;

        streamContainer.appendChild(loader);
        streamContainer.appendChild(img);
        streamContainer.appendChild(controls);
        container.appendChild(streamContainer);
    });
}

async function deleteCamera(cam_id) {
    const res = await fetch(`/remove_camera?cam_id=${cam_id}`, { method: "POST" });
    if (res.ok) {
        loadCameras(); // UI aktualisieren
    } else {
        alert("Fehler beim Löschen");
    }
}

async function reloadCamera(cam_id, source) {
    try {
        // 1. Kamera im Backend neu laden
        const res = await fetch(`/reload_camera?cam_id=${cam_id}&source=${encodeURIComponent(source)}`, {
            method: "POST"
        });
        
        if (!res.ok) throw new Error("Reload failed");
        
        // 2. Stream im UI aktualisieren
        const img = document.querySelector(`img[src^="/video/${cam_id}"]`);
        if (img) {
            img.src = `/video/${cam_id}?t=${Date.now()}`;
        }
    } catch (error) {
        console.error("Reload error:", error);
        alert("Neuladen fehlgeschlagen");
    }
}

// Globale Funktionen für die Button-Event-Handler
window.deleteCamera = async function(cam_id) {
    if (!confirm("Kamera wirklich löschen?")) return;
    const res = await fetch(`/remove_camera?cam_id=${cam_id}`, { method: "POST" });
    if (res.ok) loadCameras();
};

window.reloadCamera = async function(cam_id) {
    const source = prompt("Kameraquelle neu eingeben", document.getElementById("source").value);
    if (source) {
        showLoader(cam_id, true);
        await reloadCamera(cam_id, source);
        showLoader(cam_id, false);
    }
};

function showLoader(cam_id, show) {
    const container = document.getElementById(cam_id);
    if (container) {
        container.querySelector('.loader').style.display = show ? 'block' : 'none';
    }
}

loadCameras();
