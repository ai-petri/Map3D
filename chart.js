import * as THREE from "https://cdn.jsdelivr.net/npm/three/+esm";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/jsm/controls/OrbitControls.js';
import {FontLoader} from "https://cdn.jsdelivr.net/npm/three@0.159.0/examples/jsm/loaders/FontLoader.js";
import {TextGeometry} from "https://cdn.jsdelivr.net/npm/three@0.159.0/examples/jsm/geometries/TextGeometry.js";
 
import {get, fromLonLat, toLonLat}  from  'https://cdn.jsdelivr.net/npm/ol@10.2.1/proj/+esm';



export default function Chart(width = innerWidth, height = innerHeight, maxX = 10, maxY = 10, maxZ = 10, labelX = "X", labelY = "Y", labelZ = "Z")
{
    let loader = new FontLoader();
    let fontUrl = 'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/fonts/helvetiker_regular.typeface.json';
 
    let imageBitmapLoader = new THREE.ImageBitmapLoader();
    imageBitmapLoader.setOptions({ imageOrientation: 'flipY', crossOrigin:"anonymous" })
    
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff);
    document.body.appendChild(renderer.domElement);
    
    const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
    camera.position.set(5, 5, 20);
    camera.rotation.order = 'YXZ';
    const scene = new THREE.Scene();
    
    // lights
 
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.castShadow = true;
    directionalLight.shadowMapWidth = 1024;
    directionalLight.shadowMapHeight = 1024;
    scene.add( directionalLight );
 
    const pointLight = new THREE.PointLight(0xffffff, 20);
    pointLight.castShadow = true;
    pointLight.position.x = 5;
    pointLight.position.y = 10;
    pointLight.position.z = 5;
    scene.add(pointLight);
 
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
 
    // const axesHelper = new THREE.AxesHelper();
    // scene.add(axesHelper);
 
    //const orbitControls = new OrbitControls(camera, renderer.domElement);
 
    
    function animate() {
 
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
 
    this.drawBox = function(height, x = 0, z = 0, color = "blue")
    {
        var material = new THREE.MeshPhongMaterial({color});
        var geometry = new THREE.BoxGeometry(0.25,height,0.25);
        
        var box = new THREE.Mesh(geometry,material);
        box.position.x = x + 0.5;
        box.position.y = height/2;
        box.position.z = z + 0.5;
        scene.add(box);
    }
 
    this.drawLine = function(begin, end, color = 0x000000)
    {
        var material = new THREE.LineBasicMaterial({color});
        var geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...begin),
            new THREE.Vector3(...end)
        ]);
        var line = new THREE.Line(geometry,material);
        scene.add(line);
    }
 
    this.drawText = function(...words)
    {
        var material = new THREE.MeshPhongMaterial({color: 0x000000});
        loader.load(fontUrl, font => {
            for(let word of words)
            {
                let textGeometry = new TextGeometry(word[0],{font, size:0.5, height:0.01});
                let textMesh = new THREE.Mesh(textGeometry,material);
                textMesh.position.x = word[1];
                textMesh.position.y = word[2];
                textMesh.position.z = word[3];
                scene.add(textMesh);
            }
        })
    }
 
    this.drawScaleX = function(min,max, reversed=false, f)
    {
        var material = new THREE.MeshPhongMaterial({color: 0x000000});
        loader.load(fontUrl, font => {
            for(let x=1; x<maxX; x++)
            {
                let n = min + x*(max - min)/maxX;
                let str = (f && typeof f == "function") ? f(n) : n.toFixed(1);
                let textGeometry = new TextGeometry(str,{font, size:0.2, height:0.01});
                let textMesh = new THREE.Mesh(textGeometry,material);
                textMesh.position.x = reversed? maxX - x : x;
                textMesh.position.y = 0;
                textMesh.position.z = -0.1;
                textMesh.rotation.x = - Math.PI/2;
                scene.add(textMesh);
            }
        })
    }
 
    this.drawScaleZ = function(min, max, reversed=false, f)
    {
        var material = new THREE.MeshPhongMaterial({color: 0x000000});
        loader.load(fontUrl, font => {
            for(let z=1; z<maxZ; z++)
            {
                let n = min + z*(max - min)/maxZ;
                let str = (f && typeof f == "function") ? f(n) : n.toFixed(1);
                let textGeometry = new TextGeometry(str,{font, size:0.2, height:0.01});
                let textMesh = new THREE.Mesh(textGeometry,material);
                textMesh.position.x = -0.5;
                textMesh.position.y = 0;
                textMesh.position.z = reversed? maxZ - z : z;
                textMesh.rotation.x = - Math.PI/2;
                scene.add(textMesh);
            }
        })
    }
 
    this.drawScaleY = function(min, max, reversed=false, f)
    {
        var material = new THREE.MeshPhongMaterial({color: 0x000000});
 
        loader.load(fontUrl, font => {
            for(let y=1; y<maxY; y++)
            {
                let n = min + y*(max - min)/maxY;
                let str = (f && typeof f == "function") ? f(n) : n.toFixed(0);
                let textGeometry = new TextGeometry(str,{font, size:0.2, height:0.01});
                let textMesh = new THREE.Mesh(textGeometry,material);
                textMesh.position.x = 0.1;
                textMesh.position.y = (reversed? maxY - y : y) + 0.1;
                textMesh.position.z = 0;
                scene.add(textMesh);
            }
        })
    }
 
    this.drawLineString = function(arr)
    {
        let material = new THREE.LineBasicMaterial({color:0x0000ff});
        let points = arr.map(el=>new THREE.Vector3(el[0],el[1],el[2]));
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        let line = new THREE.Line(geometry, material);
        scene.add(line);
    }
 
    this.drawSurface = function(arr)
    {
        let material = new THREE.MeshBasicMaterial({color:0x0000ff, wireframe:true});
        let points = arr.map(el=>new THREE.Vector3(el[0],el[1],el[2]));
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        let surface = new THREE.Mesh(geometry, material);
        scene.add(surface);
    }
 
    this.drawFunction = function(f)
    {
        var material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        var points = []
 
        for(let x=0; x<maxX; x+=0.1)
        {
            let y = f(x);
            let z = 0;
            if(y<maxY)
            {
                points.push(new THREE.Vector3(x,y,z));
            }
        }
 
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        let line = new THREE.Line(geometry, material);
        scene.add(line);
 
    }
 
    this.drawCanvasXY = function(canvas)
    {
        let texture = new THREE.CanvasTexture(canvas)
        let geometry = new THREE.PlaneGeometry(maxX, maxY);
        let material = new THREE.MeshBasicMaterial({map: texture});
        let plane = new THREE.Mesh(geometry, material);
        plane.position.x = maxX/2;
        plane.position.y = maxY/2;
        scene.add(plane);
    }
 
    this.drawCanvasXZ = function(canvas)
    {
        let texture = new THREE.CanvasTexture(canvas)
        let geometry = new THREE.PlaneGeometry(maxX, maxY);
        let material = new THREE.MeshBasicMaterial({map: texture});
        let plane = new THREE.Mesh(geometry, material);
        plane.position.x = maxX/2;
        plane.position.y = 0;
        plane.position.z = maxZ/2;
        plane.rotation.x = - Math.PI/2;
        scene.add(plane);
    }
 
    this.drawCanvasYZ = function(canvas)
    {
        let texture = new THREE.CanvasTexture(canvas);
        let geometry = new THREE.PlaneGeometry(maxX, maxY);
        let material = new THREE.MeshBasicMaterial({map: texture});
        let plane = new THREE.Mesh(geometry, material);
        plane.position.x = 0;
        plane.position.y = maxY/2;
        plane.position.z = maxZ/2;
        plane.rotation.y = Math.PI/2;
        scene.add(plane);
    }
 
    this.drawImageXY = function(url)
    {
        imageBitmapLoader.load(url,
        function(bitmap){
            let texture = new THREE.CanvasTexture(bitmap)
            let geometry = new THREE.PlaneGeometry(maxX, maxY);
            let material = new THREE.MeshBasicMaterial({map: texture});
            let plane = new THREE.Mesh(geometry, material);
            plane.position.x = maxX/2;
            plane.position.y = maxY/2;
            scene.add(plane);
        })
    }
 
    this.drawImageXZ = function(url)
    {
        imageBitmapLoader.load(url,
        function(bitmap){
            let texture = new THREE.CanvasTexture(bitmap)
            let geometry = new THREE.PlaneGeometry(maxX, maxY);
            let material = new THREE.MeshBasicMaterial({map: texture});
            let plane = new THREE.Mesh(geometry, material);
            plane.position.x = maxX/2;
            plane.position.y = 0;
            plane.position.z = maxZ/2;
            plane.rotation.x = - Math.PI/2;
            scene.add(plane);
        })
    }
 
    this.drawImageYZ = function(url)
    {
        imageBitmapLoader.load(url,
        function(bitmap){
            let texture = new THREE.CanvasTexture(bitmap)
            let geometry = new THREE.PlaneGeometry(maxX, maxY);
            let material = new THREE.MeshBasicMaterial({map: texture});
            let plane = new THREE.Mesh(geometry, material);
            plane.position.x = 0;
            plane.position.y = maxY/2;
            plane.position.z = maxZ/2;
            plane.rotation.y = Math.PI/2;
            scene.add(plane);
        })
    }
 
    this.drawMap = async function(minLon, minLat, maxLon, maxLat, zoom = 8)
    {
 
        var extent = get("EPSG:3857").getExtent();
 
        var [x1,y1] = fromLonLat([minLon,minLat]);
        x1 = (x1 - extent[0])/(extent[2] - extent[0]);
        y1 = 1 - (y1 - extent[1])/(extent[3] - extent[1]);
 
        var [x2,y2] = fromLonLat([maxLon,maxLat]);
        x2 = (x2 - extent[0])/(extent[2] - extent[0]);
        y2 = 1 - (y2 - extent[1])/(extent[3] - extent[1]);
 
        var tileCount = Math.pow(2,zoom);
        
        var arrayX = [];
        for(let X=0; X<tileCount; X++)
        {
            
            if(x1 <= (X+1)/tileCount && x2 >= X/tileCount)
            {
                arrayX.push(X)
            }
        }
 
        var arrayY = [];
        for(let Y=0; Y<tileCount; Y++)
        {
            if(y2 <= (Y+1)/tileCount && y1 >= Y/tileCount)
            {
                arrayY.push(Y);
            }
        }
    
 
        var dx1 = 256*(x1*tileCount - arrayX[0]);
        var dx2 = 256*(arrayX[arrayX.length - 1] + 1 - x2*tileCount);
        var dy1 = 256*(y2*tileCount - arrayY[0]);
        var dy2 = 256*(arrayY[arrayY.length -1] + 1 - y1*tileCount); //TODO
 
        
 
        var canvas = document.createElement("canvas");
        canvas.width = 256*arrayX.length - dx1 - dx2;
        canvas.height = 256*arrayY.length - dy1 - dy2;
 
        var ctx = canvas.getContext("2d");
 
        for(let i=0; i<arrayX.length; i++)
        {
            for(let j=0; j<arrayY.length; j++)
            {
                var img = new Image();
                img.src = `https://tile-b.openstreetmap.fr/hot/${zoom}/${arrayX[i]}/${arrayY[j]}.png`;
                //img.src = `https://tiles.emodnet-bathymetry.eu/2020/baselayer/web_mercator/${zoom}/${arrayX[i]}/${arrayY[j]}.png`;
                img.crossOrigin = "anonymous";
                await img.decode();
                ctx.drawImage(img,256*i - dx1, 256*j - dy1);
            }
        }
        
 
        this.drawCanvasXZ(canvas);
 
        this.drawScaleX(minLon,maxLon,false,lon=>lon.toFixed(1)+"°");
        this.drawScaleZ(fromLonLat([0,minLat])[1], fromLonLat([0,maxLat])[1], true, lat=>toLonLat([0,lat])[1].toFixed(1)+"°");
    }
 
    this.drawDepth = async function (minLon, minLat, maxLon, maxLat, scale = 0.001, steps = 30)
    {
        async function getDepthProfile(start, end)
        {
            var response = await fetch(`https://rest.emodnet-bathymetry.eu/depth_profile?geom=LINESTRING(${start[0]} ${start[1]}, ${end[0]} ${end[1]})`);
            var arr = await response.json()
            return arr;
        }
        let min = fromLonLat([0,minLat])[1];
        let max = fromLonLat([0,maxLat])[1];
        
        for(let i=0; i<steps; i++)
        {
            let longitude = minLon+(maxLon - minLon)*i/steps;
            let arr = await getDepthProfile([longitude,minLat],[longitude,maxLat]);
            let points = arr.map((o,j)=>[maxX*i/steps, scale*o, maxZ*(1 - j/arr.length)]);
            this.drawLineString(points);
            await new Promise(resolve=>setTimeout(resolve,1000));
        }
        for(let i=0; i<steps; i++)
        {
            
            let latitude = toLonLat([0,min+(max-min)*i/steps])[1]; //todo
            let arr = await getDepthProfile([minLon,latitude],[maxLon,latitude]);
            let points = arr.map((o,j)=>[maxX*j/arr.length, scale*o, maxZ * (1 - i/steps)]);
            this.drawLineString(points);
            await new Promise(resolve=>setTimeout(resolve,1000));
        }
    }
 
    for(let i=0; i<maxX; i++)
    {
        this.drawLine([i+1,0,0],[i+1,maxY,0],0xcccccc);
        this.drawLine([i+1,0,0],[i+1,0,maxZ],0xcccccc);
    }
 
    for(let i=0; i<maxY; i++)
    {
        this.drawLine([0,i+1,0],[maxX,i+1,0],0xcccccc);
        this.drawLine([0,i+1,0],[0,i+1,maxZ],0xcccccc);
    }
     
    for(let i=0; i<maxZ; i++)
    {
        this.drawLine([0,0,i+1],[maxX,0,i+1],0xcccccc);
        this.drawLine([0,0,i+1],[0,maxY,i+1],0xcccccc);
    }
 
    this.drawLine([0,0,0],[maxX,0,0]);
    this.drawLine([0,0,0],[0,maxY,0]);
    this.drawLine([0,0,0],[0,0,maxZ]);
 
    this.drawText([labelX,maxX,0.2,0.2],[labelY,0.2,maxY,0.2],[labelZ,0.2,0.2,maxZ]);
 
    addEventListener("keydown", e=>{
        if(e.shiftKey)
        {
            switch(e.key)
            {
                case "ArrowDown":
                    e.preventDefault();
                    camera.rotation.x -= 0.05;
                    break;
 
                case "ArrowUp":
                    e.preventDefault();
                    camera.rotation.x += 0.05;
                    
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    camera.rotation.y += 0.05;
 
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    camera.rotation.y -= 0.05;
                    
            }
        }
        else
        {
            switch(e.key)
            {
                case "ArrowDown":
                    e.preventDefault();
                    camera.position.y -= 0.1*Math.cos(Math.PI/2 - camera.rotation.x);
                    camera.position.x += 0.1*Math.cos(Math.PI/2 - camera.rotation.y);
                    camera.position.z += 0.1*Math.sin(Math.PI/2 - camera.rotation.y);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    camera.position.y += 0.1*Math.cos(Math.PI/2 - camera.rotation.x);
                    camera.position.x -= 0.1*Math.cos(Math.PI/2 - camera.rotation.y);
                    camera.position.z -= 0.1*Math.sin(Math.PI/2 - camera.rotation.y);
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    camera.position.x -= 0.1*Math.sin(Math.PI/2 - camera.rotation.y);
                    camera.position.z += 0.1*Math.cos(Math.PI/2 - camera.rotation.y);
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    camera.position.x += 0.1*Math.sin(Math.PI/2 - camera.rotation.y);
                    camera.position.z -= 0.1*Math.cos(Math.PI/2 - camera.rotation.y);
                    
 
            }
        }
    })
 
    
 
    return this;
}