async function loadCameras() {
    const res = await fetch("/list_cameras");
    const cams = await res.json();
    const container = document.getElementById("streams");
    container.innerHTML = "";
    cams.forEach(cam_id => {
        const img = document.createElement("img");
        img.src = `/video/${cam_id}`;
        img.width = 320;
        img.height = 240;
        container.appendChild(img);
    });
}

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

loadCameras();
