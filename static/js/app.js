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
        // Container für Stream + Buttons
        const streamContainer = document.createElement("div");
        streamContainer.className = "stream-container";
        
        // Bild-Element
        const img = document.createElement("img");
        img.src = `/video/${cam_id}?t=${Date.now()}`; // Cache-Busting
        img.width = 640;
        img.height = 480;
        
        // Button-Container
        const controls = document.createElement("div");
        controls.className = "stream-controls";
        
        // Löschen-Button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "×";
        deleteBtn.onclick = () => deleteCamera(cam_id);
        
        // Neu laden-Button
        const reloadBtn = document.createElement("button");
        reloadBtn.textContent = "↻";
        reloadBtn.onclick = () => reloadStream(img);
        
        controls.appendChild(deleteBtn);
        controls.appendChild(reloadBtn);
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

function reloadStream(imgElement) {
    // Cache-Busting durch Timestamp
    imgElement.src = imgElement.src.split('?')[0] + `?t=${Date.now()}`;
}

loadCameras();
