import * as THREE from 'three';

const particleGeo = new THREE.BufferGeometry;
particleGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0]), 3));
function getPointsMaterial(size = 1, map = null){
    const material = new THREE.PointsMaterial({
        size,
        map,
        color: 0xffffff,
        transparent: true
    });
    // if(map) material.map = map;
    return material;
}
export function makeParticleMaterial(size, map){
    const particleMaterial = new THREE.Points(particleGeo, getPointsMaterial(size, map));
    return particleMaterial;
}
export function makeBall(radius = 15, w = 32, h = 16, size = 0.005, color = 0xffff00){
    const geometry = new THREE.SphereGeometry( radius, w, h ); 
    // const material = new THREE.MeshBasicMaterial( { color } ); 
    // const sphere = new THREE.Mesh( geometry, material );
    const material = new THREE.PointsMaterial( { size ,color } );
    const sphere = new THREE.Points( geometry, material );
    // sphere.scale(scale,scale);
    return sphere;
}