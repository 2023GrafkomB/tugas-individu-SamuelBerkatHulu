let controls = new THREE.OrbitControls(camera);
controls.addEventListener('change', renderer);
controls.minDistance = 500;
controls.maxDistance = 1500;