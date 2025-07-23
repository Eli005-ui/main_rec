document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const cam_id = document.getElementById("cam_id").value;
    const source = document.getElementById("source").value;
    const res = await fetch(`/add_camera?cam_id=${cam_id}&source=${encodeURIComponent(source)}`, { 
        method: "POST" 
    });
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
        const streamContainer = document.createElement("div");
        streamContainer.className = "stream-container";
        streamContainer.id = cam_id;

        // Loader
        const loader = document.createElement("div");
        loader.className = "loader";
        loader.style.display = "none";
        loader.textContent = "Lädt...";

        // Image
        const img = document.createElement("img");
        img.src = `/video/${cam_id}?t=${Date.now()}`;
        img.width = 640;
        img.height = 480;

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "×";
        deleteBtn.title = "Löschen";
        deleteBtn.addEventListener("click", async () => {
            if (confirm("Kamera wirklich löschen?")) {
                const res = await fetch(`/remove_camera?cam_id=${cam_id}`, { 
                    method: "POST" 
                });
                if (res.ok) loadCameras();
            }
        });

        // Reload Button
        const reloadBtn = document.createElement("button");
        reloadBtn.textContent = "↻";
        reloadBtn.title = "Neu laden";
        reloadBtn.addEventListener("click", async () => {
            const source = prompt("Kameraquelle neu eingeben", document.getElementById("source").value);
            if (source) {
                showLoader(cam_id, true);
                try {
                    const res = await fetch(`/reload_camera?cam_id=${cam_id}&source=${encodeURIComponent(source)}`, {
                        method: "POST"
                    });
                    if (res.ok) {
                        img.src = `/video/${cam_id}?t=${Date.now()}`;
                    } else {
                        alert("Neuladen fehlgeschlagen");
                    }
                } catch (error) {
                    console.error("Fehler:", error);
                    alert("Fehler beim Neuladen");
                } finally {
                    showLoader(cam_id, false);
                }
            }
        });

        // Controls Container
        const controls = document.createElement("div");
        controls.className = "stream-controls";
        controls.append(deleteBtn, reloadBtn);

        streamContainer.append(loader, img, controls);
        container.appendChild(streamContainer);
    });
}

function showLoader(cam_id, show) {
    const container = document.getElementById(cam_id);
    if (container) {
        container.querySelector('.loader').style.display = show ? 'block' : 'none';
    }
}

// Initial load
loadCameras();